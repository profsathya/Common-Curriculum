/**
 * Test Runner Entry Point
 *
 * Imports all test modules so they register with node:test.
 * Run with: node --test tests/run-tests.js
 */

require('./csv-parsing.test.js');
require('./title-matching.test.js');
require('./config-loading.test.js');
require('./date-formatting.test.js');
