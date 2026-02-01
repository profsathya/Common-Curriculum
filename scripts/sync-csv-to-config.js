#!/usr/bin/env node
/**
 * Sync CSV to Config Script
 *
 * Reads assignment data from CSV files and updates the corresponding
 * JavaScript config files. This is a build-time operation that keeps
 * the JS configs in sync with CSV data.
 *
 * Usage: node scripts/sync-csv-to-config.js
 *
 * What it does:
 * - Reads config/cst349-assignments.csv and config/cst395-assignments.csv
 * - Updates assignments in config/cst349-config.js and config/cst395-config.js
 * - Preserves JS-only fields (like questions arrays)
 * - Adds new columns (sprint, week, htmlFile) to JS config
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CSV Parsing (reuse from csv-loader.js)
// ============================================

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
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

  return rows;
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

// ============================================
// Config File Parsing
// ============================================

/**
 * Extract the assignments object from a config JS file
 * Returns the assignments as a JS object and metadata for reconstruction
 */
function parseConfigFile(content) {
  // Find the assignments object in the config
  const assignmentsMatch = content.match(/assignments:\s*\{/);
  if (!assignmentsMatch) {
    throw new Error('Could not find assignments object in config');
  }

  const startIdx = assignmentsMatch.index + assignmentsMatch[0].length - 1;

  // Find matching closing brace (handling nested braces)
  let braceCount = 1;
  let endIdx = startIdx + 1;
  while (braceCount > 0 && endIdx < content.length) {
    if (content[endIdx] === '{') braceCount++;
    if (content[endIdx] === '}') braceCount--;
    endIdx++;
  }

  const assignmentsStr = content.substring(startIdx, endIdx);

  // Parse assignments using eval (safe since we control the input)
  let assignments;
  try {
    // Wrap in parentheses to make it a valid expression
    assignments = eval('(' + assignmentsStr + ')');
  } catch (e) {
    throw new Error('Failed to parse assignments: ' + e.message);
  }

  return {
    assignments,
    beforeAssignments: content.substring(0, startIdx),
    afterAssignments: content.substring(endIdx)
  };
}

/**
 * Serialize an assignment object to JS code
 */
function serializeAssignment(key, assignment, indent = '    ') {
  const lines = [`${indent}"${key}": {`];

  // Order fields consistently
  const fieldOrder = [
    'canvasId', 'title', 'dueDate', 'type',
    'canvasType', 'quizType', 'assignmentGroup', 'points',
    'sprint', 'week', 'htmlFile',
    'questions'
  ];

  const usedFields = new Set();

  for (const field of fieldOrder) {
    if (assignment[field] !== undefined) {
      usedFields.add(field);
      lines.push(serializeField(field, assignment[field], indent + '  '));
    }
  }

  // Add any fields not in the standard order
  for (const [field, value] of Object.entries(assignment)) {
    if (!usedFields.has(field)) {
      lines.push(serializeField(field, value, indent + '  '));
    }
  }

  // Remove trailing comma from last field
  if (lines.length > 1) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  }

  lines.push(`${indent}}`);
  return lines.join('\n');
}

function serializeField(field, value, indent) {
  if (field === 'questions') {
    // Special handling for questions array
    return `${indent}questions: ${JSON.stringify(value, null, 2).split('\n').map((line, i) => i === 0 ? line : indent + line).join('\n')},`;
  } else if (typeof value === 'string') {
    return `${indent}${field}: "${value}",`;
  } else if (typeof value === 'number') {
    return `${indent}${field}: ${value},`;
  } else {
    return `${indent}${field}: ${JSON.stringify(value)},`;
  }
}

/**
 * Serialize all assignments to JS code
 */
