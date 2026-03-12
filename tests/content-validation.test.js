/**
 * Content Validation Tests
 *
 * Validates the integrity of course content across both CST349 and CST395.
 * These tests enforce the Product Experience Principles documented in
 * context/course-design.md and the Content QA checklist in context/content-qa.md.
 *
 * Test categories:
 * 1. CSV ↔ Config alignment — every CSV assignment has a matching config entry
 * 2. HTML file existence — every htmlFile referenced in CSV exists on disk
 * 3. Grading consistency — percentages add up correctly at both levels
 * 4. Hardcoded date detection — flags literal dates in assignment HTML files
 * 5. Under Construction banner detection — flags banners in active sprint content
 * 6. Grading label clarity — overview pages distinguish per-sprint from overall
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT_DIR, buildFunctions } = require('./helpers');

// ============================================
// Shared utilities
// ============================================

const COURSES = [
  { code: 'cst349', configVar: 'CST349_CONFIG', csvFile: 'config/cst349-assignments.csv', configFile: 'config/cst349-config.js' },
  { code: 'cst395', configVar: 'CST395_CONFIG', csvFile: 'config/cst395-assignments.csv', configFile: 'config/cst395-config.js' },
];

/**
 * Load a JS config file using the Function constructor pattern
 * (same approach as canvas-sync.js and config-loading.test.js).
 */
function loadConfig(configFile, configVarName) {
  const configPath = path.join(ROOT_DIR, configFile);
  const content = fs.readFileSync(configPath, 'utf-8');
  const fn = new Function(content + '\nreturn ' + configVarName + ';');
  return fn();
}

/**
 * Parse a CSV file into an array of row objects.
 * Re-implements the parseCSV/parseCSVLine from sync-csv-to-config.js.
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(function(h) { return h.trim(); });
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach(function(header, index) { row[header] = values[index] || ''; });
    rows.push(row);
  }
  return rows;
}

/**
 * Load CSV rows for a course.
 */
function loadCSV(csvFile) {
  const csvPath = path.join(ROOT_DIR, csvFile);
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  return parseCSV(csvText);
}

/**
 * Read an HTML file and return its text content.
 */
function readHTML(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Recursively find all HTML files in a directory.
 */
function findHTMLFiles(dir) {
  const results = [];
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHTMLFiles(rel));
    } else if (entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

// Regex patterns for detecting hardcoded dates in HTML content
const DATE_PATTERNS = [
  // "January 23", "Jan 23", "Feb 6" etc.
  /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?!\d)/g,
  // "Friday, January 23" day-of-week prefixed dates
  /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/g,
];

/**
 * Find all hardcoded date strings in an HTML file.
 * Returns array of { match, line } objects.
 */
function findHardcodedDates(htmlContent) {
  const matches = [];
  const lines = htmlContent.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    // Skip HTML comments
    if (line.trim().startsWith('<!--')) continue;

    for (const pattern of DATE_PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(line)) !== null) {
        // Skip matches inside data attributes (these are config-driven)
        const before = line.substring(0, m.index);
        if (/data-[a-z-]+="[^"]*$/.test(before)) continue;
        // Skip matches that are part of JS variable assignment or comment
        if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue;

        matches.push({ match: m[0], line: lineNum + 1, context: line.trim() });
      }
    }
  }
  return matches;
}

// ============================================
// 1. CSV ↔ Config Alignment
// ============================================

