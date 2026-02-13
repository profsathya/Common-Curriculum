#!/usr/bin/env node

/**
 * One-time grade curve adjustment for AI-Discussion assignments
 *
 * Reads a grades JSON file (from analyze-submissions.js), applies a generous
 * curve to compensate for a bug that lost student data on multi-iteration
 * submissions, and posts adjusted grades + action-item comments to Canvas.
 *
 * Curve:  9→10, 8→9, 7→8, ≤6→7 (if submitted), no canvasUserId→skip
 *
 * Usage:
 *   # Dry run (preview changes, no Canvas posting):
 *   node scripts/curve-grades.js --course=cst349 --assignment=s1-demo-discussion --grades=path/to/grades.json
 *
 *   # Post to Canvas (first student only, for testing):
 *   node scripts/curve-grades.js --course=cst349 --assignment=s1-demo-discussion --grades=path/to/grades.json --post --limit=1
 *
 *   # Post to Canvas (all students):
 *   node scripts/curve-grades.js --course=cst349 --assignment=s1-demo-discussion --grades=path/to/grades.json --post
 *
 * Environment:
 *   CANVAS_API_TOKEN  - Canvas LMS API token
 *   CANVAS_BASE_URL   - Canvas instance URL (optional, derived from config)
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config (matches analyze-submissions.js)
// ---------------------------------------------------------------------------

const COURSES = {
  cst349: {
    configFile: 'config/cst349-config.js',
    configVar: 'CST349_CONFIG',
  },
  cst395: {
    configFile: 'config/cst395-config.js',
    configVar: 'CST395_CONFIG',
  },
};

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
// Curve logic
// ---------------------------------------------------------------------------

function applyCurve(totalScore) {
  if (totalScore >= 9) return 10;
  if (totalScore >= 8) return 9;
  if (totalScore >= 7) return 8;
  // 6 and below → 7 (for students who submitted)
  return 7;
}

function buildComment(g, curvedScore) {
  const lines = [];

  lines.push(`Grade: ${curvedScore}/10`);
  lines.push('');

  // Include the most actionable feedback
  if (g.writingFeedback) {
    lines.push(`Suggested action item: ${g.writingFeedback}`);
  }
  if (g.discussionFeedback && g.discussionFeedback !== g.writingFeedback) {
    lines.push(`${g.discussionFeedback}`);
  }

  if (g.overallNote) {
    lines.push('');
    lines.push(g.overallNote);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();

  if (!args.course || !COURSES[args.course]) {
    console.error('Usage: node scripts/curve-grades.js --course=<cst349|cst395> --assignment=<key> --grades=<path> [--post]');
    process.exit(1);
  }
  if (!args.assignment) {
    console.error('Error: --assignment=<key> is required');
    process.exit(1);
  }
  if (!args.grades || !fs.existsSync(args.grades)) {
    console.error('Error: --grades=<path> is required and must point to a valid grades JSON file');
    process.exit(1);
  }

  const courseInfo = COURSES[args.course];
  const config = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  const assignmentConfig = config.assignments?.[args.assignment];
  if (!assignmentConfig?.canvasId) {
    console.error(`Error: Assignment '${args.assignment}' not found in config or has no canvasId`);
    process.exit(1);
  }
  const canvasAssignmentId = assignmentConfig.canvasId;

  // Read grades
  const grades = JSON.parse(fs.readFileSync(args.grades, 'utf-8'));
  console.log(`\n═══ Grade Curve Adjustment ═══`);
  console.log(`Course: ${args.course}, Assignment: ${args.assignment}`);
  console.log(`Grades file: ${args.grades} (${grades.length} students)\n`);

  // Apply curve and preview
  const curved = [];
  for (const g of grades) {
    const canvasUserId = g.canvasUserId || g.canvasId;
    if (!canvasUserId) {
      console.log(`  ⚠ SKIP (no Canvas ID): ${g.studentName}`);
      continue;
    }

    const original = g.totalScore;
    const adjusted = applyCurve(original);
    const comment = buildComment(g, adjusted);

    curved.push({ ...g, canvasUserId: canvasUserId, originalScore: original, totalScore: adjusted, comment });
    const arrow = original !== adjusted ? `${original} → ${adjusted}` : `${original} (no change)`;
    console.log(`  ${g.studentName}: ${arrow}`);
  }

  // Summary
  console.log(`\n--- Summary ---`);
  console.log(`  Students to post: ${curved.length}`);
  console.log(`  Skipped (no Canvas ID): ${grades.length - curved.length}`);

  const limit = args.limit ? parseInt(args.limit, 10) : 0;
  if (limit > 0) {
    console.log(`  Limit: posting first ${limit} student(s)`);
  }

  if (args.post !== true) {
    console.log(`\n  DRY RUN — no grades posted. Add --post to send to Canvas.`);

    // Save curved grades JSON for reference
    const outPath = args.grades.replace('.json', '-curved.json');
    fs.writeFileSync(outPath, JSON.stringify(curved, null, 2));
    console.log(`  Curved grades saved to: ${outPath}`);
    return;
  }

  // Post to Canvas
  const { CanvasAPI } = require('./canvas-api.js');
  const api = new CanvasAPI(
    process.env.CANVAS_BASE_URL || config.canvasBaseUrl.replace(/\/courses\/\d+$/, ''),
    process.env.CANVAS_API_TOKEN
  );

  // Fetch existing submissions to skip already-graded students
  console.log(`\nFetching existing submissions from Canvas...`);
  const existing = await api.listSubmissions(courseId, canvasAssignmentId);
  const existingMap = new Map();
  for (const sub of existing) {
    existingMap.set(String(sub.user_id), sub);
  }

  console.log(`Posting curved grades to Canvas...`);
  let posted = 0, skipped = 0;

  const toPost = limit > 0 ? curved.slice(0, limit) : curved;
  for (const g of toPost) {
    // Check if grade and comment are already posted
    const sub = existingMap.get(String(g.canvasUserId));
    if (sub && sub.score === g.totalScore) {
      const comments = sub.submission_comments || [];
      const hasComment = comments.some(c => c.comment && c.comment.startsWith('Grade:'));
      if (hasComment) {
        console.log(`  ⊜ ${g.studentName}: already posted (${g.totalScore}/10)`);
        skipped++;
        continue;
      }
    }

    try {
      await api.gradeSubmission(courseId, canvasAssignmentId, g.canvasUserId, {
        grade: g.totalScore,
        comment: g.comment,
      });
      console.log(`  ✓ ${g.studentName}: ${g.totalScore}/10`);
      posted++;
    } catch (err) {
      console.log(`  ✗ ${g.studentName}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nPosted: ${posted}, Already posted: ${skipped}, Total: ${toPost.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
