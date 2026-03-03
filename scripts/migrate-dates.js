#!/usr/bin/env node
/**
 * Migrate Hardcoded Dates Script
 *
 * Replaces hardcoded date strings in HTML files with data-due-date attributes
 * that get populated at runtime from config via populateDueDates().
 *
 * Two modes:
 *   --target=assignments  Replace dates in assignment HTML files
 *   --target=sprints      Replace dates in sprint overview files
 *   --course=cst349|cst395|both
 *   --dry-run=true|false  (default: true)
 *
 * Usage: node scripts/migrate-dates.js --target=assignments --course=both
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ============================================
// CSV / Config loading (same as canvas-sync)
// ============================================

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim()); current = '';
    } else { current += char; }
  }
  values.push(current.trim());
  return values;
}

function loadCSV(csvFile) {
  const content = fs.readFileSync(path.join(ROOT, csvFile), 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

function loadConfig(configFile, configVar) {
  const content = fs.readFileSync(path.join(ROOT, configFile), 'utf-8');
  const fn = new Function(content + '\nreturn ' + configVar + ';');
  return fn();
}

// ============================================
// Date formatting (matches components.js)
// ============================================

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build all plausible text representations of a date for matching.
 * Given "2026-01-22", returns: ["Wed, Jan 22", "Wednesday, January 22",
 * "January 22", "Jan 22", etc.]
 */
function dateVariants(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDate();
  const monthLong = MONTHS_LONG[d.getMonth()];
  const monthShort = MONTHS_SHORT[d.getMonth()];
  const dayLong = DAYS_LONG[d.getDay()];
  const dayShort = DAYS_SHORT[d.getDay()];

  return [
    // Long forms: "Wednesday, January 22"
    `${dayLong}, ${monthLong} ${day}`,
    // Short forms: "Wed, Jan 22"
    `${dayShort}, ${monthLong} ${day}`,
    `${dayLong}, ${monthShort} ${day}`,
    `${dayShort}, ${monthShort} ${day}`,
    // Without day-of-week: "January 22", "Jan 22"
    `${monthLong} ${day}`,
    `${monthShort} ${day}`,
  ];
}

// ============================================
// Assignment file migration
// ============================================

/**
 * Migrate dates in a single assignment HTML file.
 * Looks for patterns like:
 *   <strong>Due:</strong> Wednesday, January 22
 *   Due Monday, February 16
 * And replaces with:
 *   <strong>Due:</strong> <span data-due-date="key"></span>
 */
function migrateAssignmentFile(filePath, assignmentKey, dueDate) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const original = html;
  let changes = 0;

  // Generic date pattern: matches any "DayName, MonthName DD" or "MonthName DD" date
  const anyDatePattern = '(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}';

  // Pattern 1: <strong>Due:</strong> [any date]
  // Aggressive: replace ANY date after "Due:</strong>", even if it doesn't
  // match the config date (the config date is the correct one)
  {
    const pattern = new RegExp(
      `(<strong>Due:</strong>\\s*)${anyDatePattern}`,
      'g'
    );
    const replacement = `$1<span data-due-date="${assignmentKey}"></span>`;
    const before = html;
    html = html.replace(pattern, replacement);
    if (html !== before) changes++;
  }

  // Pattern 2: "Due [DayName], [Month] [Day]" or "Due [Month] [Day]" in header text
  {
    const pattern = new RegExp(
      `(Due\\s+)${anyDatePattern}(?![^<]*>)`,
      'g'
    );
    const replacement = `$1<span data-due-date="${assignmentKey}"></span>`;
    const before = html;
    html = html.replace(pattern, replacement);
    if (html !== before) changes++;
  }

  // Pattern 3: "Due: [date]" without <strong> (e.g., in submission-box__meta paragraphs)
  {
    const pattern = new RegExp(
      `(Due:\\s*)${anyDatePattern}`,
      'g'
    );
    const replacement = `$1<span data-due-date="${assignmentKey}"></span>`;
    const before = html;
    html = html.replace(pattern, replacement);
    if (html !== before) changes++;
  }

  // Pattern 4: "by [Month] [Day]" milestone dates — leave alone (narrative, not due dates)

  // Ensure populateDueDates call exists
  if (changes > 0 && !html.includes('populateDueDates')) {
    // Find the DOMContentLoaded script block and add the call
    html = html.replace(
      /addDemoBannerIfNeeded\(\);/,
      'addDemoBannerIfNeeded();\n      populateDueDates(typeof CST349_CONFIG !== \'undefined\' ? CST349_CONFIG : CST395_CONFIG);'
    );
  }

  return { html, changes, modified: html !== original };
}

// ============================================
// Sprint file migration
// ============================================

/**
 * Build a reverse map: formatted-date → assignment-key
 * for all assignments in a given sprint's config.
 */
function buildDateToKeyMap(config, csvRows) {
  const map = new Map();

  for (const row of csvRows) {
    const key = row.key;
    const entry = config.assignments[key];
    if (!entry) continue;

    const variants = dateVariants(entry.dueDate);
    for (const v of variants) {
      // Store shortest match path: if multiple assignments share a date,
      // we'll need the link context to disambiguate
      if (!map.has(v)) map.set(v, []);
      map.get(v).push(key);
    }
  }
  return map;
}

/**
 * Migrate dates in a sprint overview HTML file.
 * Sprint files use: <span class="activity-item__due">Wed, Jan 21</span>
 * Each activity-item links to an assignment file, so we can match
 * the link href to determine the assignment key.
 */
