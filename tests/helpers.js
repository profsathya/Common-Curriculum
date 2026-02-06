/**
 * Test Helpers
 *
 * Extracts functions from source files for isolated testing.
 * Uses brace-counting to locate function definitions in source code,
 * then uses the Function constructor to make them callable in test scope.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Read a source file relative to the project root.
 * @param {string} relativePath - Path relative to ROOT_DIR
 * @returns {string} File contents
 */
function readSource(relativePath) {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf-8');
}

/**
 * Extract a single function definition from source code using brace-counting.
 * Handles nested braces correctly. Does not handle braces inside strings
 * or template literals, but works for the functions in this project.
 *
 * @param {string} source - Full source code
 * @param {string} funcName - Name of the function to extract
 * @returns {string|null} Complete function source, or null if not found
 */
function extractFunction(source, funcName) {
  const pattern = new RegExp(`function\\s+${funcName}\\s*\\(`);
  const match = pattern.exec(source);
  if (!match) return null;

  const startIndex = match.index;

  // Find the opening brace of the function body
  let braceStart = source.indexOf('{', startIndex + match[0].length);
  if (braceStart === -1) return null;

  // Count braces to find the matching closing brace
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) {
      return source.substring(startIndex, i + 1);
    }
  }
  return null;
}

/**
 * Extract multiple functions from a source file and return them as
 * callable functions sharing a common scope. This means functions that
 * call each other (e.g., parseCSV calling parseCSVLine) work correctly.
 *
 * @param {string} relativePath - Source file path relative to ROOT_DIR
 * @param {string[]} funcNames - Array of function names to extract
 * @param {string} [preamble=''] - Extra code to include before functions (e.g., mocks)
 * @returns {Object} Map of function names to callable functions
 */
function buildFunctions(relativePath, funcNames, preamble) {
  preamble = preamble || '';
  const source = readSource(relativePath);
  const extracted = funcNames.map(function(name) {
    var src = extractFunction(source, name);
    if (!src) throw new Error('Function "' + name + '" not found in ' + relativePath);
    return src;
  });

  var returnProps = funcNames.join(', ');
  var body = preamble + '\n' + extracted.join('\n\n') + '\nreturn { ' + returnProps + ' };';

  var factory = new Function(body);
  return factory();
}

module.exports = { ROOT_DIR, readSource, extractFunction, buildFunctions };
