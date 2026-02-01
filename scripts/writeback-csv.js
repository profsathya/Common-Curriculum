#!/usr/bin/env node
/**
 * Writeback CSV Script
 *
 * Writes Canvas IDs from config files back to CSV files.
 * This keeps CSV as the ground truth after Canvas creates assignments.
 *
 * Usage: node scripts/writeback-csv.js [--dry-run=true|false]
 *
 * What it does:
 * - Reads assignments from config/cst349-config.js and config/cst395-config.js
 * - Updates Canvas IDs in config/cst349-assignments.csv and config/cst395-assignments.csv
 * - Only updates rows where the Canvas ID has changed
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Configuration
// ============================================

const courses = [
  {
    name: 'CST349',
    configPath: 'config/cst349-config.js',
    configVar: 'CST349_CONFIG',
    csvPath: 'config/cst349-assignments.csv'
  },
  {
    name: 'CST395',
    configPath: 'config/cst395-config.js',
    configVar: 'CST395_CONFIG',
    csvPath: 'config/cst395-assignments.csv'
  }
];

// ============================================
// CSV Parsing
// ============================================

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

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

function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function rowToCSVLine(row, headers) {
  return headers.map(h => escapeCSVValue(row[h])).join(',');
}

// ============================================
// Config Parsing
// ============================================

function loadConfig(configFile, configVarName) {
  const configPath = path.join(process.cwd(), configFile);
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const content = fs.readFileSync(configPath, 'utf-8');

  try {
    const fn = new Function(content + `\nreturn ${configVarName};`);
    return fn();
  } catch (err) {
    throw new Error(`Could not parse config from ${configFile}: ${err.message}`);
  }
}

// ============================================
// Main Logic
// ============================================

function writebackCsvForCourse(course, dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Writeback CSV for ${course.name}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  const csvPath = path.join(process.cwd(), course.csvPath);
  if (!fs.existsSync(csvPath)) {
    console.log(`  CSV not found: ${course.csvPath}`);
    return { updated: 0, skipped: 0 };
  }

  const config = loadConfig(course.configPath, course.configVar);
  if (!config) {
    console.log(`  Config not found: ${course.configPath}`);
    return { updated: 0, skipped: 0 };
  }

  // Read CSV
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const { headers, rows } = parseCSV(csvContent);

  console.log(`  Config assignments: ${Object.keys(config.assignments).length}`);
  console.log(`  CSV rows: ${rows.length}`);

  // Track changes
  let updated = 0;
  let skipped = 0;

  // Update CSV rows with Canvas IDs from config
  for (const row of rows) {
    const key = row.key;
    if (!key) continue;

    const configEntry = config.assignments[key];
    if (!configEntry) {
      console.log(`  ⚠ Key not in config: ${key}`);
      continue;
    }

    const configCanvasId = configEntry.canvasId || '';
    const csvCanvasId = row.canvasId || '';

    if (configCanvasId !== csvCanvasId) {
      console.log(`  ${key}: "${csvCanvasId}" → "${configCanvasId}"`);
      row.canvasId = configCanvasId;
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Updated: ${updated} | Unchanged: ${skipped}`);

  if (updated === 0) {
    console.log('\n✓ CSV is already up to date');
    return { updated, skipped };
  }

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No changes made. Run with --dry-run=false to apply.`);
    return { updated, skipped };
  }

  // Write updated CSV
  const newCsvContent = [
    headers.join(','),
    ...rows.map(row => rowToCSVLine(row, headers))
  ].join('\n') + '\n';

  fs.writeFileSync(csvPath, newCsvContent, 'utf8');
  console.log(`\n✓ Updated ${course.csvPath}`);

  return { updated, skipped };
}

// ============================================
// CLI
// ============================================

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

function main() {
  const args = parseArgs();
  const dryRun = args['dry-run'] !== 'false';

  console.log('Writeback CSV');
  console.log('=============');
  console.log(`Dry Run: ${dryRun}`);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const course of courses) {
    const result = writebackCsvForCourse(course, dryRun);
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total unchanged: ${totalSkipped}`);
}

main();