function migrateSprintFile(filePath, config, csvRows) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const original = html;
  let changes = 0;

  // Build htmlFile → key map from CSV
  const fileToKey = new Map();
  for (const row of csvRows) {
    if (row.htmlFile) fileToKey.set(row.htmlFile, row.key);
  }

  // Strategy: find each activity-item block, extract the link href to
  // determine the key, then replace the date span with data-due-date.
  //
  // Pattern: within ~20 lines, there's an <a href="..."> and a
  // <span class="activity-item__due">DATE</span>

  // Split into lines for context-aware replacement
  const lines = html.split('\n');
  let currentHref = null;
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track the most recent assignment link
    const hrefMatch = line.match(/href="([^"]*\.html)"/);
    if (hrefMatch) {
      const href = hrefMatch[1];
      // Normalize: "assignments/s1-w1-skills-self-assessment.html" or "../activities/..."
      const normalized = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
      currentHref = normalized;
      currentKey = fileToKey.get(normalized) || null;

      // Also try with course prefix stripped
      if (!currentKey) {
        for (const [file, key] of fileToKey) {
          if (normalized.endsWith(file) || file.endsWith(normalized)) {
            currentKey = key;
            break;
          }
        }
      }
    }

    // Look for activity-item__due spans with hardcoded dates
    // Skip spans that already have data-due-date (already migrated)
    const dueMatch = line.match(
      /(<span\s+class="activity-item__due"(?![^>]*data-due-date)[^>]*>)([^<]+)(<\/span>)/
    );
    if (dueMatch && currentKey) {
      const dateText = dueMatch[2].trim();
      const entry = config.assignments[currentKey];

      if (!entry) continue;

      // Check if the text looks like a date (contains month name or abbreviation)
      const looksLikeDate = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(dateText);

      if (looksLikeDate) {
        if (dateText.includes('·')) {
          // Has a time component — preserve the time, replace just the date
          const timePart = dateText.substring(dateText.indexOf('·'));
          lines[i] = line.replace(
            dueMatch[0],
            `<span class="activity-item__due" data-due-date="${currentKey}"></span> ${timePart}`
          );
        } else {
          lines[i] = line.replace(
            dueMatch[0],
            `<span class="activity-item__due" data-due-date="${currentKey}"></span>`
          );
        }
        changes++;
        currentKey = null; // Consumed
      }
    }
  }

  html = lines.join('\n');

  // Ensure populateDueDates call exists
  if (changes > 0 && !html.includes('populateDueDates')) {
    const configVar = filePath.includes('cst349') ? 'CST349_CONFIG' : 'CST395_CONFIG';
    html = html.replace(
      /addDemoBannerIfNeeded\(\);/,
      `addDemoBannerIfNeeded();\n      populateDueDates(${configVar});`
    );
  }

  return { html, changes, modified: html !== original };
}

// ============================================
// Utilities
// ============================================

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Main
// ============================================

const COURSES = {
  cst349: { configFile: 'config/cst349-config.js', configVar: 'CST349_CONFIG', csvFile: 'config/cst349-assignments.csv', htmlDir: 'cst349' },
  cst395: { configFile: 'config/cst395-config.js', configVar: 'CST395_CONFIG', csvFile: 'config/cst395-assignments.csv', htmlDir: 'cst395' },
};

function main() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || 'true';
  });

  const target = args.target || 'assignments';
  const courseArg = args.course || 'both';
  const dryRun = args['dry-run'] !== 'false';

  const courses = courseArg === 'both' ? ['cst349', 'cst395'] : [courseArg];

  console.log(`Migrate Hardcoded Dates`);
  console.log(`=======================`);
  console.log(`Target: ${target} | Courses: ${courses.join(', ')} | Dry Run: ${dryRun}\n`);

  let totalChanges = 0;
  let totalFiles = 0;

  for (const courseName of courses) {
    const course = COURSES[courseName];
    const config = loadConfig(course.configFile, course.configVar);
    const csvRows = loadCSV(course.csvFile);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`${courseName.toUpperCase()}`);
    console.log('='.repeat(50));

    if (target === 'assignments') {
      // Process each assignment file referenced in CSV
      for (const row of csvRows) {
        if (!row.htmlFile) continue;
        const filePath = path.join(ROOT, course.htmlDir, row.htmlFile);
        if (!fs.existsSync(filePath)) {
          console.log(`  SKIP ${row.htmlFile} (not found)`);
          continue;
        }

        const result = migrateAssignmentFile(filePath, row.key, row.dueDate);
        if (result.modified) {
          totalChanges += result.changes;
          totalFiles++;
          console.log(`  ✓ ${row.htmlFile}: ${result.changes} date(s) replaced`);
          if (!dryRun) {
            fs.writeFileSync(filePath, result.html, 'utf-8');
          }
        }
      }
    }

    if (target === 'sprints') {
      // Process sprint overview files
      const sprintFiles = ['sprint-1.html', 'sprint-2.html', 'sprint-3.html', 'sprint-4.html'];
      for (const file of sprintFiles) {
        const filePath = path.join(ROOT, course.htmlDir, file);
        if (!fs.existsSync(filePath)) continue;

        const result = migrateSprintFile(filePath, config, csvRows);
        if (result.modified) {
          totalChanges += result.changes;
          totalFiles++;
          console.log(`  ✓ ${file}: ${result.changes} date(s) replaced`);
          if (!dryRun) {
            fs.writeFileSync(filePath, result.html, 'utf-8');
          }
        } else {
          console.log(`  - ${file}: no dates to replace`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`SUMMARY: ${totalChanges} date(s) in ${totalFiles} file(s)`);
  if (dryRun) {
    console.log(`\nDRY RUN — no files modified. Run with --dry-run=false to apply.`);
  } else {
    console.log(`\n✓ All files updated.`);
  }
}

main();
