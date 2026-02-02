#!/usr/bin/env node
/**
 * Canvas Sync Script
 *
 * Syncs assignment IDs from Canvas LMS to local config files.
 * Run via GitHub Actions or locally with environment variables.
 *
 * Usage:
 *   node scripts/canvas-sync.js --action=fetch-assignments --course=cst349
 *   node scripts/canvas-sync.js --action=validate-config --course=both
 *   node scripts/canvas-sync.js --action=list-courses
 *
 * Environment Variables:
 *   CANVAS_API_TOKEN - Your Canvas API access token
 *   CANVAS_BASE_URL  - Canvas instance URL (e.g., https://csumb.instructure.com)
 */

const fs = require('fs');
const path = require('path');
const { CanvasAPI } = require('./canvas-api.js');

// Course configurations
const COURSES = {
  cst349: {
    configFile: 'config/cst349-config.js',
    configVar: 'CST349_CONFIG',
    csvFile: 'config/cst349-assignments.csv',
    htmlDir: 'cst349',
  },
  cst395: {
    configFile: 'config/cst395-config.js',
    configVar: 'CST395_CONFIG',
    csvFile: 'config/cst395-assignments.csv',
    htmlDir: 'cst395',
  },
};

// GitHub Pages base URL for iframe embedding
const GITHUB_PAGES_BASE_URL = 'https://profsathya.github.io/Common-Curriculum';

/**
 * Parse CSV file and return set of assignment keys
 * CSV is the source of truth for what should be created
 */
function loadCsvKeys(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return new Set();
  }
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return new Set();

  // Parse header to find key column index
  const headers = lines[0].split(',').map(h => h.trim());
  const keyIndex = headers.indexOf('key');
  if (keyIndex === -1) return new Set();

  const keys = new Set();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const key = values[keyIndex]?.trim();
    if (key) keys.add(key);
  }
  return keys;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

/**
 * Load a config file and extract the config object
 */
function loadConfig(configFile, configVarName) {
  const configPath = path.join(process.cwd(), configFile);
  const content = fs.readFileSync(configPath, 'utf-8');

  // Use Function constructor to execute the config and return the config object
  // This handles const/let declarations properly
  try {
    const fn = new Function(content + `\nreturn ${configVarName};`);
    const config = fn();
    return { config, rawContent: content, configPath };
  } catch (err) {
    throw new Error(`Could not parse config from ${configFile}: ${err.message}`);
  }
}

/**
 * Extract course ID from Canvas URL
 */
function extractCourseId(canvasBaseUrl) {
  const match = canvasBaseUrl.match(/\/courses\/(\d+)/);
  if (!match) {
    throw new Error(`Could not extract course ID from URL: ${canvasBaseUrl}`);
  }
  return match[1];
}

/**
 * Normalize title for matching (lowercase, remove extra spaces)
 */
