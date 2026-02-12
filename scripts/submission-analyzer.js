#!/usr/bin/env node
/**
 * Submission Analyzer
 *
 * Downloads student submissions from Canvas, analyzes them with an LLM,
 * and generates a dashboard with participation/quality ratings.
 *
 * Privacy: Student names are mapped to anonymized IDs before LLM analysis.
 * The ID mapping stays in the private data repo, never sent to the LLM.
 *
 * Usage:
 *   node scripts/submission-analyzer.js --action=download --course=cst349 --data-dir=../Common-Curriculum-Data
 *   node scripts/submission-analyzer.js --action=analyze --course=cst349 --data-dir=../Common-Curriculum-Data
 *   node scripts/submission-analyzer.js --action=dashboard --course=cst349 --data-dir=../Common-Curriculum-Data
 *   node scripts/submission-analyzer.js --action=full --course=both --data-dir=../Common-Curriculum-Data
 *
 * Environment Variables:
 *   CANVAS_API_TOKEN  - Canvas API access token
 *   CANVAS_BASE_URL   - Canvas instance URL
 *   ANTHROPIC_API_KEY - Anthropic API key (for analyze action)
 */

const fs = require('fs');
const path = require('path');
const { CanvasAPI } = require('./canvas-api.js');

// ============================================
// Configuration
// ============================================

const COURSES = {
  cst349: {
    configFile: 'config/cst349-config.js',
    csvFile: 'config/cst349-assignments.csv',
    name: 'CST349',
    prefix: 'CST349',
  },
  cst395: {
    configFile: 'config/cst395-config.js',
    csvFile: 'config/cst395-assignments.csv',
    name: 'CST395',
    prefix: 'CST395',
  },
};

const IMAGE_MIME_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
]);

// ============================================
// Utility Functions
// ============================================

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

function loadConfig(configPath) {
  const content = fs.readFileSync(configPath, 'utf-8');
  const match = content.match(/const\s+\w+\s*=\s*(\{[\s\S]*\});/);
  if (!match) throw new Error(`Could not parse config: ${configPath}`);
  return new Function(`return ${match[1]}`)();
}

function extractCourseId(canvasBaseUrl) {
  const match = canvasBaseUrl.match(/\/courses\/(\d+)/);
  if (!match) throw new Error(`Could not extract course ID from URL: ${canvasBaseUrl}`);
  return match[1];
}

function loadCsv(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** Escape a JSON string for safe embedding inside an HTML <script> block */
function escapeForScript(str) {
  return str.replace(/<\//g, '<\\/').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Parse a Canvas Quiz Report CSV into rows with student ID and answer columns.
 * The CSV format: name, id, sis_id, root_account, section, section_id, section_sis_id,
 * submitted, attempt, [question columns...], n correct, n incorrect, score
 */
function parseQuizReportCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);

  // Find the 'id' column (Canvas user ID) and question columns
  const idIdx = headers.indexOf('id');
  if (idIdx === -1) return [];

  // Question columns are between 'attempt' and 'n correct' (or end of known metadata)
  const attemptIdx = headers.indexOf('attempt');
  const nCorrectIdx = headers.indexOf('n correct');
  const questionStart = attemptIdx >= 0 ? attemptIdx + 1 : 9; // default: after first 9 metadata cols
  const questionEnd = nCorrectIdx >= 0 ? nCorrectIdx : headers.length;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const id = values[idIdx];
    if (!id || id === 'id') continue; // skip empty or duplicate header

    const answers = values.slice(questionStart, questionEnd);
    rows.push({ id, answers });
  }
  return rows;
}

/** Parse a single CSV line respecting quoted fields */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function loadRubric(assignmentKey, assignmentType, assignmentTitle) {
  // Check for assignment-specific rubric file
  const rubricPath = path.join(__dirname, '..', 'config', 'rubrics', `${assignmentKey}.txt`);
  if (fs.existsSync(rubricPath)) {
    return fs.readFileSync(rubricPath, 'utf-8').trim();
  }

  // Generate default rubric based on assignment type
  const defaults = {
    reflection: `This is a productive reflection. Quality criteria: honest self-assessment, specific examples from their experience, evidence of genuine thinking rather than surface-level responses, connection to course concepts.`,
    quiz: `This is a graded survey/quiz. Quality criteria: thoughtful responses that show engagement with the material, specific rather than vague answers, evidence of reflection.`,
    assignment: `This is an assignment submission. Quality criteria: completeness, depth of analysis, specificity of examples, actionable insights, evidence of genuine effort.`,
  };

  return defaults[assignmentType] || defaults.assignment;
}

// ============================================
// Step 1: Download Submissions
// ============================================

