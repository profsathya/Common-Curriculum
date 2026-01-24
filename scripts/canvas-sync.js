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
function loadConfig(configFile) {
  const configPath = path.join(process.cwd(), configFile);
  const content = fs.readFileSync(configPath, 'utf-8');

  // Extract the config object using regex (since it's a JS file, not JSON)
  // This is a simplified parser - works for our config structure
  const match = content.match(/const \w+_CONFIG = ({[\s\S]*});?\s*$/);
  if (!match) {
    throw new Error(`Could not parse config from ${configFile}`);
  }

  // Use eval to parse the JS object (safe here since we control the files)
  // eslint-disable-next-line no-eval
  const config = eval(`(${match[1]})`);
  return { config, rawContent: content, configPath };
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
  const { config, rawContent, configPath } = loadConfig(courseInfo.configFile);

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
  const { config } = loadConfig(courseInfo.configFile);

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

  console.log('Canvas Sync Tool');
  console.log('================');
  console.log(`Action: ${action}`);
  console.log(`Course: ${course}`);

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

      default:
        console.error(`Unknown action: ${action}`);
        console.error('Valid actions: fetch-assignments, validate-config, list-courses');
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