function normalizeTitle(title) {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Extract the core part of a title (remove sprint prefixes for fuzzy matching)
 * Examples:
 *   "Sprint 1: Skills Self-Assessment" -> "skills self-assessment"
 *   "S1: Superagency Challenge" -> "superagency challenge"
 *   "Skills Self-Assessment" -> "skills self-assessment"
 */
function extractTitleCore(title) {
  return title
    .toLowerCase()
    .replace(/^sprint\s*\d+\s*:\s*/i, '')  // Remove "Sprint 1: " prefix
    .replace(/^s\d+\s*:\s*/i, '')           // Remove "S1: " prefix
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy match Canvas assignments to config entries
 * Returns matches based on the core title (ignoring sprint prefixes)
 */
function fuzzyMatchAssignments(canvasAssignments, configAssignments) {
  const results = {
    matched: [],
    unmatchedCanvas: [],
    unmatchedConfig: [],
  };

  // Create lookup map from Canvas assignments by core title
  const canvasMap = new Map();
  canvasAssignments.forEach(a => {
    const core = extractTitleCore(a.name);
    if (!canvasMap.has(core)) {
      canvasMap.set(core, a);
    }
  });

  // Try to match each config entry
  for (const [key, configEntry] of Object.entries(configAssignments)) {
    const configCore = extractTitleCore(configEntry.title);
    const canvasAssignment = canvasMap.get(configCore);

    if (canvasAssignment) {
      results.matched.push({
        key,
        configTitle: configEntry.title,
        canvasId: String(canvasAssignment.id),
        canvasTitle: canvasAssignment.name,
        needsRename: canvasAssignment.name !== configEntry.title,
        configEntry,
      });
      canvasMap.delete(configCore);
    } else {
      results.unmatchedConfig.push({
        key,
        title: configEntry.title,
        configEntry,
      });
    }
  }

  // Remaining Canvas assignments not matched to config
  canvasMap.forEach((assignment) => {
    results.unmatchedCanvas.push({
      canvasId: String(assignment.id),
      title: assignment.name,
    });
  });

  return results;
}

/**
 * Match Canvas assignments to config entries by title
 */
function matchAssignments(canvasAssignments, configAssignments) {
  const results = {
    matched: [],
    unmatched: [],
    notInCanvas: [],
  };

  // Create lookup map from Canvas assignments
  const canvasMap = new Map();
  canvasAssignments.forEach(a => {
    canvasMap.set(normalizeTitle(a.name), a);
  });

  // Try to match each config entry
  for (const [key, configEntry] of Object.entries(configAssignments)) {
    const normalizedTitle = normalizeTitle(configEntry.title);
    const canvasAssignment = canvasMap.get(normalizedTitle);

    if (canvasAssignment) {
      results.matched.push({
        key,
        configTitle: configEntry.title,
        oldCanvasId: configEntry.canvasId,
        newCanvasId: String(canvasAssignment.id),
        canvasTitle: canvasAssignment.name,
        changed: configEntry.canvasId !== String(canvasAssignment.id),
      });
      canvasMap.delete(normalizedTitle); // Remove matched items
    } else {
      results.notInCanvas.push({
        key,
        title: configEntry.title,
        canvasId: configEntry.canvasId,
      });
    }
  }

  // Remaining Canvas assignments not in config
  canvasMap.forEach((assignment, title) => {
    results.unmatched.push({
      canvasId: String(assignment.id),
      title: assignment.name,
    });
  });

  return results;
}

/**
 * Update config file with new Canvas IDs
 */
function updateConfigFile(configPath, rawContent, matchedAssignments) {
  let updatedContent = rawContent;
  let changeCount = 0;

  for (const match of matchedAssignments) {
    if (match.changed) {
      // Replace the canvasId value for this assignment
      // Match pattern: "key": { canvasId: "oldId", ...
      const pattern = new RegExp(
        `("${match.key}":\\s*\\{[^}]*canvasId:\\s*)"${match.oldCanvasId}"`,
        'g'
      );
      const newContent = updatedContent.replace(pattern, `$1"${match.newCanvasId}"`);

      if (newContent !== updatedContent) {
        updatedContent = newContent;
        changeCount++;
      }
    }
  }

  if (changeCount > 0) {
    fs.writeFileSync(configPath, updatedContent, 'utf-8');
  }

  return changeCount;
}

/**
 * Action: Fetch assignments from Canvas and update config
 */
async function fetchAssignments(api, courseName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Syncing ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config, rawContent, configPath } = loadConfig(courseInfo.configFile, courseInfo.configVar);

  const courseId = extractCourseId(config.canvasBaseUrl);
  console.log(`Canvas Course ID: ${courseId}`);
  console.log(`Config file: ${courseInfo.configFile}`);

  // Fetch assignments from Canvas
  console.log('\nFetching assignments from Canvas...');
  const canvasAssignments = await api.listAssignments(courseId);
  console.log(`Found ${canvasAssignments.length} assignments in Canvas`);

  // Also fetch quizzes (Canvas treats some assignments as quizzes)
  console.log('Fetching quizzes from Canvas...');
  const canvasQuizzes = await api.listQuizzes(courseId);
  console.log(`Found ${canvasQuizzes.length} quizzes in Canvas`);

  // Combine assignments and quizzes for matching
  const allCanvasItems = [
    ...canvasAssignments,
    ...canvasQuizzes.map(q => ({ id: q.id, name: q.title })),
  ];

  // Match assignments
  const results = matchAssignments(allCanvasItems, config.assignments);

  // Report results
  console.log(`\n${'─'.repeat(40)}`);
  console.log('MATCH RESULTS:');
  console.log(`  Matched: ${results.matched.length}`);
  console.log(`  Changed: ${results.matched.filter(m => m.changed).length}`);
  console.log(`  Not in Canvas: ${results.notInCanvas.length}`);
  console.log(`  Canvas items not in config: ${results.unmatched.length}`);

  // Show changes
  const changes = results.matched.filter(m => m.changed);
  if (changes.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('CHANGES TO APPLY:');
    changes.forEach(m => {
      console.log(`  ${m.key}: ${m.oldCanvasId} → ${m.newCanvasId}`);
    });
  }

  // Show items not found in Canvas
  if (results.notInCanvas.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('CONFIG ITEMS NOT FOUND IN CANVAS (may need to create):');
    results.notInCanvas.forEach(item => {
      console.log(`  ${item.key}: "${item.title}"`);
    });
  }

  // Show Canvas items not in config
  if (results.unmatched.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('CANVAS ITEMS NOT IN CONFIG (may need to add):');
    results.unmatched.slice(0, 10).forEach(item => {
      console.log(`  [${item.canvasId}] "${item.title}"`);
    });
    if (results.unmatched.length > 10) {
      console.log(`  ... and ${results.unmatched.length - 10} more`);
    }
  }

  // Update config file
  if (changes.length > 0) {
    const changeCount = updateConfigFile(configPath, rawContent, results.matched);
    console.log(`\n✓ Updated ${changeCount} assignment IDs in ${courseInfo.configFile}`);
  } else {
    console.log('\n✓ Config is up to date - no changes needed');
  }

  return results;
}

/**
 * Action: Validate config against Canvas (no changes)
 */
async function validateConfig(api, courseName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Validating ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config } = loadConfig(courseInfo.configFile, courseInfo.configVar);

  const courseId = extractCourseId(config.canvasBaseUrl);

  // Fetch assignments
  const canvasAssignments = await api.listAssignments(courseId);
  const canvasQuizzes = await api.listQuizzes(courseId);
  const allCanvasItems = [
    ...canvasAssignments,
    ...canvasQuizzes.map(q => ({ id: q.id, name: q.title })),
  ];

  // Create ID lookup
  const canvasIdMap = new Map(allCanvasItems.map(a => [String(a.id), a.name]));

  // Check each config entry
  let validCount = 0;
  let invalidCount = 0;

  console.log('\nValidating assignment IDs...\n');

  for (const [key, entry] of Object.entries(config.assignments)) {
    const canvasName = canvasIdMap.get(entry.canvasId);
    if (canvasName) {
      validCount++;
      // Optionally show all valid entries
      // console.log(`  ✓ ${key}: ID ${entry.canvasId} exists`);
    } else {
      invalidCount++;
      console.log(`  ✗ ${key}: ID ${entry.canvasId} NOT FOUND in Canvas`);
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);

  if (invalidCount > 0) {
    console.log('\n⚠ Run with --action=fetch-assignments to fix invalid IDs');
    process.exit(1);
  } else {
    console.log('\n✓ All assignment IDs are valid');
  }
}

/**
 * Action: Rename Canvas assignments to match config titles
 * Uses fuzzy matching to find corresponding assignments
 */
async function renameAssignments(api, courseName, dryRun = true, limit = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Renaming assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}${limit > 0 ? ` (LIMIT: ${limit})` : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}`);

  // Fetch assignments from Canvas
  console.log('\nFetching assignments from Canvas...');
  const canvasAssignments = await api.listAssignments(courseId);
  console.log(`Found ${canvasAssignments.length} assignments`);

  // Fuzzy match
  const results = fuzzyMatchAssignments(canvasAssignments, config.assignments);

  // Find assignments that need renaming
  const toRename = results.matched.filter(m => m.needsRename);

  console.log(`\n${'─'.repeat(40)}`);
  console.log('FUZZY MATCH RESULTS:');
  console.log(`  Matched: ${results.matched.length}`);
  console.log(`  Need renaming: ${toRename.length}`);
  console.log(`  Config items not in Canvas: ${results.unmatchedConfig.length}`);
  console.log(`  Canvas items not in config: ${results.unmatchedCanvas.length}`);

  if (toRename.length === 0) {
    console.log('\n✓ No assignments need renaming');
    return results;
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ASSIGNMENTS TO RENAME:');
  toRename.forEach(m => {
    console.log(`  [${m.canvasId}] "${m.canvasTitle}"`);
    console.log(`       → "${m.configTitle}"`);
  });

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No changes made. Run with --dry-run=false to apply changes.`);
    return results;
  }

  // Actually rename the assignments
  console.log(`\n${'─'.repeat(40)}`);
  console.log('APPLYING CHANGES...');

  let successCount = 0;
  let errorCount = 0;
  const itemsToProcess = limit > 0 ? toRename.slice(0, limit) : toRename;

  if (limit > 0 && toRename.length > limit) {
    console.log(`  (Processing ${limit} of ${toRename.length} items)\n`);
  }

  for (const match of itemsToProcess) {
    try {
      await api.updateAssignment(courseId, match.canvasId, {
        name: match.configTitle,
      });
      console.log(`  ✓ Renamed: "${match.canvasTitle}" → "${match.configTitle}"`);
      successCount++;
    } catch (err) {
      console.log(`  ✗ Failed to rename [${match.canvasId}]: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Renamed: ${successCount} | Failed: ${errorCount}`);
  if (limit > 0 && toRename.length > limit) {
    console.log(`Remaining: ${toRename.length - limit} items (run again to continue)`);
  }

  return results;
}

/**
 * Convert config date to Canvas ISO format
 */
function toCanvasDate(dateString) {
  if (!dateString) return null;
  return `${dateString}T23:59:00Z`;
}

/**
 * Parse Canvas date to YYYY-MM-DD format
 */
function fromCanvasDate(isoString) {
  if (!isoString) return null;
  return isoString.split('T')[0];
}

/**
 * Get points based on assignment type
 */
function getPointsForType(type) {
  if (type === 'reflection') return 10;
  if (type === 'bridge') return 20;
  if (type === 'engagement') return 5;
  return 100;
}

/**
 * Action: Update Canvas assignments to match config (name, due date, points)
 * This is a comprehensive sync from config → Canvas
 */
async function updateAssignments(api, courseName, dryRun = true, limit = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Updating assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}${limit > 0 ? ` (LIMIT: ${limit})` : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}`);

  // Fetch assignments from Canvas
  console.log('\nFetching assignments from Canvas...');
  const canvasAssignments = await api.listAssignments(courseId);
  console.log(`Found ${canvasAssignments.length} assignments`);

  // Create lookup by ID
  const canvasById = new Map(canvasAssignments.map(a => [String(a.id), a]));

  // Find assignments that need updating
  const toUpdate = [];

  for (const [key, configEntry] of Object.entries(config.assignments)) {
    const canvasAssignment = canvasById.get(configEntry.canvasId);
    if (!canvasAssignment) continue;

    const changes = [];
    const updates = {};

    // Check name
    if (canvasAssignment.name !== configEntry.title) {
      changes.push(`name: "${canvasAssignment.name}" → "${configEntry.title}"`);
      updates.name = configEntry.title;
    }

    // Check due date
    const configDue = configEntry.dueDate;
    const canvasDue = fromCanvasDate(canvasAssignment.due_at);
    if (configDue && configDue !== canvasDue) {
      changes.push(`due: ${canvasDue || 'none'} → ${configDue}`);
      updates.due_at = toCanvasDate(configDue);
    }

    // Check points
    const expectedPoints = getPointsForType(configEntry.type);
    if (canvasAssignment.points_possible !== expectedPoints) {
      changes.push(`points: ${canvasAssignment.points_possible} → ${expectedPoints}`);
      updates.points_possible = expectedPoints;
    }

    if (changes.length > 0) {
      toUpdate.push({
        key,
        canvasId: configEntry.canvasId,
        title: configEntry.title,
        changes,
        updates,
      });
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ANALYSIS:');
  console.log(`  Assignments checked: ${Object.keys(config.assignments).length}`);
  console.log(`  Found in Canvas: ${canvasById.size}`);
  console.log(`  Need updates: ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log('\n✓ All assignments are up to date');
    return { updated: [] };
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ASSIGNMENTS TO UPDATE:');
  toUpdate.forEach(item => {
    console.log(`\n  ${item.key} [${item.canvasId}]:`);
    item.changes.forEach(change => {
      console.log(`    • ${change}`);
    });
  });

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No changes made. Run with --dry-run=false to apply changes.`);
    return { updated: [] };
  }

  // Apply updates
  console.log(`\n${'─'.repeat(40)}`);
  console.log('APPLYING CHANGES...');

  let successCount = 0;
  let errorCount = 0;
  const itemsToProcess = limit > 0 ? toUpdate.slice(0, limit) : toUpdate;

  if (limit > 0 && toUpdate.length > limit) {
    console.log(`  (Processing ${limit} of ${toUpdate.length} items)\n`);
  }

  for (const item of itemsToProcess) {
    try {
      await api.updateAssignment(courseId, item.canvasId, item.updates);
      console.log(`  ✓ Updated: ${item.key}`);
      successCount++;
    } catch (err) {
      console.log(`  ✗ Failed: ${item.key} - ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Updated: ${successCount} | Failed: ${errorCount}`);
  if (limit > 0 && toUpdate.length > limit) {
    console.log(`Remaining: ${toUpdate.length - limit} items (run again to continue)`);
  }

  return { updated: itemsToProcess.filter((_, i) => i < successCount) };
}

/**
 * Action: Create assignments in Canvas from config
 * Only creates assignments that don't already exist
 */
async function createAssignments(api, courseName, dryRun = true, limit = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}${limit > 0 ? ` (LIMIT: ${limit})` : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config, rawContent, configPath } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}`);

  // Fetch existing assignments from Canvas
  console.log('\nFetching existing assignments from Canvas...');
  const canvasAssignments = await api.listAssignments(courseId);
  console.log(`Found ${canvasAssignments.length} existing assignments`);

  // Load CSV to determine which assignments should be created
  // CSV is the source of truth - only create what's been reviewed in CSV
  const csvPath = path.join(process.cwd(), courseInfo.csvFile);
  const csvKeys = loadCsvKeys(csvPath);
  console.log(`Found ${csvKeys.size} assignments in CSV (source of truth)`);

  // Fuzzy match to find what's missing
  const results = fuzzyMatchAssignments(canvasAssignments, config.assignments);

  // Filter to only assignments that are in the CSV (reviewed) and don't have a canvasId
  const toCreate = results.unmatchedConfig.filter(item => {
    if (!csvKeys.has(item.key)) return false;
    const entry = item.configEntry;
    return !entry.canvasId || entry.canvasId === 'null' || entry.canvasId === '';
  });

  // Count config-only entries (not in CSV)
  const configOnlyCount = results.unmatchedConfig.length - toCreate.length;

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ANALYSIS:');
  console.log(`  Already exist: ${results.matched.length}`);
  console.log(`  In CSV, need to create: ${toCreate.length}`);
  if (configOnlyCount > 0) {
    console.log(`  Config-only (not in CSV, skipped): ${configOnlyCount}`);
  }

  if (toCreate.length === 0) {
    console.log('\n✓ All assignments already exist in Canvas');
    return { created: [], results };
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ASSIGNMENTS TO CREATE:');
  toCreate.forEach(item => {
    const entry = item.configEntry;
    console.log(`  ${item.key}: "${item.title}"`);
    console.log(`       Due: ${entry.dueDate || 'Not set'} | Type: ${entry.type || 'assignment'}`);
  });

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No changes made. Run with --dry-run=false to apply changes.`);
    return { created: [], results };
  }

  // Actually create the assignments
  console.log(`\n${'─'.repeat(40)}`);
  console.log('CREATING ASSIGNMENTS...');

  const created = [];
  let errorCount = 0;
  const itemsToProcess = limit > 0 ? toCreate.slice(0, limit) : toCreate;

  if (limit > 0 && toCreate.length > limit) {
    console.log(`  (Processing ${limit} of ${toCreate.length} items)\n`);
  }

  for (const item of itemsToProcess) {
    const entry = item.configEntry;

    // Build assignment data for Canvas API
    const assignmentData = {
      name: item.title,
      submission_types: ['online_text_entry', 'online_upload'],
      published: false, // Create as draft
    };

    // Add due date if specified
    if (entry.dueDate) {
      // Canvas expects ISO 8601 format with time
      assignmentData.due_at = `${entry.dueDate}T23:59:00Z`;
    }

    // Set points based on type
    if (entry.type === 'reflection') {
      assignmentData.points_possible = 10;
    } else if (entry.type === 'bridge') {
      assignmentData.points_possible = 20;
    } else if (entry.points) {
      assignmentData.points_possible = entry.points;
    } else {
      assignmentData.points_possible = 100;
    }

    // Add iframe description if htmlFile is specified
    if (entry.htmlFile) {
      const iframeUrl = `${GITHUB_PAGES_BASE_URL}/${courseInfo.htmlDir}/${entry.htmlFile}`;
      assignmentData.description = `<iframe src="${iframeUrl}" width="100%" height="800" style="border:none;"></iframe>`;
    }

    try {
      const newAssignment = await api.createAssignment(courseId, assignmentData);
      console.log(`  ✓ Created: "${item.title}" [ID: ${newAssignment.id}]`);
      created.push({
        key: item.key,
        title: item.title,
        canvasId: String(newAssignment.id),
      });
    } catch (err) {
      console.log(`  ✗ Failed to create "${item.title}": ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Created: ${created.length} | Failed: ${errorCount}`);
  if (limit > 0 && toCreate.length > limit) {
    console.log(`Remaining: ${toCreate.length - limit} items (run again to continue)`);
  }

  // Update config file with new Canvas IDs
  if (created.length > 0) {
    console.log(`\nUpdating config file with new Canvas IDs...`);
    let updatedContent = rawContent;

    for (const item of created) {
      // Find and update the canvasId for this assignment key
      const pattern = new RegExp(
        `("${item.key}":\\s*\\{[^}]*canvasId:\\s*)"[^"]*"`,
        'g'
      );
      updatedContent = updatedContent.replace(pattern, `$1"${item.canvasId}"`);
    }

    fs.writeFileSync(configPath, updatedContent, 'utf-8');
    console.log(`✓ Updated ${created.length} assignment IDs in ${courseInfo.configFile}`);
  }

  return { created, results };
}

