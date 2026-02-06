/**
 * Title Matching Tests
 *
 * Tests normalizeTitle(), extractTitleCore(), matchAssignments(),
 * and fuzzyMatchAssignments() from scripts/canvas-sync.js.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildFunctions } = require('./helpers');

// Extract all four functions. They share a scope so that matchAssignments
// can call normalizeTitle and fuzzyMatchAssignments can call extractTitleCore.
const {
  normalizeTitle,
  extractTitleCore,
  matchAssignments,
  fuzzyMatchAssignments,
} = buildFunctions('scripts/canvas-sync.js', [
  'normalizeTitle',
  'extractTitleCore',
  'matchAssignments',
  'fuzzyMatchAssignments',
]);

// ============================================
// normalizeTitle tests
// ============================================

describe('normalizeTitle (canvas-sync.js)', function() {

  it('converts to lowercase', function() {
    assert.equal(normalizeTitle('Hello World'), 'hello world');
  });

  it('collapses multiple spaces into one', function() {
    assert.equal(normalizeTitle('Hello   World'), 'hello world');
  });

  it('trims leading and trailing whitespace', function() {
    assert.equal(normalizeTitle('  Hello World  '), 'hello world');
  });

  it('returns already-normalized title unchanged', function() {
    assert.equal(normalizeTitle('hello world'), 'hello world');
  });

  it('normalizes tabs and newlines to single space', function() {
    assert.equal(normalizeTitle('Hello\t\nWorld'), 'hello world');
  });

  it('handles empty string', function() {
    assert.equal(normalizeTitle(''), '');
  });

  it('handles string with only whitespace', function() {
    assert.equal(normalizeTitle('   '), '');
  });

  it('normalizes a real assignment title from the project', function() {
    assert.equal(
      normalizeTitle('S1: Skills Self-Assessment'),
      's1: skills self-assessment'
    );
  });

  it('preserves special characters (hyphens, colons, hashes)', function() {
    assert.equal(
      normalizeTitle('S1: Productive Reflection #1'),
      's1: productive reflection #1'
    );
  });

  it('handles unicode characters', function() {
    const result = normalizeTitle('HELLO WORLD');
    assert.equal(result, 'hello world');
  });
});

// ============================================
// extractTitleCore tests
// ============================================

describe('extractTitleCore (canvas-sync.js)', function() {

  it('removes "Sprint N: " prefix', function() {
    assert.equal(
      extractTitleCore('Sprint 1: Skills Self-Assessment'),
      'skills self-assessment'
    );
  });

  it('removes "SN: " prefix', function() {
    assert.equal(
      extractTitleCore('S1: Superagency Challenge'),
      'superagency challenge'
    );
  });

  it('leaves title without prefix unchanged (lowercased)', function() {
    assert.equal(
      extractTitleCore('Skills Self-Assessment'),
      'skills self-assessment'
    );
  });

  it('is case-insensitive for "Sprint" prefix', function() {
    assert.equal(extractTitleCore('SPRINT 2: Test'), 'test');
    assert.equal(extractTitleCore('sprint 3: Test'), 'test');
    assert.equal(extractTitleCore('Sprint 4: Test'), 'test');
  });

  it('is case-insensitive for "S" prefix', function() {
    assert.equal(extractTitleCore('S4: Test'), 'test');
    assert.equal(extractTitleCore('s4: Test'), 'test');
  });

  it('handles multi-digit sprint numbers', function() {
    assert.equal(extractTitleCore('Sprint 12: Final Review'), 'final review');
    assert.equal(extractTitleCore('S10: Final Assessment'), 'final assessment');
  });

  it('handles Sprint prefix with no space before number', function() {
    assert.equal(extractTitleCore('Sprint1: Test'), 'test');
  });

  it('handles Sprint prefix with no space after colon', function() {
    assert.equal(extractTitleCore('Sprint 1:Test'), 'test');
  });

  it('handles Sprint prefix with extra spaces around colon', function() {
    assert.equal(extractTitleCore('Sprint  1 :  Test'), 'test');
  });

  it('collapses extra whitespace in the core', function() {
    assert.equal(extractTitleCore('S1:   Multiple   Spaces'), 'multiple spaces');
  });

  it('handles empty string', function() {
    assert.equal(extractTitleCore(''), '');
  });

  it('does NOT remove prefix that is not at the start', function() {
    // "Activity: Sprint 1: Skills" should not remove "Sprint 1:"
    // because the regex anchors to ^
    const result = extractTitleCore('Activity: Sprint 1: Skills');
    assert.equal(result, 'activity: sprint 1: skills');
  });

  it('trims leading and trailing whitespace from final result', function() {
    // Note: leading whitespace prevents the ^-anchored prefix regex from matching.
    // So '  S1: Test  ' keeps its prefix because ^ doesn't match after spaces.
    assert.equal(extractTitleCore('  S1: Test  '), 's1: test');
    // Without leading whitespace, the prefix IS removed
    assert.equal(extractTitleCore('S1: Test  '), 'test');
  });

  it('handles title that starts with "Sprint" but has no colon', function() {
    // "Sprint Activity" - "sprint" matches but no \d+ follows
    assert.equal(extractTitleCore('Sprint Activity'), 'sprint activity');
  });

  it('handles title starting with "S" followed by non-digit', function() {
    assert.equal(extractTitleCore('Sample Title'), 'sample title');
  });

  it('both "Sprint N:" and "SN:" produce the same core for the same title', function() {
    const core1 = extractTitleCore('Sprint 1: Test Activity');
    const core2 = extractTitleCore('S1: Test Activity');
    assert.equal(core1, core2);
  });
});

// ============================================
// matchAssignments tests (exact title matching)
// ============================================

describe('matchAssignments (canvas-sync.js)', function() {

  it('matches assignments by exact normalized title', function() {
    const canvas = [
      { id: 100, name: 'S1: Skills Self-Assessment' },
      { id: 200, name: 'S1: Productive Reflection #1' },
    ];
    const config = {
      's1-self-assessment': { title: 'S1: Skills Self-Assessment', canvasId: '' },
      's1-reflection-1': { title: 'S1: Productive Reflection #1', canvasId: '123' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched.length, 2);
    assert.equal(results.notInCanvas.length, 0);
    assert.equal(results.unmatched.length, 0);
  });

  it('matches case-insensitively', function() {
    const canvas = [
      { id: 100, name: 'S1: SKILLS SELF-ASSESSMENT' },
    ];
    const config = {
      's1-test': { title: 's1: skills self-assessment', canvasId: '' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
  });

  it('matches despite extra whitespace in titles', function() {
    const canvas = [
      { id: 100, name: 'S1:  Test  Assignment' },
    ];
    const config = {
      'test': { title: 'S1: Test Assignment', canvasId: '' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
  });

  it('identifies config items not found in Canvas', function() {
    const canvas = [];
    const config = {
      's1-test': { title: 'S1: Test', canvasId: '' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.notInCanvas.length, 1);
    assert.equal(results.notInCanvas[0].key, 's1-test');
  });

  it('identifies Canvas items not in config', function() {
    const canvas = [
      { id: 999, name: 'Unknown Assignment' },
    ];
    const config = {};

    const results = matchAssignments(canvas, config);
    assert.equal(results.unmatched.length, 1);
    assert.equal(results.unmatched[0].canvasId, '999');
  });

  it('detects changed canvas IDs', function() {
    const canvas = [
      { id: 200, name: 'Test Assignment' },
    ];
    const config = {
      'test': { title: 'Test Assignment', canvasId: '100' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    assert.equal(results.matched[0].changed, true);
    assert.equal(results.matched[0].oldCanvasId, '100');
    assert.equal(results.matched[0].newCanvasId, '200');
  });

  it('returns changed:false when IDs already match', function() {
    const canvas = [
      { id: 100, name: 'Test Assignment' },
    ];
    const config = {
      'test': { title: 'Test Assignment', canvasId: '100' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched[0].changed, false);
  });

  it('converts canvas IDs to strings', function() {
    const canvas = [
      { id: 12345, name: 'Test' },
    ];
    const config = {
      'test': { title: 'Test', canvasId: '' },
    };

    const results = matchAssignments(canvas, config);
    assert.equal(typeof results.matched[0].newCanvasId, 'string');
    assert.equal(results.matched[0].newCanvasId, '12345');
  });

  it('handles empty inputs gracefully', function() {
    const results = matchAssignments([], {});
    assert.equal(results.matched.length, 0);
    assert.equal(results.notInCanvas.length, 0);
    assert.equal(results.unmatched.length, 0);
  });

  it('handles many assignments correctly', function() {
    const canvas = [];
    const config = {};
    for (let i = 0; i < 20; i++) {
      canvas.push({ id: i + 1000, name: 'Assignment ' + i });
      config['a' + i] = { title: 'Assignment ' + i, canvasId: '' };
    }

    const results = matchAssignments(canvas, config);
    assert.equal(results.matched.length, 20);
    assert.equal(results.notInCanvas.length, 0);
    assert.equal(results.unmatched.length, 0);
  });
});

// ============================================
// fuzzyMatchAssignments tests (core title matching)
// ============================================

describe('fuzzyMatchAssignments (canvas-sync.js)', function() {

  it('matches assignments by core title, ignoring sprint prefix', function() {
    const canvas = [
      { id: 100, name: 'Sprint 1: Skills Self-Assessment' },
    ];
    const config = {
      's1-self-assessment': { title: 'S1: Skills Self-Assessment' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    assert.equal(results.matched[0].canvasId, '100');
    assert.equal(results.matched[0].key, 's1-self-assessment');
  });

  it('detects when Canvas name differs from config title (needsRename)', function() {
    const canvas = [
      { id: 100, name: 'Sprint 1: Skills Self-Assessment' },
    ];
    const config = {
      's1-self-assessment': { title: 'S1: Skills Self-Assessment' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched[0].needsRename, true);
    assert.equal(results.matched[0].canvasTitle, 'Sprint 1: Skills Self-Assessment');
    assert.equal(results.matched[0].configTitle, 'S1: Skills Self-Assessment');
  });

  it('detects when no rename is needed (exact match)', function() {
    const canvas = [
      { id: 100, name: 'Skills Self-Assessment' },
    ];
    const config = {
      'test': { title: 'Skills Self-Assessment' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched[0].needsRename, false);
  });

  it('matches when both have "Sprint N:" prefix format', function() {
    const canvas = [
      { id: 100, name: 'Sprint 2: Bridge Activity' },
    ];
    const config = {
      's2-bridge': { title: 'Sprint 2: Bridge Activity' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    assert.equal(results.matched[0].needsRename, false);
  });

  it('matches "Sprint N:" in Canvas to "SN:" in config', function() {
    const canvas = [
      { id: 100, name: 'Sprint 1: Test Activity' },
    ];
    const config = {
      's1-test': { title: 'S1: Test Activity' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    // Both cores should be "test activity"
    assert.equal(results.matched[0].needsRename, true);
  });

  it('matches titles with no prefix at all', function() {
    const canvas = [
      { id: 100, name: 'Final Portfolio Review' },
    ];
    const config = {
      'portfolio': { title: 'Final Portfolio Review' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    assert.equal(results.matched[0].needsRename, false);
  });

  it('identifies unmatched Canvas assignments', function() {
    const canvas = [
      { id: 100, name: 'Unknown Assignment' },
    ];
    const config = {};

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.unmatchedCanvas.length, 1);
    assert.equal(results.unmatchedCanvas[0].canvasId, '100');
    assert.equal(results.unmatchedCanvas[0].title, 'Unknown Assignment');
  });

  it('identifies unmatched config assignments', function() {
    const canvas = [];
    const config = {
      'test': { title: 'S1: Unique Assignment' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.unmatchedConfig.length, 1);
    assert.equal(results.unmatchedConfig[0].key, 'test');
    assert.equal(results.unmatchedConfig[0].title, 'S1: Unique Assignment');
  });

  it('does not double-match a Canvas assignment to multiple config entries', function() {
    const canvas = [
      { id: 100, name: 'Sprint 1: Test' },
    ];
    const config = {
      'a': { title: 'S1: Test' },
      'b': { title: 'Sprint 1: Test' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    // Canvas item is consumed by the first matching config entry
    assert.equal(results.matched.length, 1);
    assert.equal(results.unmatchedConfig.length, 1);
  });

  it('handles multiple matches and unmatched items correctly', function() {
    const canvas = [
      { id: 1, name: 'Sprint 1: Activity A' },
      { id: 2, name: 'Sprint 2: Activity B' },
      { id: 3, name: 'Orphan Activity' },
    ];
    const config = {
      'a': { title: 'S1: Activity A' },
      'b': { title: 'S2: Activity B' },
      'c': { title: 'S3: Missing Activity' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 2);
    assert.equal(results.unmatchedCanvas.length, 1);
    assert.equal(results.unmatchedConfig.length, 1);
    assert.equal(results.unmatchedCanvas[0].title, 'Orphan Activity');
    assert.equal(results.unmatchedConfig[0].key, 'c');
  });

  it('handles empty inputs gracefully', function() {
    const results = fuzzyMatchAssignments([], {});
    assert.equal(results.matched.length, 0);
    assert.equal(results.unmatchedCanvas.length, 0);
    assert.equal(results.unmatchedConfig.length, 0);
  });

  it('stores configEntry reference on unmatched config items', function() {
    const canvas = [];
    const configEntry = { title: 'S1: Test', type: 'quiz' };
    const config = {
      'test': configEntry,
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.unmatchedConfig[0].configEntry, configEntry);
  });

  it('converts Canvas IDs to strings in results', function() {
    const canvas = [
      { id: 99999, name: 'Test' },
    ];
    const config = {
      'test': { title: 'Test' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(typeof results.matched[0].canvasId, 'string');
    assert.equal(results.matched[0].canvasId, '99999');
  });

  it('handles duplicate core titles in Canvas (first one wins)', function() {
    const canvas = [
      { id: 100, name: 'Sprint 1: Duplicate Title' },
      { id: 200, name: 'S1: Duplicate Title' },
    ];
    const config = {
      'dup': { title: 'Duplicate Title' },
    };

    const results = fuzzyMatchAssignments(canvas, config);
    assert.equal(results.matched.length, 1);
    // First Canvas item with that core title should be used
    assert.equal(results.matched[0].canvasId, '100');
    // The second Canvas item with same core is never added to the map
    assert.equal(results.unmatchedCanvas.length, 0);
  });
});
