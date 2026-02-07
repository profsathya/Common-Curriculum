#!/usr/bin/env node
/**
 * Dashboard Diagnostic — Traces through each stage of the analyzer pipeline
 * to identify where data drops off.
 *
 * Usage:
 *   node scripts/diagnose-dashboard.js --course=cst349 --data-dir=../Common-Curriculum-Data
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

const args = parseArgs();
const course = args.course || 'cst349';
const dataDir = args['data-dir'] || '../Common-Curriculum-Data';

const COURSES = {
  cst349: { csvFile: 'config/cst349-assignments.csv', prefix: 'CST349' },
  cst395: { csvFile: 'config/cst395-assignments.csv', prefix: 'CST395' },
};

const courseInfo = COURSES[course];
if (!courseInfo) {
  console.error(`Unknown course: ${course}`);
  process.exit(1);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`DASHBOARD DIAGNOSTIC: ${course.toUpperCase()}`);
console.log(`Data directory: ${path.resolve(dataDir)}`);
console.log('='.repeat(60));

// ============================================
// Stage 0: Check CSV (source of truth)
// ============================================
console.log(`\n--- STAGE 0: CSV Analysis ---`);
const csvPath = path.join(__dirname, '..', courseInfo.csvFile);
if (!fs.existsSync(csvPath)) {
  console.error(`  ✗ CSV not found: ${csvPath}`);
  process.exit(1);
}
const csvRows = loadCsv(csvPath);
console.log(`  Total CSV rows: ${csvRows.length}`);

const withCanvasId = csvRows.filter(r => r.canvasId && r.canvasId !== 'null');
const withoutCanvasId = csvRows.filter(r => !r.canvasId || r.canvasId === 'null');
console.log(`  With canvasId: ${withCanvasId.length} (will be downloaded)`);
console.log(`  Without canvasId: ${withoutCanvasId.length} (skipped)`);

const quizzes = withCanvasId.filter(r => r.canvasType === 'quiz');
const assignments = withCanvasId.filter(r => r.canvasType !== 'quiz');
console.log(`  Quiz-type: ${quizzes.length} (need quiz→assignment_id resolution)`);
console.log(`  Assignment-type: ${assignments.length} (direct download)`);

console.log(`\n  Assignments with Canvas IDs:`);
withCanvasId.forEach(r => {
  const flag = r.canvasType === 'quiz' ? ' [QUIZ - needs shadow assignment lookup]' : '';
  console.log(`    ${r.key}: canvasId=${r.canvasId}, type=${r.canvasType}${flag}`);
});

// ============================================
// Stage 1: Check Data Directory
// ============================================
console.log(`\n--- STAGE 1: Data Directory ---`);
const courseDataDir = path.join(dataDir, course);

if (!fs.existsSync(dataDir)) {
  console.error(`  ✗ Data directory not found: ${path.resolve(dataDir)}`);
  console.log(`  → The data repo needs to be cloned first`);
  process.exit(1);
}

if (!fs.existsSync(courseDataDir)) {
  console.error(`  ✗ Course data directory not found: ${path.resolve(courseDataDir)}`);
  console.log(`  → Run the workflow with --action=download first`);
  process.exit(1);
}

const files = fs.readdirSync(courseDataDir);
console.log(`  Course data files: ${files.join(', ')}`);

// ============================================
// Stage 2: Check ID Mapping
// ============================================
console.log(`\n--- STAGE 2: ID Mapping ---`);
const mappingPath = path.join(courseDataDir, 'id-mapping.json');
const mapping = loadJson(mappingPath);

if (!mapping) {
  console.error(`  ✗ id-mapping.json not found`);
  console.log(`  → Download stage didn't complete (no enrollments fetched)`);
} else {
  const studentCount = Object.keys(mapping).length;
  console.log(`  ✓ Students mapped: ${studentCount}`);
  if (studentCount === 0) {
    console.error(`  ✗ WARNING: 0 students in mapping — enrollment fetch may have failed`);
  } else {
    // Show first 3 students as sample
    const sample = Object.entries(mapping).slice(0, 3);
    sample.forEach(([anonId, info]) => {
      console.log(`    ${anonId}: canvasId=${info.canvasId}, name="${info.name}"`);
    });
    if (studentCount > 3) console.log(`    ... and ${studentCount - 3} more`);
  }
}

// ============================================
// Stage 3: Check Submission Index
// ============================================
console.log(`\n--- STAGE 3: Submission Index ---`);
const indexPath = path.join(courseDataDir, 'submission-index.json');
const submissionIndex = loadJson(indexPath);

if (!submissionIndex) {
  console.error(`  ✗ submission-index.json not found`);
  console.log(`  → Download stage didn't complete`);
} else {
  const keys = Object.keys(submissionIndex);
  const successful = keys.filter(k => !submissionIndex[k].error);
  const failed = keys.filter(k => submissionIndex[k].error);

  console.log(`  Total entries: ${keys.length}`);
  console.log(`  Successful: ${successful.length}`);
  console.log(`  Failed: ${failed.length}`);

  if (successful.length > 0) {
    console.log(`\n  ✓ Successful downloads:`);
    successful.forEach(k => {
      const entry = submissionIndex[k];
      console.log(`    ${k}: "${entry.title}" — ${entry.totalSubmissions} submissions (${entry.downloadedAt})`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n  ✗ Failed downloads:`);
    failed.forEach(k => {
      const entry = submissionIndex[k];
      console.log(`    ${k}: "${entry.title}" — ERROR: ${entry.error}`);
    });
  }
}

// ============================================
// Stage 4: Check Submission Files
// ============================================
console.log(`\n--- STAGE 4: Submission Files ---`);
const subsDir = path.join(courseDataDir, 'submissions');

if (!fs.existsSync(subsDir)) {
  console.error(`  ✗ submissions/ directory not found`);
} else {
  const subFiles = fs.readdirSync(subsDir).filter(f => f.endsWith('.json'));
  console.log(`  Submission files: ${subFiles.length}`);

  subFiles.forEach(f => {
    const data = loadJson(path.join(subsDir, f));
    const key = f.replace('.json', '');
    const studentCount = data ? Object.keys(data).length : 0;
    const withContent = data ? Object.values(data).filter(s => s.content).length : 0;
    const contentTypes = data ? [...new Set(Object.values(data).map(s => s.contentType))] : [];

    console.log(`    ${key}: ${studentCount} students, ${withContent} with content [${contentTypes.join(', ')}]`);

    // Show status breakdown
    if (data) {
      const statuses = {};
      Object.values(data).forEach(s => {
        statuses[s.status] = (statuses[s.status] || 0) + 1;
      });
      console.log(`      Statuses: ${Object.entries(statuses).map(([s, c]) => `${s}=${c}`).join(', ')}`);
    }
  });
}

// ============================================
// Stage 5: Check Analysis
// ============================================
console.log(`\n--- STAGE 5: Analysis ---`);
const analysisPath = path.join(courseDataDir, 'analysis.json');
const analysis = loadJson(analysisPath);

if (!analysis) {
  console.error(`  ✗ analysis.json not found`);
  console.log(`  → Analyze stage hasn't been run or failed completely`);
} else {
  const assignmentKeys = Object.keys(analysis.assignments || {});
  console.log(`  Last updated: ${analysis.lastUpdated}`);
  console.log(`  Assignments analyzed: ${assignmentKeys.length}`);

  assignmentKeys.forEach(k => {
    const a = analysis.assignments[k];
    const students = Object.keys(a.students || {});
    const withQuality = Object.values(a.students || {}).filter(s => s.quality != null);
    const participations = Object.values(a.students || {}).map(s => s.participation).filter(p => p != null);
    const avgPart = participations.length > 0
      ? (participations.reduce((x, y) => x + y, 0) / participations.length).toFixed(1)
      : '-';

    console.log(`    ${k}: ${students.length} students, ${withQuality.length} with quality, avgPart=${avgPart}`);
  });

  if (assignmentKeys.length === 0) {
    console.error(`  ✗ WARNING: 0 assignments in analysis — this means the dashboard will be EMPTY`);
    console.log(`  → Check submission-index.json: all entries may have errors`);
  }
}

// ============================================
// Stage 6: Check Dashboard
// ============================================
console.log(`\n--- STAGE 6: Dashboard ---`);
const dashboardPath = path.join(dataDir, 'dashboard', `${course}-dashboard.html`);

if (!fs.existsSync(dashboardPath)) {
  console.error(`  ✗ Dashboard not found: ${dashboardPath}`);
} else {
  const html = fs.readFileSync(dashboardPath, 'utf-8');
  const sizeKB = (html.length / 1024).toFixed(1);
  console.log(`  ✓ Dashboard exists: ${sizeKB} KB`);

  // Extract embedded data
  const profilesMatch = html.match(/const PROFILES = (\[[\s\S]*?\]);\nconst ASSIGNMENTS/);
  const assignmentsMatch = html.match(/const ASSIGNMENTS = (\[[\s\S]*?\]);\n/);

  if (profilesMatch) {
    try {
      const profiles = JSON.parse(profilesMatch[1]);
      console.log(`  Embedded PROFILES: ${profiles.length} students`);
      const withAssignments = profiles.filter(p => Object.keys(p.assignments).length > 0);
      console.log(`  Students with assignment data: ${withAssignments.length}`);

      if (profiles.length > 0) {
        const avgParts = profiles.map(p => p.avgParticipation).filter(v => v > 0);
        const avgQuals = profiles.map(p => p.avgQuality).filter(v => v > 0);
        console.log(`  Students with avgParticipation > 0: ${avgParts.length}`);
        console.log(`  Students with avgQuality > 0: ${avgQuals.length}`);
      }
    } catch (e) {
      console.error(`  ✗ Could not parse PROFILES JSON: ${e.message}`);
    }
  } else {
    console.error(`  ✗ Could not find PROFILES in dashboard HTML`);
  }

  if (assignmentsMatch) {
    try {
      const assignments = JSON.parse(assignmentsMatch[1]);
      console.log(`  Embedded ASSIGNMENTS: ${assignments.length}`);
      assignments.forEach(a => {
        console.log(`    ${a.key}: "${a.title}" (S${a.sprint} W${a.week})`);
      });
      if (assignments.length === 0) {
        console.error(`  ✗ WARNING: ASSIGNMENTS array is EMPTY — dashboard will show no data!`);
      }
    } catch (e) {
      console.error(`  ✗ Could not parse ASSIGNMENTS JSON: ${e.message}`);
    }
  } else {
    console.error(`  ✗ Could not find ASSIGNMENTS in dashboard HTML`);
  }
}

// ============================================
// Summary
// ============================================
console.log(`\n${'='.repeat(60)}`);
console.log('DIAGNOSTIC SUMMARY');
console.log('='.repeat(60));

const issues = [];

if (quizzes.length > 0) {
  issues.push(`${quizzes.length} quiz-type assignments need the quiz→shadow-assignment fix (commit c4a0988). Without it, downloads fail with 404.`);
}

if (submissionIndex) {
  const failed = Object.keys(submissionIndex).filter(k => submissionIndex[k].error);
  if (failed.length > 0) {
    issues.push(`${failed.length} assignment downloads failed. This is likely the quiz ID bug. Re-run the workflow after merging the fix.`);
  }
}

if (analysis && Object.keys(analysis.assignments || {}).length === 0) {
  issues.push(`analysis.json has 0 assignments — the dashboard will be completely empty.`);
}

if (issues.length === 0) {
  console.log('\n  No issues detected. The pipeline appears healthy.');
} else {
  console.log(`\n  Found ${issues.length} issue(s):\n`);
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

console.log(`\n  Next steps:`);
console.log(`  1. If downloads failed: merge quiz ID fix to main, re-run workflow with --action=full`);
console.log(`  2. If analysis empty: check that download produced submission files with content`);
console.log(`  3. If dashboard empty: check that analysis.json has assignment data`);
console.log('');
