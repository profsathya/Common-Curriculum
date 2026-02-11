#!/usr/bin/env node
/**
 * Update HTML Links Script
 *
 * Bakes Canvas URLs into HTML files based on assignment configuration.
 * This is useful for Canvas iframe embedding where JavaScript might not run reliably.
 *
 * Usage: node scripts/update-html-links.js
 *
 * What it does:
 * - Reads assignment data from config files
 * - Finds HTML files with data-assignment-key attributes
 * - Updates href attributes with correct Canvas URLs
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
    baseUrl: null, // Will be extracted from config
    htmlDir: 'cst349'
  },
  {
    name: 'CST395',
    configPath: 'config/cst395-config.js',
    baseUrl: null,
    htmlDir: 'cst395'
  }
];

// ============================================
// Config Parsing
// ============================================

/**
 * Extract assignments and baseUrl from a config file
 */
function parseConfigFile(configPath) {
  const content = fs.readFileSync(configPath, 'utf8');

  // Extract canvasBaseUrl
  const baseUrlMatch = content.match(/canvasBaseUrl:\s*"([^"]+)"/);
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : null;

  // Extract assignments object
  const assignmentsMatch = content.match(/assignments:\s*\{/);
  if (!assignmentsMatch) {
    throw new Error(`Could not find assignments in ${configPath}`);
  }

  const startIdx = assignmentsMatch.index + assignmentsMatch[0].length - 1;
  let braceCount = 1;
  let endIdx = startIdx + 1;

  while (braceCount > 0 && endIdx < content.length) {
    if (content[endIdx] === '{') braceCount++;
    if (content[endIdx] === '}') braceCount--;
    endIdx++;
  }

  const assignmentsStr = content.substring(startIdx, endIdx);
  let assignments;

  try {
    assignments = eval('(' + assignmentsStr + ')');
  } catch (e) {
    throw new Error(`Failed to parse assignments from ${configPath}: ${e.message}`);
  }

  return { baseUrl, assignments };
}

// ============================================
// HTML Processing
// ============================================

/**
 * Build Canvas URL for an assignment
 */
function buildCanvasUrl(baseUrl, assignment) {
  if (!baseUrl || !assignment.canvasId) return null;

  // Always use /assignments/ path — Canvas stores the shadow assignment ID
  // for both regular assignments and quizzes. The /assignments/ path works
  // for both types and correctly routes students to the quiz when needed.
  return `${baseUrl}/assignments/${assignment.canvasId}`;
}

/**
 * Update data-assignment-key links in an HTML file
 */
function updateHtmlFile(filePath, key, canvasUrl) {
  if (!fs.existsSync(filePath)) {
    return { updated: false, reason: 'file not found' };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Pattern: data-assignment-key="key" href="#" or href="..."
  // We want to update href to the Canvas URL
  const pattern = new RegExp(
    `data-assignment-key="${key}"\\s+href="[^"]*"`,
    'g'
  );

  content = content.replace(pattern, `data-assignment-key="${key}" href="${canvasUrl}"`);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return { updated: true };
  }

  return { updated: false, reason: 'no changes needed' };
}

/**
 * Find all HTML files with data-assignment-key in a directory
 */
function findHtmlFilesWithLinks(dir, key) {
  const files = [];

  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(`data-assignment-key="${key}"`)) {
          files.push(fullPath);
        }
      }
    }
  }

  walkDir(dir);
  return files;
}

// ============================================
// Main
// ============================================

function main() {
  const rootDir = path.join(__dirname, '..');

  console.log('Update HTML Links');
  console.log('=================');

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const course of courses) {
    console.log(`\nProcessing ${course.name}...`);

    const configPath = path.join(rootDir, course.configPath);
    if (!fs.existsSync(configPath)) {
      console.log(`  Config not found: ${course.configPath}`);
      continue;
    }

    const { baseUrl, assignments } = parseConfigFile(configPath);
    if (!baseUrl) {
      console.log('  No baseUrl found in config');
      continue;
    }

    console.log(`  Base URL: ${baseUrl}`);
    console.log(`  Assignments: ${Object.keys(assignments).length}`);

    const htmlDir = path.join(rootDir, course.htmlDir);

    for (const [key, assignment] of Object.entries(assignments)) {
      if (!assignment.canvasId) {
        continue; // Skip assignments without Canvas ID
      }

      const canvasUrl = buildCanvasUrl(baseUrl, assignment);
      if (!canvasUrl) continue;

      // Find HTML files that reference this assignment
      const htmlFiles = findHtmlFilesWithLinks(htmlDir, key);

      for (const htmlFile of htmlFiles) {
        const result = updateHtmlFile(htmlFile, key, canvasUrl);
        const relativePath = path.relative(rootDir, htmlFile);

        if (result.updated) {
          console.log(`  Updated: ${relativePath}`);
          totalUpdated++;
        } else {
          totalSkipped++;
        }
      }
    }
  }

  console.log('\n-----------------');
  console.log(`Updated: ${totalUpdated} files`);
  console.log(`Skipped: ${totalSkipped} files`);
  console.log('Done!');
}

main();