describe('CSV-Config alignment', function() {

  for (const course of COURSES) {
    describe(course.code, function() {

      it('every CSV assignment key exists in the config assignments object', function() {
        const csvRows = loadCSV(course.csvFile);
        const config = loadConfig(course.configFile, course.configVar);
        const missing = [];

        for (const row of csvRows) {
          if (!config.assignments[row.key]) {
            missing.push(row.key);
          }
        }

        assert.deepStrictEqual(missing, [],
          'CSV keys missing from config.assignments: ' + missing.join(', '));
      });

      it('every CSV assignment has a valid dueDate (YYYY-MM-DD format)', function() {
        const csvRows = loadCSV(course.csvFile);
        const invalid = [];

        for (const row of csvRows) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dueDate)) {
            invalid.push(row.key + ': "' + row.dueDate + '"');
          }
        }

        assert.deepStrictEqual(invalid, [],
          'Invalid dueDate formats: ' + invalid.join(', '));
      });

      it('CSV dueDates match config dueDates', function() {
        const csvRows = loadCSV(course.csvFile);
        const config = loadConfig(course.configFile, course.configVar);
        const mismatches = [];

        for (const row of csvRows) {
          const configAssignment = config.assignments[row.key];
          if (!configAssignment) continue; // covered by the key existence test

          if (configAssignment.dueDate !== row.dueDate) {
            mismatches.push(
              row.key + ': CSV=' + row.dueDate + ' config=' + configAssignment.dueDate
            );
          }
        }

        assert.deepStrictEqual(mismatches, [],
          'Date mismatches between CSV and config: ' + mismatches.join('; '));
      });

      it('CSV points values match config points', function() {
        const csvRows = loadCSV(course.csvFile);
        const config = loadConfig(course.configFile, course.configVar);
        const mismatches = [];

        for (const row of csvRows) {
          const configAssignment = config.assignments[row.key];
          if (!configAssignment) continue;

          const csvPoints = parseInt(row.points, 10);
          const configPoints = configAssignment.points;
          if (csvPoints !== configPoints) {
            mismatches.push(
              row.key + ': CSV=' + csvPoints + ' config=' + configPoints
            );
          }
        }

        assert.deepStrictEqual(mismatches, [],
          'Points mismatches: ' + mismatches.join('; '));
      });
    });
  }
});

// ============================================
// 2. HTML File Existence
// ============================================

describe('HTML file existence', function() {

  for (const course of COURSES) {
    describe(course.code, function() {

      it('every htmlFile referenced in CSV exists on disk', function() {
        const csvRows = loadCSV(course.csvFile);
        const missing = [];

        for (const row of csvRows) {
          if (!row.htmlFile) continue;
          const fullPath = path.join(ROOT_DIR, course.code, row.htmlFile);
          if (!fs.existsSync(fullPath)) {
            missing.push(row.key + ' → ' + row.htmlFile);
          }
        }

        assert.deepStrictEqual(missing, [],
          'Referenced HTML files not found on disk: ' + missing.join(', '));
      });
    });
  }
});

// ============================================
// 3. Grading Consistency
// ============================================

describe('Grading consistency', function() {

  for (const course of COURSES) {
    describe(course.code + ' — overview grading section', function() {

      it('overview.html contains a grading section', function() {
        const html = readHTML(course.code + '/overview.html');
        assert.ok(html, 'overview.html should exist');
        assert.ok(/grading/i.test(html), 'overview.html should contain grading info');
      });

      it('overall grading segments sum to 100%', function() {
        const html = readHTML(course.code + '/overview.html');
        assert.ok(html);

        // Extract percentages from grade segments
        const segmentPattern = /class="grade-segment[^"]*"[^>]*>([^<]*\d+%)/g;
        const percentages = [];
        let match;
        while ((match = segmentPattern.exec(html)) !== null) {
          const pctMatch = match[1].match(/(\d+)%/);
          if (pctMatch) percentages.push(parseInt(pctMatch[1], 10));
        }

        assert.ok(percentages.length > 0,
          'Should find grade segment percentages in overview');

        const total = percentages.reduce(function(sum, p) { return sum + p; }, 0);
        assert.equal(total, 100,
          'Grade segments should sum to 100%, got ' + total + '% from segments: ' + percentages.join(' + '));
      });
    });
  }

  for (const course of COURSES) {
    describe(course.code + ' — sprint 2 per-sprint grading', function() {

      it('sprint-2 per-sprint percentages sum to 100%', function() {
        const html = readHTML(course.code + '/sprint-2.html');
        assert.ok(html, 'sprint-2.html should exist');

        // Look for the grading line: "Goals 20% · Reflections 20% · Check-ins 20% · Demo 40%"
        const gradingLine = html.match(/Goals\s+\d+%[^<]*Demo\s+\d+%/i);
        assert.ok(gradingLine, 'sprint-2.html should contain the per-sprint grading breakdown');

        const percentages = [];
        const pctPattern = /(\d+)%/g;
        let m;
        while ((m = pctPattern.exec(gradingLine[0])) !== null) {
          percentages.push(parseInt(m[1], 10));
        }

        const total = percentages.reduce(function(sum, p) { return sum + p; }, 0);
        assert.equal(total, 100,
          'Per-sprint grading should sum to 100%, got ' + total + '% from: ' + percentages.join(' + '));
      });
    });
  }

  describe('cross-course grading structure matches', function() {

    it('both courses have the same overall grade split', function() {
      const html349 = readHTML('cst349/overview.html');
      const html395 = readHTML('cst395/overview.html');

      // Extract overall structure from both
      const extract = function(html) {
        const segments = [];
        const pattern = /class="grade-segment[^"]*"[^>]*>([^<]*\d+%)/g;
        let m;
        while ((m = pattern.exec(html)) !== null) {
          const pct = m[1].match(/(\d+)%/);
          if (pct) segments.push(parseInt(pct[1], 10));
        }
        return segments.sort(function(a, b) { return b - a; }); // descending
      };

      const segments349 = extract(html349);
      const segments395 = extract(html395);

      assert.deepStrictEqual(segments349, segments395,
        'Both courses should have identical overall grading structure. CST349: ' +
        segments349.join('/') + ', CST395: ' + segments395.join('/'));
    });
  });
});

