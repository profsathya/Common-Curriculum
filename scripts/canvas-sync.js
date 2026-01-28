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
  },
  cst395: {
    configFile: 'config/cst395-config.js',
    configVar: 'CST395_CONFIG',
  },
};

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
async function renameAssignments(api, courseName, dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Renaming assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}`);
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

  for (const match of toRename) {
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
async function updateAssignments(api, courseName, dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Updating assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}`);
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

  for (const item of toUpdate) {
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

  return { updated: toUpdate.filter((_, i) => i < successCount) };
}

/**
 * Action: Create assignments in Canvas from config
 * Only creates assignments that don't already exist
 */
async function createAssignments(api, courseName, dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating assignments for ${courseName.toUpperCase()}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  const courseInfo = COURSES[courseName];
  const { config, rawContent, configPath } = loadConfig(courseInfo.configFile, courseInfo.configVar);
  const courseId = extractCourseId(config.canvasBaseUrl);

  console.log(`Canvas Course ID: ${courseId}`);

  // Fetch existing assignments from Canvas
  console.log('\nFetching existing assignments from Canvas...');
  const canvasAssignments = await api.listAssignments(courseId);
  console.log(`Found ${canvasAssignments.length} existing assignments`);

  // Fuzzy match to find what's missing
  const results = fuzzyMatchAssignments(canvasAssignments, config.assignments);

  const toCreate = results.unmatchedConfig;

  console.log(`\n${'─'.repeat(40)}`);
  console.log('ANALYSIS:');
  console.log(`  Already exist: ${results.matched.length}`);
  console.log(`  Need to create: ${toCreate.length}`);

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

  for (const item of toCreate) {
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
    } else {
      assignmentData.points_possible = 100;
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
 * Main entry point
 */
async function main() {
  const args = parseArgs();

  const action = args.action || 'fetch-assignments';
  const course = args.course || 'both';
  const dryRun = args['dry-run'] !== 'false'; // Default to true (safe mode)

  console.log('Canvas Sync Tool');
  console.log('================');
  console.log(`Action: ${action}`);
  console.log(`Course: ${course}`);
  if (['rename-assignments', 'create-assignments', 'update-assignments'].includes(action)) {
    console.log(`Dry Run: ${dryRun}`);
  }

  // Initialize API
  const api = new CanvasAPI(
    process.env.CANVAS_BASE_URL,
    process.env.CANVAS_API_TOKEN
  );

  try {
    switch (action) {
      case 'list-courses':
        await listCourses(api);
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
          await renameAssignments(api, 'cst349', dryRun);
          await renameAssignments(api, 'cst395', dryRun);
        } else if (COURSES[course]) {
          await renameAssignments(api, course, dryRun);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'create-assignments':
        if (course === 'both') {
          await createAssignments(api, 'cst349', dryRun);
          await createAssignments(api, 'cst395', dryRun);
        } else if (COURSES[course]) {
          await createAssignments(api, course, dryRun);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      case 'update-assignments':
        if (course === 'both') {
          await updateAssignments(api, 'cst349', dryRun);
          await updateAssignments(api, 'cst395', dryRun);
        } else if (COURSES[course]) {
          await updateAssignments(api, course, dryRun);
        } else {
          console.error(`Unknown course: ${course}`);
          process.exit(1);
        }
        break;

      default:
        console.error(`Unknown action: ${action}`);
        console.error('Valid actions: fetch-assignments, validate-config, list-courses, rename-assignments, create-assignments, update-assignments');
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