/**
 * Action: List available courses
 */
async function listCourses(api) {
  console.log('\nFetching your Canvas courses...\n');

  const courses = await api.listCourses();

  // Filter to show only active courses
  const activeCourses = courses.filter(c =>
    c.workflow_state === 'available' ||
    c.workflow_state === 'unpublished'
  );

  console.log('Your Canvas Courses:');
  console.log('─'.repeat(60));

  activeCourses.forEach(course => {
    const term = course.term?.name || 'No term';
    console.log(`  [${course.id}] ${course.name}`);
    console.log(`       Term: ${term} | State: ${course.workflow_state}`);
    console.log(`       URL: ${course.html_url || 'N/A'}`);
    console.log();
  });

  console.log(`Total: ${activeCourses.length} courses`);
}

/**
 * Action: List assignment groups for a course
 */
async function listGroups(api, courseName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Assignment Groups for ${courseName.toUpperCase()}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}\n`);

  const groups = await api.listAssignmentGroups(courseId);

  console.log('Assignment Groups:');
  console.log('─'.repeat(50));

  groups.forEach(group => {
    const weight = group.group_weight || 0;
    console.log(`  [${group.id}] ${group.name}`);
    console.log(`       Weight: ${weight}% | Position: ${group.position}`);
  });

  console.log(`\nTotal: ${groups.length} groups`);
  console.log('\nUse these group IDs in config: assignmentGroup: "<group_id>"');

  return groups;
}

/**
 * Build Canvas question object from config question
 */
function buildCanvasQuestion(configQuestion, index) {
  const question = {
    question_name: `Question ${index + 1}`,
    question_text: configQuestion.text,
    points_possible: configQuestion.points || 1,
  };

  switch (configQuestion.type) {
    case 'multiple_choice':
      question.question_type = 'multiple_choice_question';
      question.answers = configQuestion.answers.map((answer, i) => ({
        answer_text: answer,
        answer_weight: 100 / configQuestion.answers.length, // Equal weight for surveys
      }));
      break;

    case 'essay':
    case 'text':
      question.question_type = 'essay_question';
      break;

    case 'short_answer':
      question.question_type = 'short_answer_question';
      break;

    case 'scale':
    case 'likert':
      // Canvas doesn't have native Likert, use multiple choice
      question.question_type = 'multiple_choice_question';
      const min = configQuestion.min || 1;
      const max = configQuestion.max || 5;
      const labels = configQuestion.labels || {};
      question.answers = [];
      for (let i = min; i <= max; i++) {
        const label = labels[i] || String(i);
        question.answers.push({
          answer_text: `${i} - ${label}`,
          answer_weight: 100 / (max - min + 1),
        });
      }
      break;

    case 'true_false':
      question.question_type = 'true_false_question';
      break;

    default:
      question.question_type = 'essay_question';
  }

  return question;
}

/**
 * Action: Create quizzes/surveys in Canvas from config
 */
async function createQuizzes(api, courseName, dryRun = true, limit = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating quizzes for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}${limit > 0 ? ` (LIMIT: ${limit})` : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config, rawContent, configPath } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}`);

  // Get assignment groups for mapping
  const assignmentGroups = await api.listAssignmentGroups(courseId);
  const groupByName = new Map(assignmentGroups.map(g => [g.name.toLowerCase(), g]));
  const groupById = new Map(assignmentGroups.map(g => [String(g.id), g]));

  // Fetch existing quizzes
  console.log('\nFetching existing quizzes from Canvas...');
  const existingQuizzes = await api.listQuizzes(courseId);
  const existingByTitle = new Map(existingQuizzes.map(q => [q.title.toLowerCase(), q]));
  console.log(`Found ${existingQuizzes.length} existing quizzes`);

  // Load CSV to determine which quizzes should be created
  // CSV is the source of truth - only create what's been reviewed in CSV
  const csvPath = path.join(process.cwd(), courseInfo.csvFile);
  const csvKeys = loadCsvKeys(csvPath);
  console.log(`Found ${csvKeys.size} assignments in CSV (source of truth)`);

  // Find quiz entries in config (entries with canvasType: "quiz" or quizType field)
  // Only consider entries that are in the CSV
  const allQuizEntries = [];
  const quizEntries = [];
  for (const [key, entry] of Object.entries(config.assignments)) {
    if (entry.canvasType === 'quiz' || entry.quizType) {
      allQuizEntries.push({ key, ...entry });
      if (csvKeys.has(key)) {
        quizEntries.push({ key, ...entry });
      }
    }
  }

  if (quizEntries.length === 0) {
    console.log('\n✓ No quiz entries found in CSV');
    console.log('  To add a quiz, include canvasType: "quiz" and quizType in CSV');
    return { created: [] };
  }

  // Find quizzes that need to be created
  const toCreate = quizEntries.filter(entry => {
    const exists = existingByTitle.has(entry.title.toLowerCase());
    return !exists && (!entry.canvasId || entry.canvasId === 'null' || entry.canvasId === '');
  });

  // Count config-only quiz entries (not in CSV)
  const configOnlyCount = allQuizEntries.length - quizEntries.length;

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ANALYSIS:');
  console.log(`  Quiz entries in CSV: ${quizEntries.length}`);
  console.log(`  Already exist: ${quizEntries.length - toCreate.length}`);
  console.log(`  Need to create: ${toCreate.length}`);
  if (configOnlyCount > 0) {
    console.log(`  Config-only quizzes (not in CSV, skipped): ${configOnlyCount}`);
  }

  if (toCreate.length === 0) {
    console.log('\n✓ All quizzes already exist in Canvas');
    return { created: [] };
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log('QUIZZES TO CREATE:');
  toCreate.forEach(entry => {
    console.log(`\n  ${entry.key}: "${entry.title}"`);
    console.log(`       Type: ${entry.quizType || 'graded_survey'}`);
    console.log(`       Points: ${entry.points || 'auto'}`);
    console.log(`       Due: ${entry.dueDate || 'Not set'}`);
    if (entry.questions) {
      console.log(`       Questions: ${entry.questions.length}`);
    }
    if (entry.assignmentGroup) {
      console.log(`       Group: ${entry.assignmentGroup}`);
    }
  });

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No changes made. Run with --dry-run=false to apply changes.`);
    return { created: [] };
  }

  // Create quizzes
  console.log(`\n${'─'.repeat(40)}`);
  console.log('CREATING QUIZZES...');

  const created = [];
  let errorCount = 0;
  const itemsToProcess = limit > 0 ? toCreate.slice(0, limit) : toCreate;

  if (limit > 0 && toCreate.length > limit) {
    console.log(`  (Processing ${limit} of ${toCreate.length} items)\n`);
  }

  for (const entry of itemsToProcess) {
    try {
      // Build quiz data
      const quizData = {
        title: entry.title,
        quiz_type: entry.quizType || 'graded_survey',
        published: false,
      };

      // Add due date
      if (entry.dueDate) {
        const time = entry.dueTime || '23:59';
        quizData.due_at = `${entry.dueDate}T${time}:00Z`;
      }

      // Calculate points
      if (entry.points) {
        quizData.points_possible = entry.points;
      } else if (entry.questions) {
        // Sum question points
        quizData.points_possible = entry.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      }

      // Find assignment group
      if (entry.assignmentGroup) {
        // Try to match by name or ID
        const group = groupByName.get(entry.assignmentGroup.toLowerCase()) ||
                      groupById.get(String(entry.assignmentGroup));
        if (group) {
          quizData.assignment_group_id = group.id;
        } else {
          console.log(`  ⚠ Warning: Assignment group "${entry.assignmentGroup}" not found`);
        }
      }

      // Create the quiz
      const newQuiz = await api.createQuiz(courseId, quizData);
      console.log(`  ✓ Created quiz: "${entry.title}" [ID: ${newQuiz.id}]`);

      // Add questions if defined
      if (entry.questions && entry.questions.length > 0) {
        console.log(`    Adding ${entry.questions.length} questions...`);
        for (let i = 0; i < entry.questions.length; i++) {
          const question = buildCanvasQuestion(entry.questions[i], i);
          await api.addQuizQuestion(courseId, newQuiz.id, question);
        }
        console.log(`    ✓ Added ${entry.questions.length} questions`);
      }

      created.push({
        key: entry.key,
        title: entry.title,
        canvasId: String(newQuiz.id),
      });

    } catch (err) {
      console.log(`  ✗ Failed to create "${entry.title}": ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Created: ${created.length} | Failed: ${errorCount}`);
  if (limit > 0 && toCreate.length > limit) {
    console.log(`Remaining: ${toCreate.length - limit} items (run again to continue)`);
  }

  // Update config file with new Canvas IDs
  if (created.length > 0) {
    console.log(`\nUpdating config file with new Canvas IDs...`);
    let updatedContent = rawContent;

    for (const item of created) {
      const pattern = new RegExp(
        `("${item.key}":\\s*\\{[^}]*canvasId:\\s*)"[^"]*"`,
        'g'
      );
      updatedContent = updatedContent.replace(pattern, `$1"${item.canvasId}"`);
    }

    fs.writeFileSync(configPath, updatedContent, 'utf-8');
    console.log(`✓ Updated ${created.length} quiz IDs in ${courseInfo.configFile}`);
  }

  return { created };
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Build Canvas URL for an assignment entry
 */
