/**
 * CSV Loader Utility
 * Loads and parses assignment data from CSV files
 *
 * This module provides functions to load assignment configuration from CSV files,
 * replacing or supplementing inline JavaScript config objects.
 */

// ============================================
// CSV Parsing
// ============================================

/**
 * Parse CSV text into an array of objects
 * @param {string} csvText - Raw CSV content
 * @returns {Array<Object>} Array of row objects with headers as keys
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim());

  // Parse data rows
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
 * Parse a single CSV line, handling quoted values
 * @param {string} line - Single CSV line
 * @returns {Array<string>} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
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
// Assignment Loading
// ============================================

/**
 * Load assignments from a CSV file and convert to config format
 * @param {string} csvUrl - URL to the CSV file
 * @returns {Promise<Object>} Object keyed by assignment key with assignment data
 */
async function loadAssignmentsFromCSV(csvUrl) {
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseAssignmentsCSV(csvText);
}

/**
 * Parse assignments CSV text into config format
 * @param {string} csvText - Raw CSV content
 * @returns {Object} Object keyed by assignment key
 */
function parseAssignmentsCSV(csvText) {
  const rows = parseCSV(csvText);
  const assignments = {};

  rows.forEach(row => {
    const key = row.key;
    if (!key) return;

    // Build assignment object matching existing config format
    const assignment = {
      canvasId: row.canvasId || '',
      title: row.title || '',
      dueDate: row.dueDate || '',
      type: row.type || 'assignment'
    };

    // Add optional fields if present
    if (row.assignmentGroup) {
      assignment.assignmentGroup = row.assignmentGroup;
    }
    if (row.points) {
      assignment.points = parseInt(row.points, 10) || 0;
    }
    if (row.canvasType) {
      assignment.canvasType = row.canvasType;
    }
    if (row.quizType) {
      assignment.quizType = row.quizType;
    }

    // Add new Stage 1 columns
    if (row.sprint) {
      assignment.sprint = parseInt(row.sprint, 10) || 0;
    }
    if (row.week) {
      assignment.week = parseInt(row.week, 10) || 0;
    }
    if (row.htmlFile) {
      assignment.htmlFile = row.htmlFile;
    }

    assignments[key] = assignment;
  });

  return assignments;
}

// ============================================
// Config Builder
// ============================================

/**
 * Build a complete config object by loading assignments from CSV
 * and merging with base config (for weekDates, sprints, etc.)
 * @param {Object} baseConfig - Base config with weekDates, sprints, etc.
 * @param {string} csvUrl - URL to the assignments CSV file
 * @returns {Promise<Object>} Complete config object
 */
async function buildConfigFromCSV(baseConfig, csvUrl) {
  const assignments = await loadAssignmentsFromCSV(csvUrl);

  return {
    ...baseConfig,
    assignments
  };
}

/**
 * Create a merged config where CSV data overrides base config assignments
 * Useful for incremental migration
 * @param {Object} baseConfig - Full config with existing assignments
 * @param {string} csvUrl - URL to the assignments CSV file
 * @returns {Promise<Object>} Config with merged assignments
 */
async function mergeConfigWithCSV(baseConfig, csvUrl) {
  const csvAssignments = await loadAssignmentsFromCSV(csvUrl);

  // Merge: CSV values override base config values
  const mergedAssignments = { ...baseConfig.assignments };

  for (const [key, csvData] of Object.entries(csvAssignments)) {
    if (mergedAssignments[key]) {
      // Merge, preferring CSV values for matching keys
      mergedAssignments[key] = {
        ...mergedAssignments[key],
        ...csvData
      };
    } else {
      // New assignment from CSV
      mergedAssignments[key] = csvData;
    }
  }

  return {
    ...baseConfig,
    assignments: mergedAssignments
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get assignments for a specific sprint from parsed assignments
 * @param {Object} assignments - Parsed assignments object
 * @param {number} sprintNum - Sprint number (1-4)
 * @returns {Array<Object>} Array of assignments for that sprint
 */
function getAssignmentsBySprint(assignments, sprintNum) {
  return Object.entries(assignments)
    .filter(([key, data]) => data.sprint === sprintNum)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Get assignments for a specific week from parsed assignments
 * @param {Object} assignments - Parsed assignments object
 * @param {number} weekNum - Week number (1-16)
 * @returns {Array<Object>} Array of assignments for that week
 */
function getAssignmentsByWeek(assignments, weekNum) {
  return Object.entries(assignments)
    .filter(([key, data]) => data.week === weekNum)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Get the local HTML file URL for an assignment
 * @param {Object} assignment - Assignment object
 * @param {string} basePath - Base path for HTML files (e.g., '../')
 * @returns {string|null} URL to local HTML file or null
 */
function getLocalHtmlUrl(assignment, basePath = '') {
  if (!assignment.htmlFile) return null;
  return basePath + assignment.htmlFile;
}

// ============================================
// Exports (for module systems) or Global
// ============================================

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
  window.CSVLoader = {
    parseCSV,
    parseCSVLine,
    loadAssignmentsFromCSV,
    parseAssignmentsCSV,
    buildConfigFromCSV,
    mergeConfigWithCSV,
    getAssignmentsBySprint,
    getAssignmentsByWeek,
    getLocalHtmlUrl
  };
}

// Export for Node.js/module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV,
    parseCSVLine,
    loadAssignmentsFromCSV,
    parseAssignmentsCSV,
    buildConfigFromCSV,
    mergeConfigWithCSV,
    getAssignmentsBySprint,
    getAssignmentsByWeek,
    getLocalHtmlUrl
  };
}
