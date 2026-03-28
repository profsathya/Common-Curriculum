#!/usr/bin/env node
/**
 * Temporary fix: Double grades for s2-reflection-4 and s2-reflection-5
 *
 * These assignments were graded out of 5 (per config) but Canvas has them
 * set to 10 points possible. This script reads current Canvas grades and
 * posts score * 2 for each graded submission.
 *
 * Usage:
 *   # Dry run (preview changes):
 *   node scripts/fix-double-reflection-grades.js
 *
 *   # Apply changes:
 *   node scripts/fix-double-reflection-grades.js --post
 *
 * Requires: CANVAS_API_TOKEN and CANVAS_BASE_URL environment variables.
 */

const fs = require('fs');
const path = require('path');
const { CanvasAPI } = require('./canvas-api.js');
const { loadConfig } = require('./utils.js');

const { config } = loadConfig(path.join(__dirname, '..', 'config', 'cst349-config.js'), 'CST349_CONFIG');

const COURSE_ID = config.canvasBaseUrl.match(/courses\/(\d+)/)?.[1];
if (!COURSE_ID) {
  console.error('Could not extract course ID from config.canvasBaseUrl');
  process.exit(1);
}

const ASSIGNMENTS = [
  { key: 's2-reflection-4', canvasId: config.assignments['s2-reflection-4']?.canvasId },
  { key: 's2-reflection-5', canvasId: config.assignments['s2-reflection-5']?.canvasId },
];

const POST = process.argv.includes('--post');

async function main() {
  const api = new CanvasAPI(
    process.env.CANVAS_BASE_URL,
    process.env.CANVAS_API_TOKEN
  );

  console.log(`\nFix: Double reflection grades for CST349`);
  console.log(`Course ID: ${COURSE_ID}`);
  console.log(`Mode: ${POST ? 'POSTING to Canvas' : 'DRY RUN (use --post to apply)'}\n`);

  for (const { key, canvasId } of ASSIGNMENTS) {
    if (!canvasId) {
      console.log(`  Skip ${key} — no canvasId in config`);
      continue;
    }

    console.log(`${'='.repeat(50)}`);
    console.log(`${key} (Canvas assignment ${canvasId})`);
    console.log(`${'='.repeat(50)}`);

    // Verify the assignment is actually 10 points on Canvas
    const assignment = await api.getAssignment(COURSE_ID, canvasId);
    console.log(`  Canvas points_possible: ${assignment.points_possible}`);
    console.log(`  Config points: ${config.assignments[key]?.points}`);

    if (assignment.points_possible !== 10) {
      console.log(`  WARNING: Canvas shows ${assignment.points_possible} points, not 10. Skipping this assignment.`);
      continue;
    }

    const submissions = await api.listSubmissions(COURSE_ID, canvasId);
    let updated = 0, skipped = 0, already = 0;

    for (const sub of submissions) {
      const score = sub.score;

      // Skip ungraded or zero submissions
      if (score == null || score === 0) {
        skipped++;
        continue;
      }

      // Skip if score is already > 5 (likely already corrected or manually graded)
      if (score > 5) {
        console.log(`  — User ${sub.user_id}: score ${score} (already > 5, skipping)`);
        already++;
        continue;
      }

      const newScore = score * 2;

      if (POST) {
        try {
          await api.gradeSubmission(COURSE_ID, canvasId, sub.user_id, {
            grade: newScore,
          });
          console.log(`  ✓ User ${sub.user_id}: ${score} → ${newScore}`);
          updated++;
        } catch (err) {
          console.log(`  ✗ User ${sub.user_id}: ${err.message}`);
        }
        // Rate limit: 200ms between API calls
        await new Promise(r => setTimeout(r, 200));
      } else {
        console.log(`  [dry-run] User ${sub.user_id}: ${score} → ${newScore}`);
        updated++;
      }
    }

    console.log(`\n  Summary: ${updated} to update, ${already} already > 5, ${skipped} ungraded/zero\n`);
  }

  if (!POST) {
    console.log(`\nThis was a dry run. To apply changes, run:`);
    console.log(`  node scripts/fix-double-reflection-grades.js --post\n`);
  } else {
    console.log(`\nDone. All grades updated.\n`);
  }
}

main().catch(err => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});