function buildCanvasUrl(baseUrl, entry) {
  if (!entry.canvasId || entry.canvasId === '' || entry.canvasId === 'null') {
    return null;
  }

  // Quizzes use /quizzes/ path, assignments use /assignments/
  if (entry.canvasType === 'quiz' || entry.quizType) {
    return `${baseUrl}/quizzes/${entry.canvasId}`;
  }
  return `${baseUrl}/assignments/${entry.canvasId}`;
}

/**
 * Action: Sync HTML links with config Canvas IDs
 * Updates href attributes in HTML files based on data-canvas-assignment attributes
 */
async function syncHtmlLinks(courseName, dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Syncing HTML links for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config } = loadConfig(courseInfo.configFile, courseInfo.configVar);

  const htmlDir = path.join(process.cwd(), courseInfo.htmlDir);

  if (!fs.existsSync(htmlDir)) {
    console.log(`\n⚠ HTML directory not found: ${htmlDir}`);
    return { updated: [], notFound: [] };
  }

  // Find all HTML files
  const htmlFiles = findHtmlFiles(htmlDir);
  console.log(`Found ${htmlFiles.length} HTML files in ${courseInfo.htmlDir}/`);

  // Regex to find links with data-canvas-assignment attribute
  // Matches: <a ... data-canvas-assignment="key" ... href="..." ...>
  const linkRegex = /<a\s+([^>]*?)data-canvas-assignment=["']([^"']+)["']([^>]*?)>/gi;
  const hrefRegex = /href=["']([^"']*)["']/i;

  const results = {
    updated: [],
    notFound: [],
    noCanvasId: [],
    skipped: [],
  };

  for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fileModified = false;
    const relativePath = path.relative(process.cwd(), filePath);

    // Find all matches in this file
    let match;
    const updates = [];

    // Reset regex lastIndex
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const beforeAttr = match[1];
      const assignmentKey = match[2];
      const afterAttr = match[3];

      // Look up the assignment in config
      const entry = config.assignments[assignmentKey];

      if (!entry) {
        results.notFound.push({ file: relativePath, key: assignmentKey });
        continue;
      }

      const newUrl = buildCanvasUrl(config.canvasBaseUrl, entry);

      if (!newUrl) {
        results.noCanvasId.push({ file: relativePath, key: assignmentKey });
        continue;
      }

      // Extract current href
      const combinedAttrs = beforeAttr + afterAttr;
      const hrefMatch = combinedAttrs.match(hrefRegex);
      const currentHref = hrefMatch ? hrefMatch[1] : '';

      if (currentHref === newUrl) {
        results.skipped.push({ file: relativePath, key: assignmentKey });
        continue;
      }

      updates.push({
        key: assignmentKey,
        oldUrl: currentHref,
        newUrl: newUrl,
        fullMatch: fullMatch,
      });
    }

    // Apply updates to this file
    for (const update of updates) {
      // Build new link tag with updated href
      let newTag = update.fullMatch;

      if (hrefRegex.test(newTag)) {
        // Replace existing href
        newTag = newTag.replace(hrefRegex, `href="${update.newUrl}"`);
      } else {
        // Add href before the closing >
        newTag = newTag.slice(0, -1) + ` href="${update.newUrl}">`;
      }

      content = content.replace(update.fullMatch, newTag);
      fileModified = true;

      results.updated.push({
        file: relativePath,
        key: update.key,
        oldUrl: update.oldUrl,
        newUrl: update.newUrl,
      });
    }

    // Write file if modified
    if (fileModified && !dryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  // Report results
  console.log(`\n${'─'.repeat(40)}`);
  console.log('RESULTS:');
  console.log(`  Links updated: ${results.updated.length}`);
  console.log(`  Already correct: ${results.skipped.length}`);
  console.log(`  Config key not found: ${results.notFound.length}`);
  console.log(`  Missing Canvas ID: ${results.noCanvasId.length}`);

  if (results.updated.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('LINKS UPDATED:');
    results.updated.forEach(item => {
      console.log(`\n  ${item.file}`);
      console.log(`    ${item.key}: ${item.oldUrl || '(none)'}`);
      console.log(`         → ${item.newUrl}`);
    });
  }

  if (results.notFound.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('CONFIG KEYS NOT FOUND:');
    results.notFound.forEach(item => {
      console.log(`  ${item.file}: "${item.key}"`);
    });
  }

  if (results.noCanvasId.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log('MISSING CANVAS IDS (run create-assignments first):');
    results.noCanvasId.forEach(item => {
      console.log(`  ${item.file}: "${item.key}"`);
    });
  }

  if (dryRun) {
    console.log(`\n⚠ DRY RUN - No files modified. Run with --dry-run=false to apply changes.`);
  } else if (results.updated.length > 0) {
    console.log(`\n✓ Updated ${results.updated.length} links in HTML files`);
  } else {
    console.log(`\n✓ All links are up to date`);
  }

  return results;
}