// ============================================
// 4. Grading Label Clarity
// ============================================

describe('Grading label clarity', function() {

  for (const course of COURSES) {
    it(course.code + ' overview distinguishes overall from per-sprint grading', function() {
      const html = readHTML(course.code + '/overview.html');
      assert.ok(html);

      // The overview should have the overall breakdown (Sprints 80%, Defense/Capstone 10%, etc.)
      assert.ok(/sprints?\s*(?::|—)?\s*(?:20%\s*(?:each|×)|80%)/i.test(html),
        'Overview should clearly label the 80% sprint allocation');

      // Check that the sprint breakdown context is present
      assert.ok(/20%\s*each/i.test(html) || /20%.*×.*4/i.test(html),
        'Overview should clarify that 80% = 20% × 4 sprints');
    });
  }

  for (const course of COURSES) {
    it(course.code + ' sprint-2 grading is labeled as within-sprint percentages', function() {
      const html = readHTML(course.code + '/sprint-2.html');
      assert.ok(html);

      // Sprint 2 page should have "Sprint 2 Grading:" label
      assert.ok(/sprint\s*2\s*grading/i.test(html),
        'Sprint 2 page should label its grading section as "Sprint 2 Grading"');
    });
  }
});

// ============================================
// 5. Hardcoded Date Detection
// ============================================

