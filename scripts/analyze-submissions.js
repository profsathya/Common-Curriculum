#!/usr/bin/env node

/**
 * Analyze AI-Discussion Submissions
 *
 * Downloads student submissions from Canvas, matches discussion partners,
 * grades writing and discussion quality using Claude API, and generates
 * an interactive HTML dashboard for instructor review.
 *
 * Usage:
 *   node scripts/analyze-submissions.js --course=cst349 --assignment=s1-demo-discussion
 *   node scripts/analyze-submissions.js --course=cst349 --assignment=s1-demo-discussion --post-grades --grades=dashboards/cst349-s1-demo-discussion-grades.json
 *
 * Environment:
 *   CANVAS_API_TOKEN  - Canvas LMS API token
 *   CANVAS_BASE_URL   - Canvas instance URL (e.g., https://csumb.instructure.com)
 *   ANTHROPIC_API_KEY  - Anthropic API key for Claude grading
 */

const fs = require('fs');
const path = require('path');
const { CanvasAPI } = require('./canvas-api.js');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const COURSES = {
  cst349: {
    configFile: 'config/cst349-config.js',
    configVar: 'CST349_CONFIG',
    csvFile: 'config/cst349-assignments.csv',
  },
  cst395: {
    configFile: 'config/cst395-config.js',
    configVar: 'CST395_CONFIG',
    csvFile: 'config/cst395-assignments.csv',
  },
};

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const CLAUDE_MAX_TOKENS = 1024;

// ---------------------------------------------------------------------------
// Argument parsing & config loading (matches canvas-sync.js patterns)
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

function loadConfig(configFile, configVarName) {
  const configPath = path.join(process.cwd(), configFile);
  const content = fs.readFileSync(configPath, 'utf-8');
  const fn = new Function(content + `\nreturn ${configVarName};`);
  return fn();
}