/**
 * Action: Generate config from CSV (runs sync-csv-to-config logic)
 */
async function generateConfig() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Generating Config from CSV');
  console.log('='.repeat(60));

  const { execSync } = require('child_process');

  try {
    const output = execSync('node scripts/sync-csv-to-config.js', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(output);
    console.log('✓ Config generation complete');
    return true;
  } catch (error) {
    console.error('✗ Config generation failed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Action: Writeback CSV (copy Canvas IDs from config back to CSV)
 */
async function writebackCsv(dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Writeback CSV${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  const { execSync } = require('child_process');

  try {
    const output = execSync(`node scripts/writeback-csv.js --dry-run=${dryRun}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(output);
    console.log('✓ Writeback complete');
    return true;
  } catch (error) {
    console.error('✗ Writeback failed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Action: Update HTML links (bake Canvas URLs into HTML files)
 */
async function updateHtmlLinks() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Updating HTML Links');
  console.log('='.repeat(60));

  const { execSync } = require('child_process');

  try {
    const output = execSync('node scripts/update-html-links.js', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(output);
    console.log('✓ HTML links updated');
    return true;
  } catch (error) {
    console.error('✗ HTML links update failed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Action: Full sync pipeline
 * Runs: generate-config → create-assignments → create-quizzes → fetch-assignments → writeback-csv → update-html-links
 */
async function fullSync(api, course, dryRun = true, limit = 0) {
  console.log(`\n${'#'.repeat(60)}`);
  console.log('FULL SYNC PIPELINE');
  console.log(`Course: ${course} | Dry Run: ${dryRun} | Limit: ${limit || 'none'}`);
  console.log('#'.repeat(60));

  const steps = [
    { name: 'Generate Config', action: 'generate-config' },
    { name: 'Create Assignments', action: 'create-assignments' },
    { name: 'Create Quizzes', action: 'create-quizzes' },
    { name: 'Fetch Assignments', action: 'fetch-assignments' },
    { name: 'Writeback CSV', action: 'writeback-csv' },
    { name: 'Update HTML Links', action: 'update-html-links' },
  ];

  const results = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Step ${i + 1}/${steps.length}: ${step.name}`);
    console.log('─'.repeat(60));

    try {
      let success = false;

      switch (step.action) {
        case 'generate-config':
          success = await generateConfig();
          break;

        case 'create-assignments':
          if (course === 'both') {
            await createAssignments(api, 'cst349', dryRun, limit);
            await createAssignments(api, 'cst395', dryRun, limit);
          } else {
            await createAssignments(api, course, dryRun, limit);
          }
          success = true;
          break;

        case 'create-quizzes':
          if (course === 'both') {
            await createQuizzes(api, 'cst349', dryRun, limit);
            await createQuizzes(api, 'cst395', dryRun, limit);
          } else {
            await createQuizzes(api, course, dryRun, limit);
          }
          success = true;
          break;

        case 'fetch-assignments':
          // Only fetch if not dry run (we need to get real Canvas IDs)
          if (!dryRun) {
            if (course === 'both') {
              await fetchAssignments(api, 'cst349');
              await fetchAssignments(api, 'cst395');
            } else {
              await fetchAssignments(api, course);
            }
          } else {
            console.log('  Skipped (dry run - no Canvas changes to fetch)');
          }
          success = true;
          break;

        case 'writeback-csv':
          success = await writebackCsv(dryRun);
          break;

        case 'update-html-links':
          success = await updateHtmlLinks();
          break;
      }

      results.push({ step: step.name, success, error: null });

      if (!success) {
        console.log(`\n⚠ Step "${step.name}" reported issues, continuing...`);
      }

    } catch (error) {
      console.error(`\n✗ Step "${step.name}" failed: ${error.message}`);
      results.push({ step: step.name, success: false, error: error.message });
      // Continue with remaining steps
    }
  }

  // Summary
  console.log(`\n${'#'.repeat(60)}`);
  console.log('PIPELINE SUMMARY');
  console.log('#'.repeat(60));

  results.forEach((r, i) => {
    const status = r.success ? '✓' : '✗';
    const errorMsg = r.error ? ` - ${r.error}` : '';
    console.log(`  ${status} Step ${i + 1}: ${r.step}${errorMsg}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\nCompleted: ${successCount}/${results.length} steps`);

  if (dryRun) {
    console.log('\n⚠ DRY RUN - No Canvas changes made. Run with --dry-run=false to apply.');
  }

  return results;
}

/**
 * Main entry point
 */
async function main() {
  const args = parseArgs();

  const action = args.action || 'fetch-assignments';
  const course = args.course || 'both';
  const dryRun = args['dry-run'] !== 'false'; // Default to true (safe mode)
  const limit = args.limit ? parseInt(args.limit, 10) : 0; // 0 = no limit

  console.log('Canvas Sync Tool');
  console.log('================');
  console.log(`Action: ${action}`);
  console.log(`Course: ${course}`);
  if (['rename-assignments', 'create-assignments', 'update-assignments', 'create-quizzes', 'sync-html-links', 'full-sync', 'writeback-csv'].includes(action)) {
    console.log(`Dry Run: ${dryRun}`);
    if (limit > 0) {
      console.log(`Limit: ${limit} changes`);
    }
  }

  // Actions that don't require Canvas API
  const localOnlyActions = ['sync-html-links', 'generate-config', 'writeback-csv', 'update-html-links'];

  // Initialize API only if needed
  let api = null;
  if (!localOnlyActions.includes(action)) {
    // Check for required env vars
    if (!process.env.CANVAS_BASE_URL || !process.env.CANVAS_API_TOKEN) {
      if (action === 'full-sync' && dryRun) {
        console.log('\n⚠ Canvas API credentials not set. Local actions will run, Canvas actions will be simulated.');
      } else if (!localOnlyActions.includes(action)) {
        console.error('Error: CANVAS_BASE_URL and CANVAS_API_TOKEN environment variables are required');
        process.exit(1);
      }
    } else {
      api = new CanvasAPI(
        process.env.CANVAS_BASE_URL,
        process.env.CANVAS_API_TOKEN
      );
    }
  }

  try {
    switch (action) {
      case 'list-courses':
        await listCourses(api);
        break;

      case 'list-groups':
        if (course === 'both') {
          await listGroups(api, 'cst349');
          await listGroups(api, 'cst395');
        } else if (COURSES[course]) {
          await listGroups(api, course);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'fetch-assignments':
        if (course === 'both') {
          await fetchAssignments(api, 'cst349');
          await fetchAssignments(api, 'cst395');
        } else if (COURSES[course]) {
          await fetchAssignments(api, course);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'validate-config':
        if (course === 'both') {
          await validateConfig(api, 'cst349');
          await validateConfig(api, 'cst395');
        } else if (COURSES[course]) {
          await validateConfig(api, course);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'rename-assignments':
        if (course === 'both') {
          await renameAssignments(api, 'cst349', dryRun, limit);
          await renameAssignments(api, 'cst395', dryRun, limit);
        } else if (COURSES[course]) {
          await renameAssignments(api, course, dryRun, limit);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'create-assignments':
        if (course === 'both') {
          await createAssignments(api, 'cst349', dryRun, limit);
          await createAssignments(api, 'cst395', dryRun, limit);
        } else if (COURSES[course]) {
          await createAssignments(api, course, dryRun, limit);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'update-assignments':
        if (course === 'both') {
          await updateAssignments(api, 'cst349', dryRun, limit);
          await updateAssignments(api, 'cst395', dryRun, limit);
        } else if (COURSES[course]) {
          await updateAssignments(api, course, dryRun, limit);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'create-quizzes':
        if (course === 'both') {
          await createQuizzes(api, 'cst349', dryRun, limit);
          await createQuizzes(api, 'cst395', dryRun, limit);
        } else if (COURSES[course]) {
          await createQuizzes(api, course, dryRun, limit);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'sync-html-links':
        if (course === 'both') {
          await syncHtmlLinks('cst349', dryRun);
          await syncHtmlLinks('cst395', dryRun);
        } else if (COURSES[course]) {
          await syncHtmlLinks(course, dryRun);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'generate-config':
        await generateConfig();
        break;

      case 'writeback-csv':
        await writebackCsv(dryRun);
        break;

      case 'update-html-links':
        await updateHtmlLinks();
        break;

      case 'full-sync':
        await fullSync(api, course, dryRun, limit);
        break;

      default:
        console.error(`Unknown action: ${action}`);
        console.error('Valid actions: full-sync, generate-config, create-assignments, create-quizzes, update-assignments, fetch-assignments, writeback-csv, update-html-links, validate-config, list-courses, list-groups, rename-assignments, sync-html-links');
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
