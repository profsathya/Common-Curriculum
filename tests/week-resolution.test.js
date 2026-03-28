/**
 * Week Resolution Tests
 *
 * Tests getResolvedCurrentWeek() from js/components.js.
 * Verifies gap detection, boundary conditions, and date override behavior.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildFunctions } = require('./helpers');

// Extract the function — it depends on getSimulatedDate, so we mock it
const { getResolvedCurrentWeek } = buildFunctions(
  'js/components.js',
  ['getResolvedCurrentWeek'],
  // Preamble: stub getSimulatedDate and formatDate (not needed for logic tests)
  'function getSimulatedDate() { return null; }\n' +
  'function formatDate(d) { return d; }\n'
);

// Sample config matching CST395 structure (simplified)
const testConfig = {
  weekDates: {
    1: { start: '2026-01-18', end: '2026-01-24', sprint: 1, title: 'Week 1' },
    2: { start: '2026-01-25', end: '2026-01-31', sprint: 1, title: 'Week 2' },
    3: { start: '2026-02-01', end: '2026-02-07', sprint: 1, title: 'Week 3' },
    4: { start: '2026-02-08', end: '2026-02-14', sprint: 1, title: 'Week 4' },
    // Gap between week 4 and week 5 (weekend: Feb 14 -> Feb 15)
    5: { start: '2026-02-15', end: '2026-02-21', sprint: 2, title: 'Week 5' },
    10: { start: '2026-03-22', end: '2026-03-28', sprint: 3, title: 'Week 10' },
    // Spring break gap: Mar 29 - Apr 4
    11: { start: '2026-04-05', end: '2026-04-11', sprint: 3, title: 'Week 11' },
    16: { start: '2026-05-10', end: '2026-05-16', sprint: 4, title: 'Week 16' }
  },
  sprints: {
    1: { name: 'Foundation' },
    2: { name: 'Mirror' },
    3: { name: 'Complexity' },
    4: { name: 'Mastery' }
  }
};

describe('getResolvedCurrentWeek', function() {

  it('returns null before semester starts', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-01-15T12:00:00'));
    assert.equal(result.week, null);
    assert.equal(result.isGap, false);
  });

  it('returns week 1 on the first day of semester', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-01-18T12:00:00'));
    assert.equal(result.week, 1);
    assert.equal(result.isGap, false);
  });

  it('returns week 1 mid-week', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-01-21T12:00:00'));
    assert.equal(result.week, 1);
    assert.equal(result.isGap, false);
  });

  it('returns week 1 on last day of week 1', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-01-24T12:00:00'));
    assert.equal(result.week, 1);
    assert.equal(result.isGap, false);
  });

  it('returns week 2 on first day of week 2', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-01-25T12:00:00'));
    assert.equal(result.week, 2);
    assert.equal(result.isGap, false);
  });

  it('detects spring break gap and returns week 10', function() {
    // Mar 30 is during spring break (between week 10 end Mar 28 and week 11 start Apr 5)
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-03-30T12:00:00'));
    assert.equal(result.week, 10);
    assert.equal(result.isGap, true);
    assert.ok(result.gapMessage.includes('Week 11'));
    assert.ok(result.gapMessage.includes('Apr'));
  });

  it('returns week 11 once spring break ends', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-04-05T12:00:00'));
    assert.equal(result.week, 11);
    assert.equal(result.isGap, false);
  });

  it('returns last week number after semester ends', function() {
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-06-01T12:00:00'));
    assert.equal(result.week, 16);
    assert.equal(result.isGap, false);
  });

  it('handles gap between consecutive weeks (weekend)', function() {
    // Feb 14 is end of week 4, Feb 15 is start of week 5 — no gap
    var result = getResolvedCurrentWeek(testConfig, new Date('2026-02-14T12:00:00'));
    assert.equal(result.week, 4);
    assert.equal(result.isGap, false);
  });

  it('returns non-null during any gap after semester start', function() {
    // Any date after start should resolve to a week
    var dates = [
      '2026-01-18', '2026-02-01', '2026-03-15',
      '2026-03-30', '2026-04-01', '2026-05-20'
    ];
    dates.forEach(function(d) {
      var result = getResolvedCurrentWeek(testConfig, new Date(d + 'T12:00:00'));
      assert.ok(result.week !== null, 'Expected non-null week for date ' + d);
    });
  });
});