async function downloadSubmissions(api, courseName, dataDir) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`DOWNLOADING SUBMISSIONS: ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const config = loadConfig(path.join(__dirname, '..', courseInfo.configFile));
  const courseId = extractCourseId(config.canvasBaseUrl);
  const csvRows = loadCsv(path.join(__dirname, '..', courseInfo.csvFile));

  // Get enrollments and build ID mapping
  console.log('\nFetching student enrollments...');
  const enrollments = await api.listEnrollments(courseId);
  const students = enrollments
    .filter(e => e.user && e.type === 'StudentEnrollment')
    .map(e => ({ canvasId: e.user_id, name: e.user.sortable_name || e.user.name }));

  console.log(`Found ${students.length} students`);

  // Load or create ID mapping
  const courseDataDir = path.join(dataDir, courseName);
  const mappingPath = path.join(courseDataDir, 'id-mapping.json');
  let mapping = loadJson(mappingPath) || {};

  // Update mapping with any new students
  const existingCanvasIds = new Set(Object.values(mapping).map(m => m.canvasId));
  let nextId = Object.keys(mapping).length + 1;

  students.forEach(student => {
    if (!existingCanvasIds.has(student.canvasId)) {
      const anonId = `${courseInfo.prefix}-${String(nextId).padStart(2, '0')}`;
      mapping[anonId] = { canvasId: student.canvasId, name: student.name };
      existingCanvasIds.add(student.canvasId);
      nextId++;
    }
  });
  saveJson(mappingPath, mapping);
  console.log(`ID mapping: ${Object.keys(mapping).length} students`);

  // Build reverse lookup: canvasId → anonId
  const canvasToAnon = {};
  Object.entries(mapping).forEach(([anonId, info]) => {
    canvasToAnon[info.canvasId] = anonId;
  });

  // Download submissions for each assignment
  const submissionsDir = path.join(courseDataDir, 'submissions');
  ensureDir(submissionsDir);

  const assignments = csvRows.filter(row => row.canvasId && row.canvasId !== 'null');
  console.log(`\nProcessing ${assignments.length} assignments with Canvas IDs...\n`);

  const submissionIndex = loadJson(path.join(courseDataDir, 'submission-index.json')) || {};

  for (const row of assignments) {
    const assignmentKey = row.key;
    const canvasId = row.canvasId;
    const isQuiz = row.canvasType === 'quiz';

    console.log(`  ${row.title} (${assignmentKey})...`);

    try {
      let submissions;
      if (isQuiz) {
        // canvasId for quizzes is the quiz ID, not the shadow assignment ID.
        // Look up the quiz to find its linked assignment_id for submissions.
        const quiz = await api.request(`/courses/${courseId}/quizzes/${canvasId}`);
        const shadowAssignmentId = quiz.assignment_id;
        if (!shadowAssignmentId) {
          throw new Error(`Quiz ${canvasId} has no linked assignment — cannot fetch submissions`);
        }
        console.log(`    (quiz ${canvasId} → shadow assignment ${shadowAssignmentId})`);
        submissions = await api.listSubmissions(courseId, shadowAssignmentId);
      } else {
        submissions = await api.listSubmissions(courseId, canvasId);
      }

      const assignmentSubs = {};

      for (const sub of submissions) {
        const anonId = canvasToAnon[sub.user_id];
        if (!anonId) continue; // Skip non-student submissions (e.g., test students)

        const subData = {
          anonId,
          status: sub.workflow_state, // 'submitted', 'graded', 'unsubmitted', 'pending_review'
          submittedAt: sub.submitted_at,
          late: sub.late || false,
          missing: sub.missing || false,
          score: sub.score,
          submissionType: sub.submission_type, // 'online_text_entry', 'online_upload', 'online_url', null
          contentType: 'none',
          content: null,
        };

        // Extract content based on submission type
        if (sub.submission_type === 'online_text_entry' && sub.body) {
          // Strip HTML tags to get plain text
          const plainText = sub.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          subData.contentType = 'text';
          subData.content = plainText;
        } else if (sub.submission_type === 'online_upload' && sub.attachments) {
          const attachment = sub.attachments[0]; // Primary attachment
          if (attachment) {
            const mime = attachment['content-type'] || attachment.content_type || '';
            if (IMAGE_MIME_TYPES.has(mime)) {
              subData.contentType = 'image';
              subData.content = `[Image: ${attachment.filename}]`;
            } else if (mime === 'application/pdf') {
              subData.contentType = 'pdf';
              subData.content = `[PDF: ${attachment.filename}]`;
            } else {
              // Try to download text-based files (detect activity engine JSON)
              try {
                const textContent = await api.downloadFileContent(attachment.url);
                if (attachment.filename?.endsWith('.json')) {
                  try {
                    const jsonData = JSON.parse(textContent);
                    if (jsonData.activityId && jsonData.responses) {
                      const hasAiDiscussion = jsonData.responses.some(r => r.questionType === 'ai-discussion');
                      if (hasAiDiscussion) {
                        subData.contentType = 'ai-discussion';
                        subData.content = textContent.substring(0, 10000);
                        subData.activityData = {
                          activityId: jsonData.activityId,
                          studentName: jsonData.studentName || '',
                          authorName: jsonData.authorName || '',
                          responses: jsonData.responses,
                        };
                      } else {
                        subData.contentType = 'text';
                        subData.content = textContent.substring(0, 5000);
                      }
                    } else {
                      subData.contentType = 'text';
                      subData.content = textContent.substring(0, 5000);
                    }
                  } catch {
                    subData.contentType = 'text';
                    subData.content = textContent.substring(0, 5000);
                  }
                } else {
                  subData.contentType = 'text';
                  subData.content = textContent.substring(0, 5000);
                }
              } catch {
                subData.contentType = 'file';
                subData.content = `[File: ${attachment.filename}]`;
              }
            }
          }
        } else if (sub.submission_type === 'online_url') {
          subData.contentType = 'url';
          subData.content = sub.url || '';
        }

        assignmentSubs[anonId] = subData;
      }

      // For quiz-type assignments, fetch answers via Quiz Reports API.
      // The Quiz Submission Questions API doesn't return answers for completed submissions,
      // and the Events API requires quiz log auditing to be enabled.
      // The Quiz Reports API generates a CSV export with all student answers.
      if (isQuiz) {
        const studentsWithoutContent = Object.values(assignmentSubs)
          .filter(s => s.contentType === 'none' && s.status !== 'unsubmitted').length;

        if (studentsWithoutContent > 0) {
          console.log(`    Fetching quiz answers via report for ${studentsWithoutContent} submissions...`);
          try {
            const reportCsv = await api.generateQuizReport(courseId, canvasId);
            const reportRows = parseQuizReportCSV(reportCsv);
            console.log(`    Quiz report: ${reportRows.length} student rows, ${reportRows[0]?.answers?.length || 0} question columns`);

            // Build reverse lookup: canvasId (string) → anonId
            const canvasIdToAnon = {};
            for (const [anonId, info] of Object.entries(mapping)) {
              canvasIdToAnon[String(info.canvasId)] = anonId;
            }

            let fetched = 0;
            for (const row of reportRows) {
              const anonId = canvasIdToAnon[String(row.id)];
              if (!anonId) continue;

              const subData = assignmentSubs[anonId];
              if (!subData || subData.contentType !== 'none' || subData.status === 'unsubmitted') continue;

              const answerTexts = row.answers
                .map(a => {
                  if (!a) return '';
                  return a.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                })
                .filter(a => a.length > 0);

              if (answerTexts.length > 0) {
                subData.contentType = 'text';
                subData.content = answerTexts.join('\n\n').substring(0, 5000);
                fetched++;
              }
            }
            console.log(`    → Extracted quiz content for ${fetched} students`);
          } catch (err) {
            console.log(`    (Quiz report failed: ${err.message})`);
          }
        }
      }

      // Detect if this assignment has ai-discussion submissions
      const hasAiDiscussion = Object.values(assignmentSubs).some(s => s.contentType === 'ai-discussion');

      submissionIndex[assignmentKey] = {
        title: row.title,
        type: row.type,
        canvasType: row.canvasType,
        points: parseInt(row.points) || 0,
        dueDate: row.dueDate,
        sprint: row.sprint,
        week: row.week,
        totalSubmissions: Object.keys(assignmentSubs).length,
        hasAiDiscussion,
        downloadedAt: new Date().toISOString(),
      };

      // Save assignment submissions
      saveJson(path.join(submissionsDir, `${assignmentKey}.json`), assignmentSubs);
      console.log(`    → ${Object.keys(assignmentSubs).length} submissions (${Object.values(assignmentSubs).filter(s => s.content).length} with content)`);

    } catch (error) {
      console.error(`    ✗ Error: ${error.message}`);
      submissionIndex[assignmentKey] = {
        title: row.title,
        error: error.message,
        downloadedAt: new Date().toISOString(),
      };
    }
  }

  saveJson(path.join(courseDataDir, 'submission-index.json'), submissionIndex);
  console.log(`\n✓ Download complete. Data saved to ${courseDataDir}`);
}

// ============================================
// Step 2: Analyze Submissions with LLM
// ============================================

async function analyzeSubmissions(courseName, dataDir, assignmentFilter) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required for analysis');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ANALYZING SUBMISSIONS: ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const courseDataDir = path.join(dataDir, courseName);
  const submissionsDir = path.join(courseDataDir, 'submissions');
  const submissionIndex = loadJson(path.join(courseDataDir, 'submission-index.json'));
  const mapping = loadJson(path.join(courseDataDir, 'id-mapping.json'));

  if (!submissionIndex || !mapping) {
    throw new Error(`No submission data found. Run download first: --action=download --course=${courseName}`);
  }

  // Load existing analysis or create new
  const analysisPath = path.join(courseDataDir, 'analysis.json');
  const analysis = loadJson(analysisPath) || { assignments: {}, lastUpdated: null };

  const csvRows = loadCsv(path.join(__dirname, '..', courseInfo.csvFile));
  const assignmentKeys = assignmentFilter
    ? [assignmentFilter]
    : Object.keys(submissionIndex).filter(k => !submissionIndex[k].error);

  console.log(`\nAnalyzing ${assignmentKeys.length} assignment(s)...\n`);

  let totalCalls = 0;
  let totalStudents = 0;

  for (const assignmentKey of assignmentKeys) {
    const indexEntry = submissionIndex[assignmentKey];
    if (!indexEntry || indexEntry.error) continue;

    const subsPath = path.join(submissionsDir, `${assignmentKey}.json`);
    const submissions = loadJson(subsPath);
    if (!submissions) continue;

    const csvRow = csvRows.find(r => r.key === assignmentKey);
    const rubric = loadRubric(assignmentKey, csvRow?.type || 'assignment', indexEntry.title);

    console.log(`  ${indexEntry.title} (${assignmentKey})`);

    // AI-Discussion assignments get specialized analysis
    if (indexEntry.hasAiDiscussion) {
      console.log(`    → AI-discussion detected, using partner matching & dual grading`);
      if (!analysis.discussions) analysis.discussions = {};
      try {
        const discResult = await analyzeDiscussionAssignment(courseName, dataDir, assignmentKey, indexEntry);
        if (discResult) {
          analysis.discussions[assignmentKey] = {
            title: indexEntry.title,
            points: indexEntry.points,
            sprint: indexEntry.sprint,
            week: indexEntry.week,
            results: discResult.results,
            studentData: discResult.studentData,
            analyzedAt: new Date().toISOString(),
          };
          // Also store participation in main analysis for the overview dashboard
          const assignmentAnalysis = {};
          for (const [anonId, grade] of Object.entries(discResult.results)) {
            assignmentAnalysis[anonId] = {
              participation: grade.hasWriting || grade.hasDiscussion ? 5 : 1,
              quality: Math.round(((grade.writingScore || 0) + (grade.discussionScore || 0)) / 2),
              qualityNotes: `Writing: ${grade.writingScore}/5, Discussion: ${grade.discussionScore}/5`,
              analyzedAt: new Date().toISOString(),
              contentType: 'ai-discussion',
            };
          }
          analysis.assignments[assignmentKey] = {
            title: indexEntry.title, type: indexEntry.type, points: indexEntry.points,
            sprint: indexEntry.sprint, week: indexEntry.week, dueDate: indexEntry.dueDate,
            students: assignmentAnalysis, analyzedAt: new Date().toISOString(),
          };
          totalStudents += Object.keys(discResult.results).length;
        }
      } catch (err) {
        console.error(`    ✗ Discussion analysis error: ${err.message}`);
      }
      continue;
    }

    const assignmentAnalysis = {};

    for (const [anonId, sub] of Object.entries(submissions)) {
      // Determine participation score
      let participation = 1; // Default: no submission
      if (sub.missing) {
        participation = 1;
      } else if (sub.content && sub.status !== 'unsubmitted') {
        participation = sub.late ? 3 : 4;
        // Bump to 5 if on time with substantive content
        if (!sub.late && sub.contentType === 'text' && sub.content.length > 100) {
          participation = 5;
        }
      } else if (sub.status === 'submitted' || sub.status === 'graded') {
        participation = sub.late ? 3 : 4;
      }

      // For images, PDFs, URLs, or empty submissions: participation only
      if (sub.contentType !== 'text' || !sub.content || sub.content.length < 20) {
        assignmentAnalysis[anonId] = {
          participation,
          quality: null, // Can't assess quality without text
          qualityNotes: sub.contentType === 'image' ? 'Image submission — participation only' :
                        sub.contentType === 'pdf' ? 'PDF submission — participation only' :
                        sub.missing ? 'Missing submission' :
                        'No text content to analyze',
          analyzedAt: new Date().toISOString(),
          contentType: sub.contentType,
        };
        continue;
      }

      // Send text content to LLM for quality analysis
      try {
        const llmResult = await callLLM(apiKey, {
          studentId: anonId,
          assignmentTitle: indexEntry.title,
          rubric,
          content: sub.content.substring(0, 3000), // Limit to 3000 chars
          courseName: courseInfo.name,
        });

        assignmentAnalysis[anonId] = {
          participation,
          quality: llmResult.quality,
          qualityNotes: llmResult.notes,
          analyzedAt: new Date().toISOString(),
          contentType: sub.contentType,
        };
        totalCalls++;
      } catch (error) {
        console.error(`      ✗ LLM error for ${anonId}: ${error.message}`);
        assignmentAnalysis[anonId] = {
          participation,
          quality: null,
          qualityNotes: `Analysis error: ${error.message}`,
          analyzedAt: new Date().toISOString(),
          contentType: sub.contentType,
        };
      }
    }

    analysis.assignments[assignmentKey] = {
      title: indexEntry.title,
      type: indexEntry.type,
      points: indexEntry.points,
      sprint: indexEntry.sprint,
      week: indexEntry.week,
      dueDate: indexEntry.dueDate,
      students: assignmentAnalysis,
      analyzedAt: new Date().toISOString(),
    };

    const analyzed = Object.values(assignmentAnalysis);
    const withQuality = analyzed.filter(a => a.quality !== null);
    totalStudents += analyzed.length;
    console.log(`    → ${analyzed.length} students, ${withQuality.length} analyzed by LLM, ${totalCalls} API calls so far`);
  }

  // Generate per-student qualitative summaries
  console.log('\n  Generating student summaries...');
  const allAnonIds = Object.keys(mapping);
  let summaryCalls = 0;

  if (!analysis.studentSummaries) analysis.studentSummaries = {};

  for (const anonId of allAnonIds) {
    // Collect this student's data across all assignments
    const studentData = [];
    for (const [key, assignment] of Object.entries(analysis.assignments)) {
      const sd = assignment.students?.[anonId];
      if (sd) {
        studentData.push({
          title: assignment.title,
          sprint: assignment.sprint,
          week: assignment.week,
          participation: sd.participation,
          quality: sd.quality,
          qualityNotes: sd.qualityNotes,
        });
      }
    }

    if (studentData.length === 0) continue;

    try {
      const summary = await generateStudentSummary(apiKey, {
        studentId: anonId,
        courseName: courseInfo.name,
        assignments: studentData,
      });
      analysis.studentSummaries[anonId] = summary;
      summaryCalls++;
    } catch (err) {
      console.error(`    ✗ Summary error for ${anonId}: ${err.message}`);
      analysis.studentSummaries[anonId] = 'Summary not available.';
    }
  }
  console.log(`  → Generated ${summaryCalls} student summaries`);

  analysis.lastUpdated = new Date().toISOString();
  saveJson(analysisPath, analysis);
  console.log(`\n✓ Analysis complete. ${totalCalls + summaryCalls} LLM calls total (${totalCalls} quality + ${summaryCalls} summaries).`);
}

async function callLLM(apiKey, params) {
  const { studentId, assignmentTitle, rubric, content, courseName } = params;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `You are evaluating a student submission for quality. Rate on a scale of 1-5 and give brief notes.