function extractCourseId(canvasBaseUrl) {
  const match = canvasBaseUrl.match(/\/courses\/(\d+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Step 1 — Download submissions from Canvas
// ---------------------------------------------------------------------------

async function downloadSubmissions(api, courseId, assignmentId) {
  console.log(`\nFetching submissions for assignment ${assignmentId} in course ${courseId}...`);

  // Get enrollments for name mapping (user_id → full name)
  const enrollments = await api.listEnrollments(courseId);
  const userNames = {};
  for (const e of enrollments) {
    if (e.user) {
      userNames[e.user_id] = e.user.sortable_name || e.user.name;
    }
  }

  const submissions = await api.listSubmissions(courseId, assignmentId);
  console.log(`  Found ${submissions.length} total submissions`);

  const parsed = [];
  let downloadCount = 0;
  let skipCount = 0;

  for (const sub of submissions) {
    // Skip unsubmitted
    if (!sub.attachments || sub.attachments.length === 0) {
      skipCount++;
      continue;
    }

    // Take the most recent attachment (last one)
    const attachment = sub.attachments[sub.attachments.length - 1];

    // Only process .json files
    if (!attachment.filename?.endsWith('.json')) {
      console.log(`  ⚠ Skipping non-JSON attachment from user ${sub.user_id}: ${attachment.filename}`);
      skipCount++;
      continue;
    }

    try {
      const content = await api.downloadFileContent(attachment.url);
      const data = JSON.parse(content);
      data._canvasUserId = sub.user_id;
      data._canvasUserName = userNames[sub.user_id] || `User ${sub.user_id}`;
      data._submissionId = sub.id;
      parsed.push(data);
      downloadCount++;
    } catch (err) {
      console.log(`  ⚠ Failed to download/parse submission from user ${sub.user_id}: ${err.message}`);
      skipCount++;
    }
  }

  console.log(`  Downloaded: ${downloadCount}, Skipped: ${skipCount}`);
  return parsed;
}

// ---------------------------------------------------------------------------
// Step 2 — Match partners
// ---------------------------------------------------------------------------

function normalizeNameForMatch(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function matchPartners(submissions) {
  console.log('\nMatching partners...');

  // Build lookup: normalized authorName → submission
  // Each submission has a studentName (who submitted) and authorName (whose writing they entered)
  const byStudent = {};   // normalizedStudentName → submission
  const byAuthor = {};    // normalizedAuthorName → submission (i.e., who entered that author's work)

  for (const sub of submissions) {
    const studentKey = normalizeNameForMatch(sub.studentName);
    const authorKey = normalizeNameForMatch(sub.authorName);

    if (studentKey) byStudent[studentKey] = sub;
    if (authorKey) byAuthor[authorKey] = sub;
  }

  // For each student, find:
  //   1. Their OWN submission (where they are studentName) → has their discussion summaries
  //   2. Their PARTNER'S submission (where they are authorName) → has their writing
  const studentRecords = [];
  const matched = new Set();

  for (const sub of submissions) {
    const studentKey = normalizeNameForMatch(sub.studentName);
    if (matched.has(studentKey)) continue;
    matched.add(studentKey);

    // Find the partner's submission where this student is the author
    const partnerSubmission = byAuthor[studentKey]; // submission where authorName matches this student

    const record = {
      studentName: sub.studentName,
      canvasUserId: sub._canvasUserId,
      canvasUserName: sub._canvasUserName,
      partnerName: sub.authorName,
      ownSubmission: sub,           // their submission (they led discussion, wrote summaries)
      partnerSubmission: partnerSubmission || null,  // partner's submission (has this student's writing)
      hasPartnerMatch: !!partnerSubmission,
    };

    studentRecords.push(record);
  }

  // Check for students who appear as authors but didn't submit themselves
  for (const sub of submissions) {
    const authorKey = normalizeNameForMatch(sub.authorName);
    if (authorKey && !matched.has(authorKey)) {
      // This author didn't submit their own work
      studentRecords.push({
        studentName: sub.authorName,
        canvasUserId: null,
        canvasUserName: sub.authorName,
        partnerName: sub.studentName,
        ownSubmission: null,
        partnerSubmission: sub,     // partner's submission has their writing
        hasPartnerMatch: false,
      });
      matched.add(authorKey);
    }
  }

  const matchedCount = studentRecords.filter(r => r.hasPartnerMatch).length;
  console.log(`  Total students: ${studentRecords.length}`);
  console.log(`  Matched with partner submission: ${matchedCount}`);
  console.log(`  Missing partner match: ${studentRecords.length - matchedCount}`);

  return studentRecords;
}

// ---------------------------------------------------------------------------
// Step 3 — Extract per-student data from matched submissions
// ---------------------------------------------------------------------------

function extractStudentData(record, activityConfig) {
  const data = {
    studentName: record.studentName,
    canvasUserId: record.canvasUserId,
    canvasUserName: record.canvasUserName,
    partnerName: record.partnerName,
    hasPartnerMatch: record.hasPartnerMatch,
    writing: [],       // Their writing (from partner's submission where they're the author)
    discussions: [],   // Their discussion summaries (from their own submission)
    takeaway: null,    // Q3 open-ended response (from their own submission)
  };

  const questions = activityConfig.questions || [];

  // Extract their WRITING — from partner's submission where this student is authorName
  if (record.partnerSubmission) {
    const responses = record.partnerSubmission.responses || [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const r = responses[i];
      if (q.type === 'ai-discussion' && r?.answer) {
        data.writing.push({
          questionId: q.id,
          prompt: r.answer.selectedPrompt || q.prompt,
          questionOptions: q.questionOptions || null,
          selectedOption: r.answer.selectedOption,
          response: r.answer.enteredResponse || '',
          aiContext: q.aiContext || '',
        });
      }
    }
  }

  // Extract their DISCUSSION LEADERSHIP — from their own submission
  if (record.ownSubmission) {
    const responses = record.ownSubmission.responses || [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const r = responses[i];
      if (q.type === 'ai-discussion' && r?.answer) {
        data.discussions.push({
          questionId: q.id,
          prompt: r.answer.selectedPrompt || q.prompt,
          summary: r.answer.discussionSummary || '',
          aiQuestions: r.answer.aiQuestions || [],
          observation: r.answer.observation || '',
          iterations: r.answer.iterations || 0,
          partnerWriting: r.answer.enteredResponse || '',
        });
      }
      if (q.type === 'open-ended' && r?.answer) {
        data.takeaway = typeof r.answer === 'string' ? r.answer : r.answer.text || '';
      }
    }
  }

  return data;
}

// ---------------------------------------------------------------------------
// Step 4 — Grade with Claude API
// ---------------------------------------------------------------------------

async function callClaude(systemPrompt, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

function buildGradingPrompt(studentData, courseName) {
  const systemPrompt = `You are an encouraging instructor grading student reflections in ${courseName}.
Grade generously — most students should earn 5/5 for genuine effort. Only give 4 if there's a clearly identifiable area for improvement, and 3 only if the response is notably shallow or off-topic.

You will assess two dimensions:
1. WRITING QUALITY (5 points) — the student's written reflection responses
2. DISCUSSION QUALITY (5 points) — the student's discussion summary after leading a conversation

Respond ONLY with valid JSON in this exact format:
{
  "writingScore": <3|4|5>,
  "writingFeedback": "<one concise sentence — actionable suggestion for future reflections>",
  "discussionScore": <3|4|5>,
  "discussionFeedback": "<one concise sentence — actionable suggestion for future conversations>",
  "overallNote": "<one sentence highlighting something positive from their work>"
}`;

  let userPrompt = `# Student: ${studentData.studentName}\n`;
  userPrompt += `# Partner: ${studentData.partnerName}\n\n`;

  // Writing section
  userPrompt += `## WRITING (grade this student's reflection quality)\n\n`;
  if (studentData.writing.length === 0) {
    userPrompt += `⚠ No writing found for this student (partner may not have submitted).\nGive a writing score of 3 with feedback noting the missing data.\n\n`;
  } else {
    for (const w of studentData.writing) {
      userPrompt += `### Question: ${w.prompt}\n`;
      if (w.aiContext) userPrompt += `Context: ${w.aiContext}\n`;
      userPrompt += `Student's response:\n> ${w.response}\n\n`;
    }
  }

  // Discussion section
  userPrompt += `## DISCUSSION SUMMARIES (grade this student's quality as a discussion leader)\n\n`;
  if (studentData.discussions.length === 0) {
    userPrompt += `⚠ No discussion summaries found (student may not have submitted).\nGive a discussion score of 3 with feedback noting the missing data.\n\n`;
  } else {
    for (const d of studentData.discussions) {
      userPrompt += `### Question discussed: ${d.prompt}\n`;
      userPrompt += `Partner's original writing they were discussing:\n> ${d.partnerWriting}\n`;
      userPrompt += `AI-generated discussion questions used:\n`;
      for (const q of d.aiQuestions) userPrompt += `  - ${q}\n`;
      userPrompt += `Times they dug deeper (iterations): ${d.iterations}\n`;
      userPrompt += `Student's discussion summary:\n> ${d.summary}\n\n`;
    }
  }

  // Takeaway boost
  if (studentData.takeaway) {
    userPrompt += `## OVERALL TAKEAWAY (use to boost scores if insightful)\n`;
    userPrompt += `> ${studentData.takeaway}\n\n`;
    userPrompt += `If this takeaway shows genuine insight, consider boosting either writing or discussion score by 1 point (up to 5 max).\n`;
  }

  return { systemPrompt, userPrompt };
}

async function gradeStudents(studentDataList, courseName) {
  console.log(`\nGrading ${studentDataList.length} students with Claude API...`);

  const grades = [];
  for (let i = 0; i < studentDataList.length; i++) {
    const student = studentDataList[i];
    process.stdout.write(`  [${i + 1}/${studentDataList.length}] ${student.studentName}... `);

    try {
      const { systemPrompt, userPrompt } = buildGradingPrompt(student, courseName);
      const response = await callClaude(systemPrompt, userPrompt);

      // Parse JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      const result = JSON.parse(jsonStr);
      grades.push({
        studentName: student.studentName,
        canvasUserId: student.canvasUserId,
        partnerName: student.partnerName,
        writingScore: Math.min(5, Math.max(0, result.writingScore || 0)),
        writingFeedback: result.writingFeedback || '',
        discussionScore: Math.min(5, Math.max(0, result.discussionScore || 0)),
        discussionFeedback: result.discussionFeedback || '',
        overallNote: result.overallNote || '',
        totalScore: Math.min(10, (result.writingScore || 0) + (result.discussionScore || 0)),
      });
      console.log(`${result.writingScore + result.discussionScore}/10`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      grades.push({
        studentName: student.studentName,
        canvasUserId: student.canvasUserId,
        partnerName: student.partnerName,
        writingScore: 5,
        writingFeedback: 'Auto-grading failed — manual review needed.',
        discussionScore: 5,
        discussionFeedback: 'Auto-grading failed — manual review needed.',
        overallNote: '',
        totalScore: 10,
        error: err.message,
      });
    }

    // Brief pause between API calls
    if (i < studentDataList.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return grades;
}

// ---------------------------------------------------------------------------
// Step 5 — Generate interactive HTML dashboard
// ---------------------------------------------------------------------------

function generateDashboard(studentDataList, grades, activityConfig, courseName, assignmentKey) {
  const gradeMap = {};
  for (const g of grades) {
    gradeMap[normalizeNameForMatch(g.studentName)] = g;
  }

  const studentRows = studentDataList.map(student => {
    const grade = gradeMap[normalizeNameForMatch(student.studentName)] || {};
    return { ...student, grade };
  });

  // Sort by name
  studentRows.sort((a, b) => a.studentName.localeCompare(b.studentName));

  const timestamp = new Date().toLocaleString();
  const courseCode = courseName.includes('349') ? 'CST349' : 'CST395';
  const primary = courseCode === 'CST349' ? '#2563eb' : '#0d9488';
  const primaryLight = courseCode === 'CST349' ? '#dbeafe' : '#ccfbf1';

  function combineWriting(writing) {
    if (!writing || writing.length === 0) return '<em class="empty">No writing found</em>';
    return writing.map((w, i) => `<div class="q-block"><strong>Q${i + 1}:</strong> ${escapeHtml(w.response || '(empty)')}</div>`).join('');
  }

  function combineDiscussions(discussions) {
    if (!discussions || discussions.length === 0) return '<em class="empty">No discussion data</em>';
    return discussions.map((d, i) => {
      const qs = (d.aiQuestions || []).length > 0
        ? (d.aiQuestions || []).map(q => `<li>${escapeHtml(q)}</li>`).join('')
        : '<li class="empty">No AI questions recorded</li>';
      return `<div class="q-block">
        <strong>Q${i + 1} Summary:</strong> ${escapeHtml(d.summary || '(empty)')}
        <div class="ai-qs"><strong>AI Questions Asked:</strong><ul>${qs}</ul></div>
      </div>`;
    }).join('');
  }

  function iterCount(discussions) {
    if (!discussions || discussions.length === 0) return 0;
    return discussions.reduce((sum, d) => sum + (d.iterations || 0), 0);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(activityConfig.title)} — Grading Dashboard</title>
<style>
:root { --primary: ${primary}; --primary-light: ${primaryLight}; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.5; font-size: 14px; }

.header { background: var(--primary); color: white; padding: 1.25rem 2rem; }
.header h1 { font-size: 1.3rem; } .header p { opacity: 0.85; font-size: 0.85rem; margin-top: 0.25rem; }

.stats-bar { display: flex; gap: 2rem; padding: 0.75rem 2rem; background: var(--primary-light); border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; flex-wrap: wrap; }
.stats-bar strong { color: var(--primary); }

.controls { padding: 0.75rem 2rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; border-bottom: 1px solid #e2e8f0; background: white; }
.controls input { padding: 0.4rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.85rem; width: 200px; }
.controls button { padding: 0.4rem 0.8rem; border: 1px solid #e2e8f0; border-radius: 4px; background: white; cursor: pointer; font-size: 0.85rem; }
.controls button:hover { background: #f1f5f9; }
.controls button.primary { background: var(--primary); color: white; border-color: var(--primary); }

.table-wrap { padding: 1rem 2rem 3rem; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
thead th { background: #f8fafc; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; border-bottom: 2px solid #e2e8f0; white-space: nowrap; position: sticky; top: 0; z-index: 1; }
thead th.col-text { min-width: 250px; }
tbody td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 0.85rem; }
tbody tr:hover { background: #f8fafc; }
tbody tr:nth-child(even) { background: #fafbfc; }
tbody tr:nth-child(even):hover { background: #f1f5f9; }

.q-block { margin-bottom: 0.5rem; }
.q-block:last-child { margin-bottom: 0; }
.q-block strong { color: var(--primary); font-size: 0.8rem; }
.ai-qs { margin-top: 0.25rem; }
.ai-qs strong { font-size: 0.75rem; color: #64748b; }
.ai-qs ul { margin: 0.15rem 0 0 1.25rem; font-size: 0.8rem; color: #475569; }
.empty { color: #94a3b8; }

.score-cell select { padding: 0.2rem 0.3rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.85rem; }
.feedback-cell textarea { width: 100%; min-width: 120px; padding: 0.3rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.8rem; font-family: inherit; resize: vertical; min-height: 2.2rem; }
.iter { display: inline-block; background: var(--primary); color: white; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 600; }
.total-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.9rem; }
.total-hi { background: #dcfce7; color: #166534; }
.total-mid { background: #fef9c3; color: #854d0e; }
.total-lo { background: #fee2e2; color: #991b1b; }
.takeaway { font-style: italic; color: #475569; font-size: 0.8rem; margin-top: 0.25rem; }
.note-text { font-size: 0.8rem; color: #64748b; }
</style>
</head>
<body>
<div class="header">
  <h1>${escapeHtml(activityConfig.title)} — Grading Dashboard</h1>
  <p>${escapeHtml(courseCode)} &middot; Generated ${timestamp}</p>
</div>
<div class="stats-bar">
  <div>Students: <strong>${studentRows.length}</strong></div>
  <div>Avg Score: <strong id="avg-score">—</strong>/10</div>
  <div>Score 10: <strong id="c10">—</strong></div>
  <div>Score 9: <strong id="c9">—</strong></div>
  <div>Score &le;8: <strong id="clo">—</strong></div>
</div>
<div class="controls">
  <input type="text" id="search" placeholder="Search..." oninput="filterRows()">
  <button class="primary" onclick="downloadGrades()">Download Grades JSON</button>
</div>
<div class="table-wrap">
<table>
<thead>
  <tr>
    <th>Student</th>
    <th>Partner</th>
    <th class="col-text">What They Wrote (on paper)</th>
    <th class="col-text">Discussion Outcome (led by partner)</th>
    <th>Iter.</th>
    <th>Writing /5</th>
    <th>Discussion /5</th>
    <th>Total</th>
    <th class="col-text">Feedback</th>
  </tr>
</thead>
<tbody>
${studentRows.map((s, idx) => {
  const g = s.grade;
  const total = (g.writingScore || 0) + (g.discussionScore || 0);
  const tc = total >= 9 ? 'total-hi' : total >= 8 ? 'total-mid' : 'total-lo';
  const iters = iterCount(s.discussions);
  return `<tr data-name="${escapeHtml(s.studentName.toLowerCase())}">
    <td><strong>${escapeHtml(s.studentName)}</strong></td>
    <td>${escapeHtml(s.partnerName || '?')}</td>
    <td>${combineWriting(s.writing)}${s.takeaway ? `<div class="takeaway"><strong>Takeaway:</strong> ${escapeHtml(s.takeaway)}</div>` : ''}</td>
    <td>${combineDiscussions(s.discussions)}</td>
    <td style="text-align:center">${iters > 0 ? `<span class="iter">${iters}</span>` : '0'}</td>
    <td class="score-cell">
      <select id="w${idx}" onchange="upd(${idx})">${[5,4,3,2,1,0].map(v => `<option value="${v}"${v === (g.writingScore || 0) ? ' selected' : ''}>${v}</option>`).join('')}</select>
    </td>
    <td class="score-cell">
      <select id="d${idx}" onchange="upd(${idx})">${[5,4,3,2,1,0].map(v => `<option value="${v}"${v === (g.discussionScore || 0) ? ' selected' : ''}>${v}</option>`).join('')}</select>
    </td>
    <td style="text-align:center"><span class="total-badge ${tc}" id="t${idx}">${total}</span></td>
    <td class="feedback-cell">
      <textarea id="wf${idx}" rows="1" placeholder="Writing feedback">${escapeHtml(g.writingFeedback || '')}</textarea>
      <textarea id="df${idx}" rows="1" placeholder="Discussion feedback">${escapeHtml(g.discussionFeedback || '')}</textarea>
      ${g.overallNote ? `<div class="note-text">${escapeHtml(g.overallNote)}</div>` : ''}
    </td>
  </tr>`;
}).join('')}
</tbody>
</table>
</div>
<script>
var SD = ${escapeForScript(JSON.stringify(studentRows.map((s, i) => ({i, name: s.studentName, canvasUserId: s.canvasUserId, ws: s.grade.writingScore || 0, ds: s.grade.discussionScore || 0, wf: s.grade.writingFeedback || '', df: s.grade.discussionFeedback || '', note: s.grade.overallNote || ''}))))};

function filterRows() {
  var q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('tbody tr').forEach(function(r) {
    r.style.display = r.dataset.name.includes(q) ? '' : 'none';
  });
}
function upd(i) {
  var w = +(document.getElementById('w' + i).value || 0);
  var d = +(document.getElementById('d' + i).value || 0);
  var t = w + d;
  var el = document.getElementById('t' + i);
  el.textContent = t;
  el.className = 'total-badge ' + (t >= 9 ? 'total-hi' : t >= 8 ? 'total-mid' : 'total-lo');
  calcStats();
}
function calcStats() {
  try {
    var s = 0, c10 = 0, c9 = 0, clo = 0;
    for (var i = 0; i < SD.length; i++) {
      var w = +(document.getElementById('w' + i).value || 0);
      var d = +(document.getElementById('d' + i).value || 0);
      var t = w + d;
      s += t;
      if (t === 10) c10++; else if (t === 9) c9++; else clo++;
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
      studentName: s.name, canvasUserId: s.canvasUserId,
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
calcStats();
</script>
</body>
</html>`;

  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;');
}

/** Escape a JSON string for safe embedding inside an HTML <script> block */
function escapeForScript(jsonStr) {
  return jsonStr.replace(/<\//g, '<\\/').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ---------------------------------------------------------------------------
// Step 6 — Post grades to Canvas
// ---------------------------------------------------------------------------

async function postGrades(api, courseId, assignmentId, gradesFile) {
  console.log(`\nPosting grades from ${gradesFile}...`);

  const grades = JSON.parse(fs.readFileSync(gradesFile, 'utf-8'));
  let posted = 0;
  let skipped = 0;

  for (const g of grades) {
    if (!g.canvasUserId) {
      console.log(`  ⚠ Skipping ${g.studentName} — no Canvas user ID`);
      skipped++;
      continue;
    }

    const comment = [
      `Writing: ${g.writingScore}/5 — ${g.writingFeedback}`,
      `Discussion: ${g.discussionScore}/5 — ${g.discussionFeedback}`,
      g.overallNote ? `\n${g.overallNote}` : '',
    ].filter(Boolean).join('\n');

    try {
      await api.gradeSubmission(courseId, assignmentId, g.canvasUserId, {
        grade: g.totalScore,
        comment,
      });
      console.log(`  ✓ ${g.studentName}: ${g.totalScore}/10`);
      posted++;
    } catch (err) {
      console.log(`  ✗ ${g.studentName}: ${err.message}`);
      skipped++;
    }

    // Brief pause between API calls
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nPosted: ${posted}, Skipped: ${skipped}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();

  // Validate required args
  if (!args.course || !COURSES[args.course]) {
    console.error('Usage: node scripts/analyze-submissions.js --course=<cst349|cst395> --assignment=<key> [--activity=<path>]');
    console.error('       node scripts/analyze-submissions.js --course=<cst349|cst395> --assignment=<key> --post-grades --grades=<path>');
    process.exit(1);
  }

  if (!args.assignment) {
    console.error('Error: --assignment=<key> is required (e.g., --assignment=s1-demo-discussion)');
    process.exit(1);
  }

  const courseInfo = COURSES[args.course];
  const config = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);
  const courseName = `${config.courseCode} ${config.courseName}`;

  // Look up Canvas assignment ID
  const assignmentConfig = config.assignments?.[args.assignment];
  if (!assignmentConfig?.canvasId) {
    console.error(`Error: Assignment '${args.assignment}' not found in config or has no canvasId`);
    process.exit(1);
  }
  const canvasAssignmentId = assignmentConfig.canvasId;

  // Initialize Canvas API
  const api = new CanvasAPI(
    process.env.CANVAS_BASE_URL || config.canvasBaseUrl.replace(/\/courses\/\d+$/, ''),
    process.env.CANVAS_API_TOKEN
  );

  // POST GRADES mode
  if (args['post-grades']) {
    const gradesFile = args.grades;
    if (!gradesFile || !fs.existsSync(gradesFile)) {
      console.error('Error: --grades=<path> is required and must point to a valid grades JSON file');
      process.exit(1);
    }
    await postGrades(api, courseId, canvasAssignmentId, gradesFile);
    return;
  }

  // ANALYZE mode — find the activity JSON config
  let activityPath = args.activity;
  if (!activityPath) {
    // Auto-detect: look for common patterns
    const patterns = [
      `activities/${args.course}/${args.assignment.replace('s1-demo-discussion', 's1-demo-ai-discussion')}.json`,
      `activities/${args.course}/${args.assignment}.json`,
    ];
    for (const p of patterns) {
      if (fs.existsSync(p)) { activityPath = p; break; }
    }
  }

  if (!activityPath || !fs.existsSync(activityPath)) {
    console.error(`Error: Could not find activity config. Use --activity=<path> to specify it.`);
    console.error(`  Tried: activities/${args.course}/${args.assignment}.json`);
    process.exit(1);
  }

  const activityConfig = JSON.parse(fs.readFileSync(activityPath, 'utf-8'));
  console.log(`\n═══ Analyzing: ${activityConfig.title} ═══`);
  console.log(`Course: ${courseName}`);
  console.log(`Canvas Assignment ID: ${canvasAssignmentId}`);
  console.log(`Activity Config: ${activityPath}`);

  // Step 1: Download
  const submissions = await downloadSubmissions(api, courseId, canvasAssignmentId);
  if (submissions.length === 0) {
    console.log('\nNo submissions found. Nothing to analyze.');
    return;
  }

  // Save raw submissions for reference
  const outDir = path.join('dashboards');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const rawPath = path.join(outDir, `${args.course}-${args.assignment}-submissions.json`);
  fs.writeFileSync(rawPath, JSON.stringify(submissions, null, 2));
  console.log(`\nRaw submissions saved to ${rawPath}`);

  // Step 2: Match partners
  const studentRecords = matchPartners(submissions);

  // Step 3: Extract per-student data
  const studentDataList = studentRecords.map(r => extractStudentData(r, activityConfig));

  // Step 4: Grade with Claude
  const grades = await gradeStudents(studentDataList, courseName);

  // Save grades JSON
  const gradesPath = path.join(outDir, `${args.course}-${args.assignment}-grades.json`);
  fs.writeFileSync(gradesPath, JSON.stringify(grades, null, 2));
  console.log(`\nGrades saved to ${gradesPath}`);

  // Step 5: Generate dashboard
  const dashboardHtml = generateDashboard(studentDataList, grades, activityConfig, courseName, `${args.course}-${args.assignment}`);
  const dashboardPath = path.join(outDir, `${args.course}-${args.assignment}-dashboard.html`);
  fs.writeFileSync(dashboardPath, dashboardHtml);
  console.log(`Dashboard saved to ${dashboardPath}`);

  // Summary
  console.log('\n═══ Summary ═══');
  const avgScore = grades.reduce((s, g) => s + g.totalScore, 0) / grades.length;
  console.log(`  Students graded: ${grades.length}`);
  console.log(`  Average score: ${avgScore.toFixed(1)}/10`);
  console.log(`  Score 10: ${grades.filter(g => g.totalScore === 10).length}`);
  console.log(`  Score 9: ${grades.filter(g => g.totalScore === 9).length}`);
  console.log(`  Score ≤8: ${grades.filter(g => g.totalScore <= 8).length}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open ${dashboardPath} in your browser to review`);
  console.log(`  2. Adjust any grades/feedback in the dashboard, then download the grades JSON`);
  console.log(`  3. Post to Canvas: node scripts/analyze-submissions.js --course=${args.course} --assignment=${args.assignment} --post-grades --grades=${gradesPath}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
