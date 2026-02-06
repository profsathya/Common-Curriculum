/**
 * CSV Parsing Tests
 *
 * Tests the parseCSVLine() function from scripts/sync-csv-to-config.js
 * which properly handles quoted fields, versus the naive line.split(',')
 * approach used in scripts/canvas-sync.js's loadCsvKeys().
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildFunctions } = require('./helpers');

// Extract parseCSVLine and parseCSV from sync-csv-to-config.js
const { parseCSVLine, parseCSV } = buildFunctions(
  'scripts/sync-csv-to-config.js',
  ['parseCSVLine', 'parseCSV']
);

// ============================================
// parseCSVLine tests
// ============================================

describe('parseCSVLine (sync-csv-to-config.js)', function() {

  it('parses a simple comma-separated line', function() {
    const result = parseCSVLine('hello,world,foo');
    assert.deepStrictEqual(result, ['hello', 'world', 'foo']);
  });

  it('handles quoted fields', function() {
    const result = parseCSVLine('"hello","world"');
    assert.deepStrictEqual(result, ['hello', 'world']);
  });

  it('handles commas inside quoted fields', function() {
    const result = parseCSVLine('"Smith, John",42,"New York, NY"');
    assert.deepStrictEqual(result, ['Smith, John', '42', 'New York, NY']);
  });

  it('handles escaped quotes (double-double-quote convention)', function() {
    const result = parseCSVLine('"She said ""hello""",world');
    assert.deepStrictEqual(result, ['She said "hello"', 'world']);
  });

  it('handles consecutive escaped quotes', function() {
    const result = parseCSVLine('"a""b""c"');
    assert.deepStrictEqual(result, ['a"b"c']);
  });

  it('handles empty fields between commas', function() {
    const result = parseCSVLine('a,,c');
    assert.deepStrictEqual(result, ['a', '', 'c']);
  });

  it('handles a single field with no commas', function() {
    const result = parseCSVLine('hello');
    assert.deepStrictEqual(result, ['hello']);
  });

  it('handles empty quoted fields', function() {
    const result = parseCSVLine('"",hello,""');
    assert.deepStrictEqual(result, ['', 'hello', '']);
  });

  it('trims whitespace from unquoted values', function() {
    const result = parseCSVLine('  hello , world , foo  ');
    assert.deepStrictEqual(result, ['hello', 'world', 'foo']);
  });

  it('handles mixed quoted and unquoted fields', function() {
    const result = parseCSVLine('key,144469,"S1: Skills Self-Assessment",2026-01-22,quiz,"Sprint 1: Goal Setting"');
    assert.deepStrictEqual(result, [
      'key', '144469', 'S1: Skills Self-Assessment',
      '2026-01-22', 'quiz', 'Sprint 1: Goal Setting'
    ]);
  });

  it('handles an empty string input', function() {
    const result = parseCSVLine('');
    assert.deepStrictEqual(result, ['']);
  });

  it('handles field with only quotes', function() {
    const result = parseCSVLine('""');
    assert.deepStrictEqual(result, ['']);
  });

  it('handles trailing comma (produces extra empty field)', function() {
    const result = parseCSVLine('a,b,');
    assert.deepStrictEqual(result, ['a', 'b', '']);
  });

  it('handles leading comma (produces leading empty field)', function() {
    const result = parseCSVLine(',a,b');
    assert.deepStrictEqual(result, ['', 'a', 'b']);
  });

  it('handles a realistic CSV data row from the project', function() {
    const line = 's1-self-assessment,144469,S1: Skills Self-Assessment,2026-01-22,quiz,"Sprint 1: Goal Setting",10,quiz,graded_survey,1,1,assignments/s1-w1-skills-self-assessment.html';
    const result = parseCSVLine(line);
    assert.equal(result[0], 's1-self-assessment');
    assert.equal(result[1], '144469');
    assert.equal(result[2], 'S1: Skills Self-Assessment');
    assert.equal(result[5], 'Sprint 1: Goal Setting');
    assert.equal(result.length, 12);
  });
});

// ============================================
// parseCSV tests
// ============================================

describe('parseCSV (sync-csv-to-config.js)', function() {

  it('parses a basic CSV string into row objects', function() {
    const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.deepStrictEqual(result[0], { name: 'Alice', age: '30', city: 'NYC' });
    assert.deepStrictEqual(result[1], { name: 'Bob', age: '25', city: 'LA' });
  });

  it('handles quoted fields with commas in full CSV', function() {
    const csv = 'key,title,group\ns1-test,"S1: Test, Assessment","Sprint 1: Goals, Planning"';
    const result = parseCSV(csv);
    assert.equal(result.length, 1);
    assert.equal(result[0].title, 'S1: Test, Assessment');
    assert.equal(result[0].group, 'Sprint 1: Goals, Planning');
  });

  it('returns empty array for empty input', function() {
    assert.deepStrictEqual(parseCSV(''), []);
  });

  it('returns empty array for whitespace-only input', function() {
    assert.deepStrictEqual(parseCSV('   \n  '), []);
  });

  it('returns empty array for headers-only CSV', function() {
    assert.deepStrictEqual(parseCSV('name,age,city'), []);
  });

  it('skips blank lines in the CSV body', function() {
    const csv = 'name,age\nAlice,30\n\nBob,25\n';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
  });

  it('fills missing trailing values with empty strings', function() {
    const csv = 'a,b,c\n1';
    const result = parseCSV(csv);
    assert.equal(result.length, 1);
    assert.equal(result[0].a, '1');
    assert.equal(result[0].b, '');
    assert.equal(result[0].c, '');
  });

  it('trims header names', function() {
    const csv = ' name , age \nAlice,30';
    const result = parseCSV(csv);
    assert.ok('name' in result[0], 'Header should be trimmed');
    assert.ok('age' in result[0], 'Header should be trimmed');
  });

  it('handles single-column CSV', function() {
    const csv = 'name\nAlice\nBob';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Alice');
    assert.equal(result[1].name, 'Bob');
  });
});

// ============================================
// Naive split comparison tests
// ============================================

describe('Naive CSV split vs proper parseCSVLine', function() {

  // canvas-sync.js loadCsvKeys uses line.split(',') which cannot handle quotes
  function naiveSplit(line) {
    return line.split(',');
  }

  it('both agree on simple CSV without commas in values', function() {
    const line = 's1-test,144469,S1: Test,2026-01-22,quiz';
    const naiveResult = naiveSplit(line);
    const properResult = parseCSVLine(line);

    assert.equal(naiveResult.length, properResult.length);
    assert.equal(naiveResult[0], properResult[0]);
    assert.equal(naiveResult[2].trim(), properResult[2]);
  });

  it('naive split BREAKS on quoted fields containing commas', function() {
    const line = 's1-test,144469,"S1: Test, Assessment",2026-01-22';
    const naiveResult = naiveSplit(line);
    const properResult = parseCSVLine(line);

    // Naive split produces 5 fields instead of 4
    assert.equal(naiveResult.length, 5, 'Naive split creates too many fields');
    assert.equal(properResult.length, 4, 'parseCSVLine produces correct field count');

    // Naive split corrupts the quoted field
    assert.notEqual(naiveResult[2], 'S1: Test, Assessment');
    // parseCSVLine handles it correctly
    assert.equal(properResult[2], 'S1: Test, Assessment');
  });

  it('naive split cannot handle assignment group names with commas', function() {
    // Real-world scenario: assignment groups like "Sprint 1: Goals, Planning"
    const line = 's1-test,12345,Title,2026-01-22,quiz,"Sprint 1: Goals, Planning",10';
    const naiveResult = naiveSplit(line);
    const properResult = parseCSVLine(line);

    // Naive: splits "Sprint 1: Goals, Planning" into two fields
    assert.equal(naiveResult.length, 8, 'Naive split gets wrong field count');
    assert.equal(properResult.length, 7, 'Proper parse gets correct field count');
  });

  it('naive split works fine when key column has no commas', function() {
    // loadCsvKeys in canvas-sync.js only reads the key column (index 0),
    // so even broken parsing can still extract keys correctly from simple CSVs
    const lines = [
      'key,canvasId,title',
      's1-test,12345,"Sprint 1: Test, Activity"',
      's2-test,67890,Sprint 2: Simple Title',
    ];

    for (let i = 1; i < lines.length; i++) {
      const naiveFields = naiveSplit(lines[i]);
      const properFields = parseCSVLine(lines[i]);
      // Key is always the first field, so naive split gets it right
      assert.equal(naiveFields[0], properFields[0],
        'Key column should match even with naive split');
    }
  });
});