describe('Hardcoded date detection in assignment pages', function() {

  for (const course of COURSES) {
    describe(course.code + ' — CSV-tracked assignment files', function() {

      it('CSV-tracked assignments use data-due-date (no hardcoded due dates)', function() {
        var csvRows = loadCSV(course.csvFile);
        var csvFiles = new Set();
        csvRows.forEach(function(row) {
          if (row.htmlFile) csvFiles.add(course.code + '/' + row.htmlFile);
        });

        var results = [];
        csvFiles.forEach(function(file) {
          var html = readHTML(file);
          if (!html) return;
          var dates = findHardcodedDates(html);
          // Filter to only "Due:" context dates (not narrative references like "by March 11")
          var dueDates = dates.filter(function(d) {
            return /Due[:\s]/i.test(d.context);
          });
          if (dueDates.length > 0) {
            results.push({ file: file, count: dueDates.length, samples: dueDates.slice(0, 3) });
          }
        });

        var totalDates = results.reduce(function(s, r) { return s + r.count; }, 0);
        if (totalDates > 0) {
          var summary = results.map(function(r) {
            return '  ' + r.file + ': ' + r.count + ' dates (e.g., "' + r.samples[0].match + '")';
          }).join('\n');
          assert.fail(
            totalDates + ' hardcoded due date(s) in CSV-tracked files:\n' + summary +
            '\n\nThese should use data-due-date attributes bound to config.'
          );
        }
      });

      it('CSV-tracked assignments with a Due line use data-due-date (not hardcoded)', function() {
        var csvRows = loadCSV(course.csvFile);
        var missing = [];

        for (var i = 0; i < csvRows.length; i++) {
          var row = csvRows[i];
          if (!row.htmlFile) continue;
          var html = readHTML(course.code + '/' + row.htmlFile);
          if (!html) continue;

          // Only check files that have a "Due" line — activities/quizzes
          // without a displayed due date are fine without data-due-date
          var hasDueLine = /Due[:\s]/i.test(html);
          if (!hasDueLine) continue;

          if (!html.includes('data-due-date="' + row.key + '"')) {
            missing.push(row.key + ' → ' + row.htmlFile);
          }
        }

        assert.deepStrictEqual(missing, [],
          'Assignment files with Due line but no data-due-date: ' + missing.join(', '));
      });
    });

    describe(course.code + ' — sprint overview activity dates', function() {

      it('sprint-1 and sprint-2 activity items use data-due-date for CSV-tracked assignments', function() {
        var csvRows = loadCSV(course.csvFile);
        // Build set of htmlFile paths referenced in CSV
        var csvHtmlFiles = new Set();
        csvRows.forEach(function(row) {
          if (row.htmlFile) csvHtmlFiles.add(row.htmlFile);
        });

        var sprintFiles = ['sprint-1.html', 'sprint-2.html'];
        var missingKeys = [];

        for (var f = 0; f < sprintFiles.length; f++) {
          var html = readHTML(course.code + '/' + sprintFiles[f]);
          if (!html) continue;
          var lines = html.split('\n');
          var lastHref = null;

          for (var i = 0; i < lines.length; i++) {
            var hrefMatch = lines[i].match(/href="([^"]*\.html)"/);
            if (hrefMatch) {
              lastHref = hrefMatch[1].replace(/^\.\.\//, '').replace(/^\.\//, '');
            }

            // Find hardcoded activity-item__due spans
            var dueMatch = lines[i].match(/class="activity-item__due"(?![^>]*data-due-date)[^>]*>[^<]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
            if (dueMatch && lastHref) {
              // Only flag if the linked file is tracked in CSV
              var isTracked = false;
              csvHtmlFiles.forEach(function(csvFile) {
                if (lastHref.endsWith(csvFile) || csvFile.endsWith(lastHref) || lastHref === csvFile) {
                  isTracked = true;
                }
              });
              if (isTracked) {
                missingKeys.push(sprintFiles[f] + ':' + (i + 1) + ' linked to ' + lastHref);
              }
            }
          }
        }

        assert.deepStrictEqual(missingKeys, [],
          'CSV-tracked activity-item spans with hardcoded dates: ' + missingKeys.join('; '));
      });
    });
  }
});

// ============================================
// 6. Under Construction Banner Detection
// ============================================

describe('Under Construction banner detection', function() {

  // These are pages that are part of Sprint 1 or Sprint 2 (active content).
  // They should NOT have "Under Construction" banners.
  function getActiveSprintAssignments(csvRows) {
    return csvRows.filter(function(row) {
      return row.sprint === '1' || row.sprint === '2';
    });
  }

  for (const course of COURSES) {
    describe(course.code + ' — active sprint assignments', function() {

      it('no active sprint assignment pages have Under Construction banners', function() {
        const csvRows = loadCSV(course.csvFile);
        const activeRows = getActiveSprintAssignments(csvRows);
        const flagged = [];

        for (const row of activeRows) {
          if (!row.htmlFile) continue;
          const html = readHTML(course.code + '/' + row.htmlFile);
          if (!html) continue;
          if (/under\s+construction/i.test(html)) {
            flagged.push(row.key + ' → ' + row.htmlFile);
          }
        }

        assert.deepStrictEqual(flagged, [],
          'Active sprint assignments with Under Construction banners: ' + flagged.join(', '));
      });
    });
  }

  for (const course of COURSES) {
    describe(course.code + ' — core reference pages', function() {

      it('concepts.html should not have Under Construction banner', function() {
        const html = readHTML(course.code + '/concepts.html');
        if (!html) return; // page may not exist for this course
        assert.ok(
          !/under\s+construction/i.test(html),
          course.code + '/concepts.html is a core reference page and should not have an Under Construction banner'
        );
      });

      it('overview.html should not have Under Construction banner', function() {
        const html = readHTML(course.code + '/overview.html');
        assert.ok(html, 'overview.html should exist');
        assert.ok(
          !/under\s+construction/i.test(html),
          course.code + '/overview.html should not have an Under Construction banner'
        );
      });
    });
  }
});

// ============================================
// 7. CSV Completeness
// ============================================

describe('CSV data completeness', function() {

  for (const course of COURSES) {
    describe(course.code, function() {

      it('every CSV row has a non-empty key', function() {
        const csvRows = loadCSV(course.csvFile);
        const empty = csvRows.filter(function(row) { return !row.key; });
        assert.equal(empty.length, 0, 'Found ' + empty.length + ' CSV rows with empty keys');
      });

      it('every CSV row has a non-empty htmlFile', function() {
        const csvRows = loadCSV(course.csvFile);
        const empty = csvRows.filter(function(row) { return !row.htmlFile; });
        assert.equal(empty.length, 0,
          'Found ' + empty.length + ' CSV rows with empty htmlFile');
      });

      it('no duplicate keys in CSV', function() {
        const csvRows = loadCSV(course.csvFile);
        const seen = {};
        const dupes = [];
        for (const row of csvRows) {
          if (seen[row.key]) dupes.push(row.key);
          seen[row.key] = true;
        }
        assert.deepStrictEqual(dupes, [],
          'Duplicate CSV keys: ' + dupes.join(', '));
      });

      it('sprint values are valid (1-4)', function() {
        const csvRows = loadCSV(course.csvFile);
        const invalid = csvRows.filter(function(row) {
          return !['1', '2', '3', '4'].includes(row.sprint);
        });
        assert.equal(invalid.length, 0,
          'Invalid sprint values: ' + invalid.map(function(r) {
            return r.key + '=' + r.sprint;
          }).join(', '));
      });

      it('due dates are in chronological order within each sprint', function() {
        const csvRows = loadCSV(course.csvFile);
        const bySprint = {};

        for (const row of csvRows) {
          if (!bySprint[row.sprint]) bySprint[row.sprint] = [];
          bySprint[row.sprint].push(row);
        }

        const outOfOrder = [];
        for (const sprint in bySprint) {
          const rows = bySprint[sprint];
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].dueDate < rows[i - 1].dueDate) {
              outOfOrder.push(
                'Sprint ' + sprint + ': ' + rows[i - 1].key + ' (' + rows[i - 1].dueDate +
                ') before ' + rows[i].key + ' (' + rows[i].dueDate + ')'
              );
            }
          }
        }

        assert.deepStrictEqual(outOfOrder, [],
          'Out-of-order dates within sprints: ' + outOfOrder.join('; '));
      });
    });
  }
});

