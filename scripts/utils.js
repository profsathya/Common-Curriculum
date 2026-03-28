/**
 * Shared Utilities
 *
 * Common functions used across multiple scripts. Consolidates duplicated
 * implementations of CSV parsing, config loading, argument parsing, and
 * file I/O helpers.
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CLI Argument Parsing
// ============================================

/**
 * Parse --key=value CLI arguments into an object.
 * @returns {Object} Map of argument keys to values (or true if no value)
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

// ============================================
// CSV Parsing
// ============================================

/**
 * Parse a single CSV line respecting quoted fields and escaped quotes.
 * Handles commas inside quoted fields and double-double-quote escaping.
 *
 * @param {string} line - A single CSV row
 * @returns {string[]} Array of field values (trimmed)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse CSV text into an array of row objects keyed by header names.
 *
 * @param {string} csvText - Full CSV content
 * @returns {Object[]} Array of row objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

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

  return rows;
}

/**
 * Load a CSV file into an array of row objects.
 * Returns empty array if file doesn't exist or has no data rows.
 *
 * @param {string} csvPath - Absolute path to CSV file
 * @returns {Object[]} Array of row objects
 */
function loadCsvFile(csvPath) {
  if (!fs.existsSync(csvPath)) return [];
  const content = fs.readFileSync(csvPath, 'utf-8');
  return parseCSV(content);
}

// ============================================
// Config Loading
// ============================================

/**
 * Load a JavaScript config file by evaluating it with the Function constructor.
 * Handles const/let declarations properly.
 *
 * @param {string} configPath - Absolute path to the config .js file
 * @param {string} configVarName - Name of the variable to return (e.g., 'CST349_CONFIG')
 * @returns {{ config: Object, rawContent: string, configPath: string }}
 */
function loadConfig(configPath, configVarName) {
  const content = fs.readFileSync(configPath, 'utf-8');

  try {
    const fn = new Function(content + `\nreturn ${configVarName};`);
    const config = fn();
    return { config, rawContent: content, configPath };
  } catch (err) {
    throw new Error(`Could not parse config from ${configPath}: ${err.message}`);
  }
}

// ============================================
// Course ID Extraction
// ============================================

/**
 * Extract a Canvas course ID from a URL like "https://csumb.instructure.com/courses/12345"
 *
 * @param {string} canvasBaseUrl - Canvas course URL
 * @returns {string} Course ID
 */
function extractCourseId(canvasBaseUrl) {
  const match = canvasBaseUrl.match(/\/courses\/(\d+)/);
  if (!match) throw new Error(`Could not extract course ID from URL: ${canvasBaseUrl}`);
  return match[1];
}

// ============================================
// File I/O Helpers
// ============================================

/**
 * Ensure a directory exists, creating it recursively if needed.
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Load a JSON file, returning null if it doesn't exist.
 * @param {string} filePath
 * @returns {*|null}
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Save data as pretty-printed JSON, creating parent directories as needed.
 * @param {string} filePath
 * @param {*} data
 */
function saveJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

module.exports = {
  parseArgs,
  parseCSVLine,
  parseCSV,
  loadCsvFile,
  loadConfig,
  extractCourseId,
  ensureDir,
  loadJson,
  saveJson,
};