Assignment: "${assignmentTitle}" (${courseName})
Quality criteria: ${rubric}

Student submission:
---
${content}
---

Rate the quality of this submission from 1-5:
1 = Minimal effort, generic/copied, no real engagement
2 = Below expectations, vague, lacks specifics
3 = Meets basic expectations, some specifics but surface-level
4 = Good, specific examples, genuine reflection/analysis
5 = Excellent, deep insight, specific actionable content

Respond in exactly this JSON format, nothing else:
{"quality": <1-5>, "notes": "<one sentence summary of why>"}`,
      }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';

  // Parse JSON from response
  const jsonMatch = text.match(/\{[^}]+\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse LLM response as JSON');
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    quality: Math.min(5, Math.max(1, parseInt(result.quality) || 3)),
    notes: String(result.notes || '').substring(0, 200),
  };
}

async function generateStudentSummary(apiKey, params) {
  const { studentId, courseName, assignments } = params;

  // Build a snapshot of this student's work
  const snapshot = assignments.map(a => {
    const partLabel = { 1: 'missing', 2: 'low', 3: 'late', 4: 'on-time', 5: 'on-time+substantive' };
    const qualLabel = a.quality ? `quality ${a.quality}/5` : 'no text';
    return `- ${a.title} (S${a.sprint} W${a.week}): participation=${partLabel[a.participation] || a.participation}, ${qualLabel}${a.qualityNotes ? ' — ' + a.qualityNotes : ''}`;
  }).join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are helping an instructor understand a student in ${courseName}. Based on their assignment data below, write a 2-3 sentence qualitative summary that helps the instructor understand this student's engagement, strengths, and areas to watch. Be specific and actionable — not generic. If data is limited, say so briefly.

Student: ${studentId}
Assignment data:
${snapshot}

Write the summary as plain text (no quotes, no label, no markdown). Focus on patterns: Are they engaged? Improving? Surface-level or deep? Falling behind? Strong in some areas but not others?`,
      }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.content[0]?.text || '').trim();
  return text.substring(0, 400);
}

// ============================================
// Step 3: Generate Dashboard
// ============================================

