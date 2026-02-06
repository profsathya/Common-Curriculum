/**
 * Date Formatting & Activity Engine State Tests
 *
 * Tests formatDate() from js/components.js and the
 * createInitialState() pattern from js/activity-engine.js.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildFunctions, readSource, extractFunction } = require('./helpers');

// Extract formatDate from components.js
const { formatDate } = buildFunctions('js/components.js', ['formatDate']);

// ============================================
// formatDate tests
// ============================================

describe('formatDate (components.js)', function() {

  it('returns a string', function() {
    assert.equal(typeof formatDate('2026-01-22'), 'string');
  });

  it('formats a known date correctly (Thu, Jan 22, 2026)', function() {
    var result = formatDate('2026-01-22');
    // Should contain weekday abbreviation "Thu"
    assert.match(result, /Thu/);
    // Should contain month abbreviation "Jan"
    assert.match(result, /Jan/);
    // Should contain day number "22"
    assert.match(result, /22/);
  });

  it('includes weekday abbreviations for each day of the week', function() {
    // 2026-01-19 Mon through 2026-01-25 Sun
    var expected = [
      ['2026-01-19', /Mon/],
      ['2026-01-20', /Tue/],
      ['2026-01-21', /Wed/],
      ['2026-01-22', /Thu/],
      ['2026-01-23', /Fri/],
      ['2026-01-24', /Sat/],
      ['2026-01-25', /Sun/],
    ];

    for (var i = 0; i < expected.length; i++) {
      var dateStr = expected[i][0];
      var pattern = expected[i][1];
      assert.match(formatDate(dateStr), pattern,
        'Expected ' + dateStr + ' to match ' + pattern);
    }
  });

  it('formats dates from different months correctly', function() {
    var cases = [
      ['2026-01-15', /Jan/],
      ['2026-02-14', /Feb/],
      ['2026-03-15', /Mar/],
      ['2026-04-10', /Apr/],
      ['2026-05-20', /May/],
      ['2026-06-01', /Jun/],
      ['2026-07-04', /Jul/],
      ['2026-08-15', /Aug/],
      ['2026-09-30', /Sep/],
      ['2026-10-31', /Oct/],
      ['2026-11-25', /Nov/],
      ['2026-12-25', /Dec/],
    ];

    for (var i = 0; i < cases.length; i++) {
      var dateStr = cases[i][0];
      var pattern = cases[i][1];
      assert.match(formatDate(dateStr), pattern,
        'Expected ' + dateStr + ' to contain ' + pattern);
    }
  });

  it('includes the correct day number', function() {
    assert.match(formatDate('2026-01-01'), /\b1\b/);
    assert.match(formatDate('2026-01-15'), /15/);
    assert.match(formatDate('2026-01-31'), /31/);
  });

  it('uses noon time to avoid timezone boundary issues', function() {
    // The function appends T12:00:00 to avoid date shifting at midnight.
    // Test a date that could shift if parsed at UTC midnight.
    // 2026-03-08 is DST spring-forward in the US.
    var result = formatDate('2026-03-08');
    assert.match(result, /Mar/);
    assert.match(result, /8\b/);
  });

  it('handles the first day of the year', function() {
    var result = formatDate('2026-01-01');
    assert.match(result, /Jan/);
    assert.match(result, /Thu/);  // Jan 1 2026 is Thursday
  });

  it('handles the last day of the year', function() {
    var result = formatDate('2026-12-31');
    assert.match(result, /Dec/);
    assert.match(result, /31/);
    assert.match(result, /Thu/);  // Dec 31 2026 is Thursday
  });

  it('handles leap year date', function() {
    // 2028 is a leap year
    var result = formatDate('2028-02-29');
    assert.match(result, /Feb/);
    assert.match(result, /29/);
  });

  it('returns consistent format across multiple calls', function() {
    var result1 = formatDate('2026-05-15');
    var result2 = formatDate('2026-05-15');
    assert.equal(result1, result2);
  });

  it('handles single-digit days without leading zero', function() {
    // The output should say "5" not "05"
    var result = formatDate('2026-03-05');
    assert.match(result, /\b5\b/);
  });
});

// ============================================
// createInitialState tests (activity-engine.js)
// ============================================

describe('createInitialState (activity-engine.js)', function() {

  /**
   * Extract createInitialState from the IIFE in activity-engine.js
   * and return it as a callable function with isMobile() mocked.
   */
  function getCreateInitialState(isMobileReturn) {
    var source = readSource('js/activity-engine.js');
    var funcSource = extractFunction(source, 'createInitialState');
    assert.ok(funcSource, 'createInitialState should be extractable from source');

    var wrapper = [
      'function isMobile() { return ' + isMobileReturn + '; }',
      funcSource,
      'return createInitialState;',
    ].join('\n');

    var factory = new Function(wrapper);
    return factory();
  }

  it('returns an object with all expected top-level properties', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.ok('startedAt' in state, 'Should have startedAt');
    assert.ok('lastUpdatedAt' in state, 'Should have lastUpdatedAt');
    assert.ok('responses' in state, 'Should have responses');
    assert.ok('currentQuestionIndex' in state, 'Should have currentQuestionIndex');
    assert.ok('name' in state, 'Should have name');
    assert.ok('downloadedAt' in state, 'Should have downloadedAt');
    assert.ok('device' in state, 'Should have device');
  });

  it('sets startedAt and lastUpdatedAt as ISO date strings', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    // Should be valid ISO 8601 strings
    var started = new Date(state.startedAt);
    var updated = new Date(state.lastUpdatedAt);

    assert.ok(!isNaN(started.getTime()), 'startedAt should be a valid date');
    assert.ok(!isNaN(updated.getTime()), 'lastUpdatedAt should be a valid date');

    // Should match ISO format pattern
    assert.match(state.startedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    assert.match(state.lastUpdatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('initializes responses as an empty object', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.deepStrictEqual(state.responses, {});
    assert.equal(Object.keys(state.responses).length, 0);
  });

  it('starts at question index 0', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.equal(state.currentQuestionIndex, 0);
  });

  it('initializes name as null', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.equal(state.name, null);
  });

  it('initializes downloadedAt as null', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.equal(state.downloadedAt, null);
  });

  it('sets device.type to "desktop" when not mobile', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.equal(state.device.type, 'desktop');
  });

  it('sets device.type to "mobile" when on mobile', function() {
    var createInitialState = getCreateInitialState(true);
    var state = createInitialState();

    assert.equal(state.device.type, 'mobile');
  });

  it('initializes device warning flags to false', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    assert.equal(state.device.sawMobileWarning, false);
    assert.equal(state.device.continuedOnMobile, false);
  });

  it('mobile device also has warning flags initialized to false', function() {
    var createInitialState = getCreateInitialState(true);
    var state = createInitialState();

    assert.equal(state.device.sawMobileWarning, false);
    assert.equal(state.device.continuedOnMobile, false);
  });

  it('each call creates a completely fresh state object', function() {
    var createInitialState = getCreateInitialState(false);
    var state1 = createInitialState();
    var state2 = createInitialState();

    // Should be different object references
    assert.notStrictEqual(state1, state2);
    assert.notStrictEqual(state1.responses, state2.responses);
    assert.notStrictEqual(state1.device, state2.device);
  });

  it('timestamps are close to current time', function() {
    var createInitialState = getCreateInitialState(false);
    var before = Date.now();
    var state = createInitialState();
    var after = Date.now();

    var startedTime = new Date(state.startedAt).getTime();
    assert.ok(startedTime >= before, 'startedAt should not be before creation');
    assert.ok(startedTime <= after, 'startedAt should not be after creation');
  });

  it('state is JSON-serializable (for localStorage persistence)', function() {
    var createInitialState = getCreateInitialState(false);
    var state = createInitialState();

    // Should survive JSON round-trip
    var serialized = JSON.stringify(state);
    var deserialized = JSON.parse(serialized);

    assert.equal(deserialized.currentQuestionIndex, 0);
    assert.equal(deserialized.name, null);
    assert.equal(deserialized.device.type, 'desktop');
    assert.deepStrictEqual(deserialized.responses, {});
  });
});