function serializeAssignments(assignments) {
  const lines = ['{'];
  const keys = Object.keys(assignments);

  // Group by sprint for readability
  let currentSprint = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const assignment = assignments[key];

    // Add sprint comment if sprint changed
    const sprint = assignment.sprint || parseInt(key.match(/^s(\d)/)?.[1]) || null;
    if (sprint !== currentSprint && sprint) {
      if (currentSprint !== null) lines.push('');
      lines.push(`    // Sprint ${sprint}`);
      currentSprint = sprint;
    }

    lines.push(serializeAssignment(key, assignment));
    if (i < keys.length - 1) {
      lines[lines.length - 1] += ',';
    }
  }

  lines.push('  }');
  return lines.join('\n');
}

// ============================================
// Main Sync Logic
// ============================================

function syncCsvToConfig(csvPath, configPath) {
  console.log(`\nSyncing ${path.basename(csvPath)} -> ${path.basename(configPath)}`);

  // Read files
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const configContent = fs.readFileSync(configPath, 'utf8');

  // Parse CSV
  const csvRows = parseCSV(csvContent);
  console.log(`  Found ${csvRows.length} assignments in CSV`);

  // Parse config
  const { assignments, beforeAssignments, afterAssignments } = parseConfigFile(configContent);
  console.log(`  Found ${Object.keys(assignments).length} assignments in config`);

  // Update assignments with CSV data
  let updated = 0;
  let added = 0;

  for (const row of csvRows) {
    const key = row.key;
    if (!key) continue;

    if (assignments[key]) {
      // Update existing assignment
      if (row.canvasId) assignments[key].canvasId = row.canvasId;
      if (row.title) assignments[key].title = row.title;
      if (row.dueDate) assignments[key].dueDate = row.dueDate;
      if (row.type) assignments[key].type = row.type;
      if (row.assignmentGroup) assignments[key].assignmentGroup = row.assignmentGroup;
      if (row.points) assignments[key].points = parseInt(row.points, 10);
      if (row.canvasType) assignments[key].canvasType = row.canvasType;
      if (row.quizType) assignments[key].quizType = row.quizType;

      // Add new columns from Stage 1
      if (row.sprint) assignments[key].sprint = parseInt(row.sprint, 10);
      if (row.week) assignments[key].week = parseInt(row.week, 10);
      if (row.htmlFile) assignments[key].htmlFile = row.htmlFile;

      updated++;
    } else {
      // New assignment from CSV
      assignments[key] = {
        canvasId: row.canvasId || '',
        title: row.title || '',
        dueDate: row.dueDate || '',
        type: row.type || 'assignment'
      };

      if (row.assignmentGroup) assignments[key].assignmentGroup = row.assignmentGroup;
      if (row.points) assignments[key].points = parseInt(row.points, 10);
      if (row.canvasType) assignments[key].canvasType = row.canvasType;
      if (row.quizType) assignments[key].quizType = row.quizType;
      if (row.sprint) assignments[key].sprint = parseInt(row.sprint, 10);
      if (row.week) assignments[key].week = parseInt(row.week, 10);
      if (row.htmlFile) assignments[key].htmlFile = row.htmlFile;

      added++;
    }
  }

  console.log(`  Updated: ${updated}, Added: ${added}`);

  // Reconstruct config file
  const newAssignmentsStr = serializeAssignments(assignments);
  const newConfigContent = beforeAssignments + newAssignmentsStr + afterAssignments;

  // Write updated config
  fs.writeFileSync(configPath, newConfigContent);
  console.log(`  Written to ${configPath}`);
}

// ============================================
// Run
// ============================================

const rootDir = path.join(__dirname, '..');

const syncs = [
  {
    csv: path.join(rootDir, 'config', 'cst349-assignments.csv'),
    config: path.join(rootDir, 'config', 'cst349-config.js')
  },
  {
    csv: path.join(rootDir, 'config', 'cst395-assignments.csv'),
    config: path.join(rootDir, 'config', 'cst395-config.js')
  }
];

console.log('CSV to Config Sync');
console.log('==================');

for (const { csv, config } of syncs) {
  if (fs.existsSync(csv) && fs.existsSync(config)) {
    try {
      syncCsvToConfig(csv, config);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  } else {
    console.log(`  Skipping: ${path.basename(csv)} or ${path.basename(config)} not found`);
  }
}

console.log('\nDone!');