// ============================================
// 8. Cross-Course Terminology Consistency
// ============================================

describe('Terminology consistency (Sprint vs Blueprint/Studio)', function() {

  it('CST349 does not use Blueprint or Studio terminology', function() {
    const files = findHTMLFiles('cst349');
    const flagged = [];

    for (const file of files) {
      const html = readHTML(file);
      if (!html) continue;
      // Skip session files (facilitator content)
      if (file.includes('/sessions/')) continue;

      if (/\bblueprint\b/i.test(html) || /\bstudio\b/i.test(html)) {
        flagged.push(file);
      }
    }

    assert.deepStrictEqual(flagged, [],
      'CST349 files using Blueprint/Studio terminology: ' + flagged.join(', '));
  });

  it('CST395 assignment pages use Sprint consistently (flags Blueprint/Studio)', function() {
    const files = findHTMLFiles('cst395/assignments');
    const flagged = [];

    for (const file of files) {
      const html = readHTML(file);
      if (!html) continue;

      const lines = html.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip HTML attributes and script content
        if (/^\s*</.test(line) && /class=|id=|href=/.test(line)) continue;

        if (/\bblueprint\b/i.test(line)) {
          flagged.push(file + ':' + (i + 1) + ' — contains "Blueprint"');
        }
      }
    }

    // This documents the current state; after P3 it should pass
    if (flagged.length > 0) {
      assert.fail(
        'CST395 assignment pages using Blueprint terminology:\n  ' +
        flagged.join('\n  ') +
        '\n\nStandardize to "Sprint" per terminology.md. See GAP-8.'
      );
    }
  });
});
