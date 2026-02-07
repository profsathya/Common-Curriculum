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

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
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
              // Try to download text-based files
              try {
                const textContent = await api.downloadFileContent(attachment.url);
                subData.contentType = 'text';
                subData.content = textContent.substring(0, 5000); // Limit size
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

      submissionIndex[assignmentKey] = {
        title: row.title,
        type: row.type,
        canvasType: row.canvasType,
        points: parseInt(row.points) || 0,
        dueDate: row.dueDate,
        sprint: row.sprint,
        week: row.week,
        totalSubmissions: Object.keys(assignmentSubs).length,
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

  analysis.lastUpdated = new Date().toISOString();
  saveJson(analysisPath, analysis);
  console.log(`\n✓ Analysis complete. ${totalCalls} LLM calls for ${totalStudents} student-assignment pairs.`);
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
}

function buildDashboardHTML(data) {
  const profilesJson = JSON.stringify(data.profiles);
  const assignmentsJson = JSON.stringify(data.assignments);

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

function renderOverview() {
  const participations = PROFILES.map(p => p.avgParticipation).filter(v => v > 0);
  const qualities = PROFILES.map(p => p.avgQuality).filter(v => v > 0);
  const pCounts = distributionData(participations);
  const qCounts = distributionData(qualities);

  let html = '<div class="charts-row">' +
    renderBarChart('Participation Distribution (Avg per Student)', pCounts, participations.length) +
    renderBarChart('Quality Distribution (Avg per Student)', qCounts, qualities.length) +
    '</div>';

  html += '<div class="table-card"><h3>All Students (' + PROFILES.length + ')</h3>';
  html += '<div style="max-height:600px;overflow-y:auto"><table><thead><tr>' +
    '<th>Student</th><th>Avg Participation</th><th>Avg Quality</th>';
  ASSIGNMENTS.forEach(a => {
    html += '<th title="' + a.title + '" style="writing-mode:vertical-lr;max-width:40px;font-size:11px;padding:8px 4px">' +
      a.key.replace(/^s\\d+-/, '') + '</th>';
  });
  html += '</tr></thead><tbody>';

  PROFILES.forEach(p => {
    html += '<tr class="clickable" onclick="showView(\'student-detail\',\'' + p.id + '\')">' +
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

    html += '<tr class="clickable" onclick="showView(\'assignment-detail\',\'' + a.key + '\')">' +
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

  let html = '<button class="back-btn" onclick="showView(\'assignments\')">← Back to Assignments</button>';
  html += '<div class="detail-panel"><h2>' + assignment.title + '</h2>' +
    '<div class="subtitle">Sprint ' + (assignment.sprint || '?') + ', Week ' + (assignment.week || '?') +
    ' · ' + (assignment.type || '') + ' · ' + (assignment.points || 0) + ' pts · Due: ' + (assignment.dueDate || 'N/A') + '</div></div>';

  html += '<div class="charts-row">' +
    renderBarChart('Participation', pCounts, parts.length) +
    renderBarChart('Quality', qCounts, quals.length) + '</div>';

  html += '<div class="table-card"><h3>Student Submissions (' + subs.length + ')</h3><table><thead><tr>' +
    '<th>Student</th><th>Participation</th><th>Quality</th><th>Content Type</th><th>Notes</th></tr></thead><tbody>';

  subs.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
    html += '<tr class="clickable" onclick="showView(\'student-detail\',\'' + s.id + '\')">' +
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

  let html = '<button class="back-btn" onclick="showView(\'overview\')">← Back to Overview</button>';
  html += '<div class="detail-panel"><h2>' + student.name + '</h2>' +
    '<div class="subtitle">ID: ' + student.id +
    ' · Avg Participation: ' + (student.avgParticipation || '-') +
    ' · Avg Quality: ' + (student.avgQuality || '-') + '</div></div>';

  html += '<div class="table-card"><h3>Assignment History</h3><table><thead><tr>' +
    '<th>Assignment</th><th>Sprint</th><th>Participation</th><th>Quality</th><th>Content Type</th><th>Notes</th></tr></thead><tbody>';

  ASSIGNMENTS.forEach(a => {
    const sa = student.assignments[a.key];
    html += '<tr class="clickable" onclick="showView(\'assignment-detail\',\'' + a.key + '\')">' +
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

Options:
  --course=cst349|cst395|both    Course to process (default: both)
  --data-dir=<path>              Path to private data repo (default: ../Common-Curriculum-Data)
  --assignment=<key>             Analyze a single assignment (analyze action only)

Environment Variables:
  CANVAS_API_TOKEN   Canvas API token (required for download)
  CANVAS_BASE_URL    Canvas instance URL (required for download)
  ANTHROPIC_API_KEY  Anthropic API key (required for analyze)
`);
    process.exit(0);
  }

  ensureDir(dataDir);

  const courses = course === 'both' ? ['cst349', 'cst395'] : [course];
  const needsCanvas = action === 'download' || action === 'full';

  let api = null;
  if (needsCanvas) {
    api = new CanvasAPI(
      process.env.CANVAS_BASE_URL,
      process.env.CANVAS_API_TOKEN
    );
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