function generateDashboard(courseName, dataDir) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GENERATING DASHBOARD: ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseDataDir = path.join(dataDir, courseName);
  const analysis = loadJson(path.join(courseDataDir, 'analysis.json'));
  const mapping = loadJson(path.join(courseDataDir, 'id-mapping.json'));

  if (!analysis || !mapping) {
    throw new Error(`No analysis data found. Run analyze first: --action=analyze --course=${courseName}`);
  }

  // Build student profiles
  const profiles = {};

  // Initialize profiles from mapping
  Object.entries(mapping).forEach(([anonId, info]) => {
    profiles[anonId] = {
      name: info.name,
      assignments: {},
      avgParticipation: 0,
      avgQuality: 0,
      summary: (analysis.studentSummaries && analysis.studentSummaries[anonId]) || '',
    };
  });

  // Populate with analysis data
  const assignmentList = [];

  Object.entries(analysis.assignments).forEach(([key, assignment]) => {
    assignmentList.push({
      key,
      title: assignment.title,
      type: assignment.type,
      points: assignment.points,
      sprint: assignment.sprint,
      week: assignment.week,
      dueDate: assignment.dueDate,
    });

    Object.entries(assignment.students || {}).forEach(([anonId, data]) => {
      if (!profiles[anonId]) return;
      profiles[anonId].assignments[key] = {
        participation: data.participation,
        quality: data.quality,
        qualityNotes: data.qualityNotes,
        contentType: data.contentType,
      };
    });
  });

  // Compute averages
  Object.values(profiles).forEach(profile => {
    const entries = Object.values(profile.assignments);
    const participations = entries.map(e => e.participation).filter(p => p != null);
    const qualities = entries.map(e => e.quality).filter(q => q != null);

    profile.avgParticipation = participations.length > 0
      ? Math.round((participations.reduce((a, b) => a + b, 0) / participations.length) * 10) / 10
      : 0;
    profile.avgQuality = qualities.length > 0
      ? Math.round((qualities.reduce((a, b) => a + b, 0) / qualities.length) * 10) / 10
      : 0;
  });

  // Sort assignments by sprint, week
  assignmentList.sort((a, b) => {
    if (a.sprint !== b.sprint) return (parseInt(a.sprint) || 0) - (parseInt(b.sprint) || 0);
    return (parseInt(a.week) || 0) - (parseInt(b.week) || 0);
  });

  // Generate dashboard data
  const dashboardData = {
    course: COURSES[courseName].name,
    lastUpdated: analysis.lastUpdated,
    assignments: assignmentList,
    profiles: Object.entries(profiles)
      .map(([anonId, p]) => ({ id: anonId, ...p }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };

  // Write dashboard
  const dashboardDir = path.join(dataDir, 'dashboard');
  ensureDir(dashboardDir);

  const html = buildDashboardHTML(dashboardData);
  const outputPath = path.join(dashboardDir, `${courseName}-dashboard.html`);
  fs.writeFileSync(outputPath, html);

  // Also save raw data
  saveJson(path.join(courseDataDir, 'profiles.json'), dashboardData.profiles);

  console.log(`\n✓ Dashboard generated: ${outputPath}`);
  console.log(`  Students: ${dashboardData.profiles.length}`);
  console.log(`  Assignments: ${assignmentList.length}`);

  // Generate per-assignment discussion dashboards for ai-discussion assignments
  if (analysis.discussions) {
    for (const key of Object.keys(analysis.discussions)) {
      generateDiscussionDashboard(courseName, dataDir, key);
    }
  }
}

function buildDashboardHTML(data) {
  // Escape </ to prevent premature </script> closing when JSON contains HTML-like text
  const profilesJson = escapeForScript(JSON.stringify(data.profiles));
  const assignmentsJson = escapeForScript(JSON.stringify(data.assignments));


  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.course} Submission Dashboard</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; color: #1e293b; line-height: 1.5; }

.header { background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 24px 32px; }
.header h1 { font-size: 24px; font-weight: 700; }
.header p { color: #94a3b8; font-size: 14px; margin-top: 4px; }

.nav { display: flex; gap: 8px; padding: 16px 32px; background: white; border-bottom: 1px solid #e2e8f0; }
.nav button { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 14px; font-family: inherit; }
.nav button.active { background: #1e293b; color: white; border-color: #1e293b; }
.nav button:hover:not(.active) { background: #f8fafc; }

.container { max-width: 1400px; margin: 0 auto; padding: 24px 32px; }

/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.chart-card h3 { font-size: 16px; margin-bottom: 16px; color: #334155; }
.chart-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.chart-bar-label { width: 80px; text-align: right; font-size: 13px; color: #64748b; flex-shrink: 0; }
.chart-bar-track { flex: 1; height: 28px; background: #f1f5f9; border-radius: 6px; overflow: hidden; position: relative; }
.chart-bar-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px; font-size: 12px; font-weight: 600; color: white; min-width: 32px; transition: width 0.5s ease; }
.chart-bar-count { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #64748b; }

/* Tables */
.table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 24px; }
.table-card h3 { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { background: #f8fafc; text-align: left; padding: 10px 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; }
td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
tr:hover { background: #f8fafc; }
tr.clickable { cursor: pointer; }
tr.clickable:hover { background: #eff6ff; }

/* Score badges */
.score { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; font-weight: 700; font-size: 13px; }
.score-1 { background: #fef2f2; color: #dc2626; }
.score-2 { background: #fef3c7; color: #d97706; }
.score-3 { background: #fefce8; color: #ca8a04; }
.score-4 { background: #f0fdf4; color: #16a34a; }
.score-5 { background: #ecfdf5; color: #059669; }
.score-na { background: #f1f5f9; color: #94a3b8; font-size: 11px; }
.avg-score { font-weight: 700; font-size: 15px; }

/* Detail views */
.detail-panel { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px; }
.detail-panel h2 { font-size: 20px; margin-bottom: 4px; }
.detail-panel .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
.back-btn { color: #3b82f6; cursor: pointer; font-size: 14px; margin-bottom: 16px; display: inline-block; border: none; background: none; font-family: inherit; }
.back-btn:hover { text-decoration: underline; }
.notes-cell { max-width: 300px; font-size: 13px; color: #64748b; }
.summary-row { cursor: default; }
.summary-row:hover { background: #f8fafc !important; }

/* Responsive */
@media (max-width: 768px) {
  .charts-row { grid-template-columns: 1fr; }
  .container { padding: 16px; }
  .nav { padding: 12px 16px; flex-wrap: wrap; }
}
</style>
</head>
<body>

<div class="header">
  <h1>${data.course} — Submission Dashboard</h1>
  <p>Last updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}</p>
</div>

<div class="nav">
  <button class="active" onclick="showView('overview')">Course Overview</button>
  <button onclick="showView('assignments')">By Assignment</button>
  <button onclick="showView('students')">By Student</button>
</div>

<div class="container" id="content"></div>

<script>
const PROFILES = ${profilesJson};
const ASSIGNMENTS = ${assignmentsJson};

const COLORS = {
  1: '#ef4444', 2: '#f59e0b', 3: '#eab308', 4: '#22c55e', 5: '#10b981'
};
const LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Adequate', 4: 'Good', 5: 'Excellent' };

let currentView = 'overview';

function showView(view, detail) {
  currentView = view;
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const buttons = document.querySelectorAll('.nav button');
  if (view === 'overview') buttons[0]?.classList.add('active');
  else if (view === 'assignments') buttons[1]?.classList.add('active');
  else if (view === 'students') buttons[2]?.classList.add('active');

  const el = document.getElementById('content');
  if (view === 'overview') el.innerHTML = renderOverview();
  else if (view === 'assignments') el.innerHTML = renderAssignments(detail);
  else if (view === 'students') el.innerHTML = renderStudents(detail);
  else if (view === 'student-detail') el.innerHTML = renderStudentDetail(detail);
  else if (view === 'assignment-detail') el.innerHTML = renderAssignmentDetail(detail);
}

function distributionData(values) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  values.forEach(v => { if (v >= 1 && v <= 5) counts[Math.round(v)]++; });
  return counts;
}

function renderBarChart(title, counts, total) {
  let html = '<div class="chart-card"><h3>' + title + '</h3>';
  for (let i = 5; i >= 1; i--) {
    const pct = total > 0 ? (counts[i] / total * 100) : 0;
    html += '<div class="chart-bar-row">' +
      '<div class="chart-bar-label">' + LABELS[i] + ' (' + i + ')</div>' +
      '<div class="chart-bar-track">' +
        '<div class="chart-bar-fill" style="width:' + Math.max(pct, 2) + '%;background:' + COLORS[i] + '">' + counts[i] + '</div>' +
      '</div></div>';
  }
  html += '</div>';
  return html;
}

function scoreSpan(val) {
  if (val == null) return '<span class="score score-na">-</span>';
  const r = Math.round(val);
  return '<span class="score score-' + r + '">' + val + '</span>';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderOverview() {
  const participations = PROFILES.map(p => p.avgParticipation).filter(v => v > 0);
  const qualities = PROFILES.map(p => p.avgQuality).filter(v => v > 0);
  const pCounts = distributionData(participations);
  const qCounts = distributionData(qualities);

  let html = '<div class="charts-row">' +
    renderBarChart('Participation Distribution (Avg per Student)', pCounts, participations.length) +
    renderBarChart('Quality Distribution (Avg per Student)', qCounts, qualities.length) +
    '</div>';

  var totalCols = 3 + ASSIGNMENTS.length;
  html += '<div class="table-card"><h3>All Students (' + PROFILES.length + ')</h3>';
  html += '<div style="max-height:700px;overflow-y:auto"><table><thead><tr>' +
    '<th>Student</th><th>Avg Participation</th><th>Avg Quality</th>';
  ASSIGNMENTS.forEach(a => {
    html += '<th title="' + a.title + '" style="writing-mode:vertical-lr;max-width:40px;font-size:11px;padding:8px 4px">' +
      a.key.replace(/^s\\d+-/, '') + '</th>';
  });
  html += '</tr></thead><tbody>';

  PROFILES.forEach(p => {
    html += '<tr class="clickable" onclick="showView(\\'student-detail\\',\\'' + p.id + '\\')">' +
      '<td>' + p.name + '</td>' +
      '<td class="avg-score">' + scoreSpan(p.avgParticipation || null) + '</td>' +
      '<td class="avg-score">' + scoreSpan(p.avgQuality || null) + '</td>';
    ASSIGNMENTS.forEach(a => {
      const sa = p.assignments[a.key];
      if (sa) {
        const val = sa.quality != null ? sa.quality : sa.participation;
        html += '<td>' + scoreSpan(val) + '</td>';
      } else {
        html += '<td>' + scoreSpan(null) + '</td>';
      }
    });
    html += '</tr>';
    if (p.summary) {
      html += '<tr class="summary-row"><td colspan="' + totalCols + '" style="padding:4px 12px 12px 24px;border-bottom:2px solid #e2e8f0;background:#f8fafc">' +
        '<div style="font-size:13px;color:#475569;line-height:1.5;max-width:900px">' +
        escapeHtml(p.summary) + '</div></td></tr>';
    }
  });

  html += '</tbody></table></div></div>';
  return html;
}

function renderAssignments(selectedKey) {
  if (selectedKey) return renderAssignmentDetail(selectedKey);

  let html = '<div class="table-card"><h3>Assignments (' + ASSIGNMENTS.length + ')</h3><table><thead><tr>' +
    '<th>Assignment</th><th>Sprint</th><th>Week</th><th>Type</th><th>Submissions</th><th>Avg Part.</th><th>Avg Quality</th></tr></thead><tbody>';

  ASSIGNMENTS.forEach(a => {
    const subs = PROFILES.map(p => p.assignments[a.key]).filter(Boolean);
    const parts = subs.map(s => s.participation).filter(v => v != null);
    const quals = subs.map(s => s.quality).filter(v => v != null);
    const avgP = parts.length > 0 ? (parts.reduce((x, y) => x + y, 0) / parts.length).toFixed(1) : '-';
    const avgQ = quals.length > 0 ? (quals.reduce((x, y) => x + y, 0) / quals.length).toFixed(1) : '-';

    html += '<tr class="clickable" onclick="showView(\\'assignment-detail\\',\\'' + a.key + '\\')">' +
      '<td>' + a.title + '</td><td>S' + (a.sprint || '?') + '</td><td>W' + (a.week || '?') + '</td><td>' + (a.type || '') + '</td>' +
      '<td>' + subs.length + '/' + PROFILES.length + '</td>' +
      '<td>' + scoreSpan(avgP === '-' ? null : parseFloat(avgP)) + '</td>' +
      '<td>' + scoreSpan(avgQ === '-' ? null : parseFloat(avgQ)) + '</td></tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

function renderAssignmentDetail(key) {
  const assignment = ASSIGNMENTS.find(a => a.key === key);
  if (!assignment) return '<p>Assignment not found</p>';

  const subs = PROFILES.map(p => ({ ...p, sub: p.assignments[key] })).filter(s => s.sub);
  const parts = subs.map(s => s.sub.participation).filter(v => v != null);
  const quals = subs.map(s => s.sub.quality).filter(v => v != null);
  const pCounts = distributionData(parts);
  const qCounts = distributionData(quals);

  let html = '<button class="back-btn" onclick="showView(\\'assignments\\')">← Back to Assignments</button>';
  html += '<div class="detail-panel"><h2>' + assignment.title + '</h2>' +
    '<div class="subtitle">Sprint ' + (assignment.sprint || '?') + ', Week ' + (assignment.week || '?') +
    ' · ' + (assignment.type || '') + ' · ' + (assignment.points || 0) + ' pts · Due: ' + (assignment.dueDate || 'N/A') + '</div></div>';

  html += '<div class="charts-row">' +
    renderBarChart('Participation', pCounts, parts.length) +
    renderBarChart('Quality', qCounts, quals.length) + '</div>';

  html += '<div class="table-card"><h3>Student Submissions (' + subs.length + ')</h3><table><thead><tr>' +
    '<th>Student</th><th>Participation</th><th>Quality</th><th>Content Type</th><th>Notes</th></tr></thead><tbody>';

  subs.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
    html += '<tr class="clickable" onclick="showView(\\'student-detail\\',\\'' + s.id + '\\')">' +
      '<td>' + s.name + '</td>' +
      '<td>' + scoreSpan(s.sub.participation) + '</td>' +
      '<td>' + scoreSpan(s.sub.quality) + '</td>' +
      '<td>' + (s.sub.contentType || '-') + '</td>' +
      '<td class="notes-cell">' + (s.sub.qualityNotes || '') + '</td></tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

function renderStudents(selectedId) {
  if (selectedId) return renderStudentDetail(selectedId);
  return renderOverview(); // Students list is the overview table
}

function renderStudentDetail(id) {
  const student = PROFILES.find(p => p.id === id);
  if (!student) return '<p>Student not found</p>';

  let html = '<button class="back-btn" onclick="showView(\\'overview\\')">← Back to Overview</button>';
  html += '<div class="detail-panel"><h2>' + student.name + '</h2>' +
    '<div class="subtitle">ID: ' + student.id +
    ' · Avg Participation: ' + (student.avgParticipation || '-') +
    ' · Avg Quality: ' + (student.avgQuality || '-') + '</div>';
  if (student.summary) {
    html += '<div style="margin-top:12px;padding:12px 16px;background:#f8fafc;border-radius:8px;border-left:3px solid #3b82f6;font-size:14px;color:#334155;line-height:1.6">' +
      escapeHtml(student.summary) + '</div>';
  }
  html += '</div>';

  html += '<div class="table-card"><h3>Assignment History</h3><table><thead><tr>' +
    '<th>Assignment</th><th>Sprint</th><th>Participation</th><th>Quality</th><th>Content Type</th><th>Notes</th></tr></thead><tbody>';

  ASSIGNMENTS.forEach(a => {
    const sa = student.assignments[a.key];
    html += '<tr class="clickable" onclick="showView(\\'assignment-detail\\',\\'' + a.key + '\\')">' +
      '<td>' + a.title + '</td><td>S' + (a.sprint || '?') + '</td>' +
      '<td>' + scoreSpan(sa?.participation) + '</td>' +
      '<td>' + scoreSpan(sa?.quality) + '</td>' +
      '<td>' + (sa?.contentType || 'none') + '</td>' +
      '<td class="notes-cell">' + (sa?.qualityNotes || '-') + '</td></tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

// Initialize
showView('overview');
</script>
</body>
</html>`;
}

// ============================================
// AI-Discussion: Partner Matching & Grading
// ============================================

function normalizeNameForMatch(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Find the best anonId match for a name from the activity JSON.
 * Tries exact normalized match first, then substring/fuzzy match.
 */
function findAnonIdByName(targetName, mapping) {
  const normalTarget = normalizeNameForMatch(targetName);
  if (!normalTarget) return null;

  // Exact normalized match
  for (const [anonId, info] of Object.entries(mapping)) {
    if (normalizeNameForMatch(info.name) === normalTarget) return anonId;
  }

  // Substring match (e.g., "Perez, Adrian" matches "Alonso Perez, Adrian")
  for (const [anonId, info] of Object.entries(mapping)) {
    const n = normalizeNameForMatch(info.name);
    if (n.includes(normalTarget) || normalTarget.includes(n)) return anonId;
  }

  return null;
}

/**
 * Load the activity config JSON for an assignment.
 * Tries common path patterns to find the right file.
 */
function loadActivityConfig(courseName, assignmentKey) {
  const patterns = [
    // demo-discussion → demo-ai-discussion
    `activities/${courseName}/${assignmentKey.replace('demo-discussion', 'demo-ai-discussion')}.json`,
    `activities/${courseName}/${assignmentKey}.json`,
  ];

  for (const p of patterns) {
    const fullPath = path.join(__dirname, '..', p);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    }
  }

  return null;
}

/**
 * Analyze an ai-discussion assignment: match partners, grade writing & discussion.
 */
async function analyzeDiscussionAssignment(courseName, dataDir, assignmentKey, indexEntry) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for discussion analysis');

  const courseInfo = COURSES[courseName];
  const courseDataDir = path.join(dataDir, courseName);
  const subsPath = path.join(courseDataDir, 'submissions', `${assignmentKey}.json`);
  const submissions = loadJson(subsPath);
  const mapping = loadJson(path.join(courseDataDir, 'id-mapping.json'));
  if (!submissions || !mapping) return null;

  // Load activity config for question context
  const activityConfig = loadActivityConfig(courseName, assignmentKey);
  const questions = activityConfig?.questions || [];

  console.log(`\n  AI-Discussion analysis: ${indexEntry.title}`);

  // Collect all ai-discussion submissions with partner info
  const aiSubs = {};
  for (const [anonId, sub] of Object.entries(submissions)) {
    if (sub.contentType !== 'ai-discussion' || !sub.activityData) continue;
    aiSubs[anonId] = sub;
  }

  console.log(`    ${Object.keys(aiSubs).length} ai-discussion submissions found`);
  if (Object.keys(aiSubs).length === 0) return null;

  // Build partner mapping: submitterAnonId → authorAnonId
  const partnerMap = {}; // submitterAnonId → authorAnonId
  for (const [submitterAnonId, sub] of Object.entries(aiSubs)) {
    const authorName = sub.activityData.authorName;
    const authorAnonId = findAnonIdByName(authorName, mapping);
    if (authorAnonId) {
      partnerMap[submitterAnonId] = authorAnonId;
    } else {
      console.log(`    ⚠ Could not match author "${authorName}" for ${submitterAnonId}`);
    }
  }

  // Build reverse map: authorAnonId → submitterAnonId (who entered this author's writing)
  const reversePartnerMap = {};
  for (const [submitter, author] of Object.entries(partnerMap)) {
    reversePartnerMap[author] = submitter;
  }

  // For each student, extract their writing + discussion data
  const studentData = {};
  const allStudentIds = new Set([
    ...Object.keys(aiSubs),
    ...Object.values(partnerMap),
  ]);

  for (const studentAnonId of allStudentIds) {
    const studentName = mapping[studentAnonId]?.name || studentAnonId;
    const ownSub = aiSubs[studentAnonId]; // their submission (they led discussion)
    const partnerAsSubmitter = reversePartnerMap[studentAnonId]; // who entered this student's writing
    const partnerSub = partnerAsSubmitter ? aiSubs[partnerAsSubmitter] : null;

    const data = {
      studentName,
      anonId: studentAnonId,
      partnerAnonId: ownSub ? partnerMap[studentAnonId] : partnerAsSubmitter,
      partnerName: null,
      writing: [],
      discussions: [],
      takeaway: null,
    };

    data.partnerName = data.partnerAnonId ? (mapping[data.partnerAnonId]?.name || data.partnerAnonId) : 'Unknown';

    // Extract WRITING — from partner's submission where this student is the author
    if (partnerSub?.activityData?.responses) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const r = partnerSub.activityData.responses[i];
        if (q?.type === 'ai-discussion' && r?.answer) {
          data.writing.push({
            questionId: q.id || `q${i}`,
            prompt: r.answer.selectedPrompt || q.prompt || '',
            response: r.answer.enteredResponse || '',
            aiContext: q.aiContext || '',
          });
        }
      }
    }

    // Extract DISCUSSION — from their own submission
    if (ownSub?.activityData?.responses) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const r = ownSub.activityData.responses[i];
        if (q?.type === 'ai-discussion' && r?.answer) {
          data.discussions.push({
            questionId: q.id || `q${i}`,
            prompt: r.answer.selectedPrompt || q.prompt || '',
            summary: r.answer.discussionSummary || '',
            aiQuestions: r.answer.aiQuestions || [],
            observation: r.answer.observation || '',
            iterations: r.answer.iterations || 0,
            partnerWriting: r.answer.enteredResponse || '',
          });
        }
        if (q?.type === 'open-ended' && r?.answer) {
          data.takeaway = typeof r.answer === 'string' ? r.answer : '';
        }
      }
    }

    studentData[studentAnonId] = data;
  }

  // Grade each student with Claude
  console.log(`    Grading ${Object.keys(studentData).length} students...`);
  const results = {};

  for (const [anonId, data] of Object.entries(studentData)) {
    process.stdout.write(`      ${anonId}... `);

    try {
      const result = await gradeDiscussionStudent(apiKey, data, courseInfo.name);
      results[anonId] = {
        ...result,
        partnerAnonId: data.partnerAnonId,
        partnerName: data.partnerName,
        hasWriting: data.writing.length > 0,
        hasDiscussion: data.discussions.length > 0,
        iterations: data.discussions.reduce((sum, d) => sum + d.iterations, 0),
        takeaway: data.takeaway,
      };
      console.log(`${result.writingScore + result.discussionScore}/10`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results[anonId] = {
        writingScore: 5, writingFeedback: 'Auto-grading failed — manual review needed.',
        discussionScore: 5, discussionFeedback: 'Auto-grading failed — manual review needed.',
        overallNote: '', error: err.message,
        partnerAnonId: data.partnerAnonId, partnerName: data.partnerName,
        hasWriting: data.writing.length > 0, hasDiscussion: data.discussions.length > 0,
        iterations: 0, takeaway: data.takeaway,
      };
    }

    await new Promise(r => setTimeout(r, 500));
  }

  return { studentData, results };
}

async function gradeDiscussionStudent(apiKey, studentData, courseName) {
  const systemPrompt = `You are an encouraging instructor grading student reflections in ${courseName}.
Grade generously — most students should earn 5/5 for genuine effort. Only give 4 if there's a clearly identifiable area for improvement, and 3 only if the response is notably shallow or off-topic.

Assess two dimensions:
1. WRITING QUALITY (5 points) — the student's written reflection responses
2. DISCUSSION QUALITY (5 points) — the student's discussion summary after leading a conversation

Respond ONLY with valid JSON:
{"writingScore": <3|4|5>, "writingFeedback": "<one actionable sentence for future reflections>", "discussionScore": <3|4|5>, "discussionFeedback": "<one actionable sentence for future conversations>", "overallNote": "<one sentence highlighting something positive>"}`;

  let userPrompt = `# Student: ${studentData.anonId}\n\n`;

  userPrompt += `## WRITING (grade this student's reflection quality)\n\n`;
  if (studentData.writing.length === 0) {
    userPrompt += `⚠ No writing found (partner may not have submitted). Give writing score of 3 with feedback noting missing data.\n\n`;
  } else {
    for (const w of studentData.writing) {
      userPrompt += `### Question: ${w.prompt}\n`;
      if (w.aiContext) userPrompt += `Context: ${w.aiContext}\n`;
      userPrompt += `Response:\n> ${w.response}\n\n`;
    }
  }

  userPrompt += `## DISCUSSION SUMMARIES (grade this student's quality as discussion leader)\n\n`;
  if (studentData.discussions.length === 0) {
    userPrompt += `⚠ No discussion summaries found (student may not have submitted). Give discussion score of 3 with feedback noting missing data.\n\n`;
  } else {
    for (const d of studentData.discussions) {
      userPrompt += `### Question: ${d.prompt}\n`;
      userPrompt += `Partner's writing discussed:\n> ${d.partnerWriting}\n`;
      userPrompt += `AI discussion questions:\n${(d.aiQuestions || []).map(q => `  - ${q}`).join('\n')}\n`;
      userPrompt += `Iterations (dig deeper): ${d.iterations}\n`;
      userPrompt += `Summary:\n> ${d.summary}\n\n`;
    }
  }

  if (studentData.takeaway) {
    userPrompt += `## OVERALL TAKEAWAY (boost scores if insightful, up to 5 max)\n> ${studentData.takeaway}\n`;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API ${response.status}: ${(await response.text()).substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse grading response');

  const result = JSON.parse(jsonMatch[0]);
  return {
    writingScore: Math.min(5, Math.max(0, result.writingScore || 0)),
    writingFeedback: String(result.writingFeedback || '').substring(0, 300),
    discussionScore: Math.min(5, Math.max(0, result.discussionScore || 0)),
    discussionFeedback: String(result.discussionFeedback || '').substring(0, 300),
    overallNote: String(result.overallNote || '').substring(0, 300),
  };
}

/**
 * Generate a discussion-specific dashboard HTML for an ai-discussion assignment.
 */
function generateDiscussionDashboard(courseName, dataDir, assignmentKey) {
  const courseDataDir = path.join(dataDir, courseName);
  const analysis = loadJson(path.join(courseDataDir, 'analysis.json'));
  const mapping = loadJson(path.join(courseDataDir, 'id-mapping.json'));
  if (!analysis?.discussions?.[assignmentKey]) return;

  const disc = analysis.discussions[assignmentKey];
  const { results, studentData: rawStudentData } = disc;
  const assignmentTitle = disc.title || assignmentKey;

  // Build display rows sorted by name
  const rows = Object.entries(results)
    .map(([anonId, grade]) => {
      const sd = rawStudentData?.[anonId] || {};
      return { anonId, name: mapping[anonId]?.name || anonId, canvasId: mapping[anonId]?.canvasId, ...grade, ...sd };
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const courseCode = COURSES[courseName]?.name || courseName.toUpperCase();
  const primary = courseName === 'cst349' ? '#2563eb' : '#0d9488';
  const primaryLight = courseName === 'cst349' ? '#dbeafe' : '#ccfbf1';
  const timestamp = new Date().toLocaleString();

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(assignmentTitle)} — Discussion Dashboard</title>
<style>
:root { --primary: ${primary}; --primary-light: ${primaryLight}; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.5; }
.header { background: var(--primary); color: white; padding: 1.5rem 2rem; }
.header h1 { font-size: 1.5rem; } .header p { opacity: 0.85; font-size: 0.9rem; margin-top: 0.25rem; }
.stats { display: flex; gap: 2rem; padding: 1rem 2rem; background: var(--primary-light); border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; flex-wrap: wrap; }
.stats strong { color: var(--primary); }
.controls { padding: 1rem 2rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; border-bottom: 1px solid #e2e8f0; background: white; }
.controls input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; width: 250px; }
.controls button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 0.9rem; }
.controls button:hover { background: #f8fafc; }
.controls button.primary { background: var(--primary); color: white; border-color: var(--primary); }
.container { padding: 1rem 2rem 3rem; }
.card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
.card-hdr { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; cursor: pointer; user-select: none; }
.card-hdr:hover { background: #f8fafc; }
.card-name { font-weight: 600; } .card-meta { font-size: 0.85rem; color: #64748b; }
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 600; font-size: 0.9rem; }
.badge-hi { background: #dcfce7; color: #166534; } .badge-mid { background: #fef9c3; color: #854d0e; } .badge-lo { background: #fee2e2; color: #991b1b; }
.card-body { display: none; padding: 0 1rem 1rem; border-top: 1px solid #e2e8f0; }
.card.open .card-body { display: block; }
.sec { margin-top: 1rem; } .sec-title { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: 0.5rem; }
.rblock { background: #f8fafc; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; }
.rblock .lbl { font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem; }
.rblock .cnt { font-size: 0.9rem; white-space: pre-wrap; }
.grade-row { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; margin-top: 0.5rem; padding: 0.75rem 1rem; background: var(--primary-light); border-radius: 6px; }
.grade-row label { font-size: 0.85rem; font-weight: 500; } .grade-row select, .grade-row textarea { border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.85rem; font-family: inherit; }
.grade-row select { padding: 0.25rem 0.5rem; } .grade-row textarea { flex: 1; min-width: 250px; padding: 0.4rem; resize: vertical; min-height: 2.5rem; }
.iter-badge { display: inline-block; background: var(--primary); color: white; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem; }
.note { font-size: 0.85rem; color: #64748b; font-style: italic; padding: 0.5rem 1rem; background: #fffbeb; border-radius: 6px; margin-top: 0.5rem; }
.missing { color: #dc2626; font-style: italic; font-size: 0.85rem; }
.arrow { font-size: 1.2rem; color: #64748b; transition: transform 0.2s; } .card.open .arrow { transform: rotate(90deg); }
</style>
</head>
<body>
<div class="header">
  <h1>${esc(assignmentTitle)} — Grading Dashboard</h1>
  <p>${esc(courseCode)} &middot; Generated ${timestamp}</p>
</div>
<div class="stats">
  <div>Students: <strong>${rows.length}</strong></div>
  <div>Avg Score: <strong id="avg-score">—</strong>/10</div>
  <div>Score 10: <strong id="c10">—</strong></div>
  <div>Score 9: <strong id="c9">—</strong></div>
  <div>Score ≤8: <strong id="clo">—</strong></div>
</div>
<div class="controls">
  <input type="text" id="search" placeholder="Search students..." oninput="filterStudents()">
  <button onclick="expandAll()">Expand All</button>
  <button onclick="collapseAll()">Collapse All</button>
  <button class="primary" onclick="downloadGrades()">Download Grades JSON</button>
</div>
<div class="container" id="students">
${rows.map((s, idx) => {
  const total = (s.writingScore || 0) + (s.discussionScore || 0);
  const bc = total >= 9 ? 'badge-hi' : total >= 8 ? 'badge-mid' : 'badge-lo';
  const writing = s.writing || [];
  const discussions = s.discussions || [];
  return `
<div class="card" data-name="${esc(s.name.toLowerCase())}" data-idx="${idx}">
  <div class="card-hdr" onclick="toggleCard(this.parentElement)">
    <div><span class="card-name">${esc(s.name)}</span> <span class="card-meta">— partner: ${esc(s.partnerName || '?')}</span>
    ${!s.hasWriting && !s.hasDiscussion ? '<span class="missing"> (no data)</span>' : ''}</div>
    <div style="display:flex;align-items:center;gap:0.75rem">
      <span class="badge ${bc}" id="b${idx}">${total}/10</span><span class="arrow">▶</span>
    </div>
  </div>
  <div class="card-body">
    <div class="sec"><div class="sec-title">Their Written Reflections (as author)</div>
    ${writing.length === 0 ? '<p class="missing">No writing found — partner may not have submitted.</p>' :
      writing.map(w => `<div class="rblock"><div class="lbl">${esc(w.prompt)}</div><div class="cnt">${esc(w.response || '(empty)')}</div></div>`).join('')}
    </div>
    <div class="grade-row">
      <label>Writing:</label>
      <select id="w${idx}" onchange="upd(${idx})">${[5,4,3,2,1,0].map(v => `<option value="${v}"${v===(s.writingScore||0)?' selected':''}>${v}</option>`).join('')}</select><span>/5</span>
      <textarea id="wf${idx}" rows="1">${esc(s.writingFeedback || '')}</textarea>
    </div>
    <div class="sec"><div class="sec-title">Their Discussion Leadership (as questioner)</div>
    ${discussions.length === 0 ? '<p class="missing">No discussion summaries — student may not have submitted.</p>' :
      discussions.map(d => `<div class="rblock">
        <div class="lbl">${esc(d.prompt)} <span class="iter-badge">${d.iterations} iter</span></div>
        <div class="lbl" style="margin-top:0.5rem">Partner's writing discussed:</div>
        <div class="cnt" style="opacity:0.7;font-size:0.85rem">${esc(d.partnerWriting || '(empty)')}</div>
        <div class="lbl" style="margin-top:0.5rem">AI questions:</div>
        <ul style="font-size:0.85rem;margin:0.25rem 0 0.5rem 1.25rem">${(d.aiQuestions||[]).map(q=>`<li>${esc(q)}</li>`).join('')}</ul>
        <div class="lbl">Discussion summary:</div>
        <div class="cnt">${esc(d.summary || '(empty)')}</div>
      </div>`).join('')}
    </div>
    <div class="grade-row">
      <label>Discussion:</label>
      <select id="d${idx}" onchange="upd(${idx})">${[5,4,3,2,1,0].map(v => `<option value="${v}"${v===(s.discussionScore||0)?' selected':''}>${v}</option>`).join('')}</select><span>/5</span>
      <textarea id="df${idx}" rows="1">${esc(s.discussionFeedback || '')}</textarea>
    </div>
    ${s.takeaway ? `<div class="sec"><div class="sec-title">Overall Takeaway</div><div class="rblock"><div class="cnt">${esc(s.takeaway)}</div></div></div>` : ''}
    ${s.overallNote ? `<div class="note">${esc(s.overallNote)}</div>` : ''}
    ${s.error ? `<div class="note" style="background:#fee2e2">⚠ ${esc(s.error)}</div>` : ''}
  </div>
</div>`;
}).join('')}
</div>
<script>
var SD = ${escapeForScript(JSON.stringify(rows.map((s, i) => ({i, name: s.name, anonId: s.anonId, canvasId: s.canvasId, ws: s.writingScore || 0, ds: s.discussionScore || 0, wf: s.writingFeedback || '', df: s.discussionFeedback || '', note: s.overallNote || ''}))))};

function toggleCard(el) {
  el.classList.toggle('open');
}
function expandAll() {
  document.querySelectorAll('.card').forEach(function(c) { c.classList.add('open'); });
}
function collapseAll() {
  document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('open'); });
}
function filterStudents() {
  var q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.card').forEach(function(c) {
    c.style.display = c.dataset.name.includes(q) ? '' : 'none';
  });
}
function upd(i) {
  var w = +(document.getElementById('w' + i).value || 0);
  var d = +(document.getElementById('d' + i).value || 0);
  var t = w + d;
  var b = document.getElementById('b' + i);
  b.textContent = t + '/10';
  b.className = 'badge ' + (t >= 9 ? 'badge-hi' : t >= 8 ? 'badge-mid' : 'badge-lo');
  stats();
}
function stats() {
  try {
    var s = 0, c10 = 0, c9 = 0, clo = 0;
    for (var i = 0; i < SD.length; i++) {
      var w = +(document.getElementById('w' + i).value || 0);
      var d = +(document.getElementById('d' + i).value || 0);
      var t = w + d;
      s += t;
      if (t === 10) c10++;
      else if (t === 9) c9++;
      else clo++;
    }
    document.getElementById('avg-score').textContent = SD.length > 0 ? (s / SD.length).toFixed(1) : '0';
    document.getElementById('c10').textContent = c10;
    document.getElementById('c9').textContent = c9;
    document.getElementById('clo').textContent = clo;
  } catch (e) { console.error('stats error:', e); }
}
function downloadGrades() {
  var g = SD.map(function(s, i) {
    return {
      anonId: s.anonId, studentName: s.name, canvasId: s.canvasId,
      writingScore: +(document.getElementById('w' + i).value || 0),
      discussionScore: +(document.getElementById('d' + i).value || 0),
      writingFeedback: document.getElementById('wf' + i).value,
      discussionFeedback: document.getElementById('df' + i).value,
      overallNote: s.note,
      totalScore: +(document.getElementById('w' + i).value || 0) + +(document.getElementById('d' + i).value || 0)
    };
  });
  var blob = new Blob([JSON.stringify(g, null, 2)], {type: 'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '${assignmentKey}-grades.json';
  a.click();
}
stats();
</script>
</body></html>`;

  const dashboardDir = path.join(dataDir, 'dashboard');
  ensureDir(dashboardDir);
  const outputPath = path.join(dashboardDir, `${courseName}-${assignmentKey}-discussion.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`    Discussion dashboard: ${outputPath}`);
}

// ============================================
// Post Grades to Canvas
// ============================================

async function postGradesToCanvas(api, courseName, dataDir, assignmentKey, gradesFile) {
  const courseInfo = COURSES[courseName];
  const config = loadConfig(path.join(__dirname, '..', courseInfo.configFile));
  const courseId = extractCourseId(config.canvasBaseUrl);
  const assignmentConfig = config.assignments?.[assignmentKey];
  if (!assignmentConfig?.canvasId) throw new Error(`No canvasId for ${assignmentKey}`);

  const grades = JSON.parse(fs.readFileSync(gradesFile, 'utf-8'));
  console.log(`\nPosting ${grades.length} grades to Canvas (${courseName}/${assignmentKey})...`);

  let posted = 0, skipped = 0;
  for (const g of grades) {
    if (!g.canvasId) { console.log(`  ⚠ Skip ${g.studentName || g.anonId} — no Canvas ID`); skipped++; continue; }

    const comment = [
      `Writing: ${g.writingScore}/5 — ${g.writingFeedback}`,
      `Discussion: ${g.discussionScore}/5 — ${g.discussionFeedback}`,
      g.overallNote ? `\n${g.overallNote}` : '',
    ].filter(Boolean).join('\n');

    try {
      await api.gradeSubmission(courseId, assignmentConfig.canvasId, g.canvasId, { grade: g.totalScore, comment });
      console.log(`  ✓ ${g.studentName || g.anonId}: ${g.totalScore}/10`);
      posted++;
    } catch (err) {
      console.log(`  ✗ ${g.studentName || g.anonId}: ${err.message}`);
      skipped++;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\nPosted: ${posted}, Skipped: ${skipped}`);
}

// ============================================
// Main
// ============================================

async function main() {
  const args = parseArgs();
  const action = args.action;
  const course = args.course || 'both';
  const dataDir = args['data-dir'] || process.env.DATA_DIR || '../Common-Curriculum-Data';
  const assignment = args.assignment || null;

  if (!action) {
    console.log(`
Submission Analyzer — Download, analyze, and dashboard student submissions.

Usage:
  node scripts/submission-analyzer.js --action=<action> --course=<course> [options]

Actions:
  download    Download submissions from Canvas
  analyze     Analyze submissions with LLM (requires ANTHROPIC_API_KEY)
  dashboard   Generate HTML dashboard from analysis
  full        Run all three steps in sequence
  post-grades Post grades from a reviewed JSON file to Canvas

Options:
  --course=cst349|cst395|both    Course to process (default: both)
  --data-dir=<path>              Path to private data repo (default: ../Common-Curriculum-Data)
  --assignment=<key>             Analyze a single assignment / post grades for it
  --grades=<path>                Grades JSON file to post (for post-grades action)

Environment Variables:
  CANVAS_API_TOKEN   Canvas API token (required for download, post-grades)
  CANVAS_BASE_URL    Canvas instance URL (required for download, post-grades)
  ANTHROPIC_API_KEY  Anthropic API key (required for analyze)
`);
    process.exit(0);
  }

  ensureDir(dataDir);

  const courses = course === 'both' ? ['cst349', 'cst395'] : [course];
  const needsCanvas = action === 'download' || action === 'full' || action === 'post-grades';

  let api = null;
  if (needsCanvas) {
    api = new CanvasAPI(
      process.env.CANVAS_BASE_URL,
      process.env.CANVAS_API_TOKEN
    );
  }

  // Post-grades is a special action that reads a grades JSON and posts to Canvas
  if (action === 'post-grades') {
    if (!assignment) {
      console.error('Error: --assignment=<key> is required for post-grades');
      process.exit(1);
    }
    const gradesFile = args.grades || path.join(dataDir, 'dashboard', `${course}-${assignment}-grades.json`);
    if (!fs.existsSync(gradesFile)) {
      console.error(`Grades file not found: ${gradesFile}`);
      console.error('Download the grades JSON from the discussion dashboard first.');
      process.exit(1);
    }
    for (const c of courses) {
      await postGradesToCanvas(api, c, dataDir, assignment, gradesFile);
    }
    return;
  }

  for (const c of courses) {
    if (!COURSES[c]) {
      console.error(`Unknown course: ${c}`);
      continue;
    }

    try {
      if (action === 'download' || action === 'full') {
        await downloadSubmissions(api, c, dataDir);
      }
      if (action === 'analyze' || action === 'full') {
        await analyzeSubmissions(c, dataDir, assignment);
      }
      if (action === 'dashboard' || action === 'full') {
        generateDashboard(c, dataDir);
      }
    } catch (error) {
      console.error(`\n✗ Error processing ${c}: ${error.message}`);
      if (process.env.DEBUG) console.error(error.stack);
      process.exitCode = 1;
    }
  }
}

main();
