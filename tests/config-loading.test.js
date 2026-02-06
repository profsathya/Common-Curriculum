/**
 * Config Loading Tests
 *
 * Tests the loadConfig() pattern from scripts/canvas-sync.js.
 * The function uses the Function constructor to parse JS config files
 * and extract named config objects.
 *
 * We re-implement the core pattern here to test it in isolation,
 * and also test it against the actual project config files.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT_DIR } = require('./helpers');

/**
 * Re-implementation of the loadConfig core pattern from canvas-sync.js.
 * Uses the same Function constructor approach as the original.
 */
function loadConfigFromContent(content, configVarName) {
  try {
    const fn = new Function(content + '\nreturn ' + configVarName + ';');
    return fn();
  } catch (err) {
    throw new Error('Could not parse config: ' + err.message);
  }
}

/**
 * Full loadConfig re-implementation matching canvas-sync.js behavior.
 * Reads a file and returns { config, rawContent, configPath }.
 */
function loadConfig(configFile, configVarName) {
  const configPath = path.join(ROOT_DIR, configFile);
  const content = fs.readFileSync(configPath, 'utf-8');

  try {
    const fn = new Function(content + '\nreturn ' + configVarName + ';');
    const config = fn();
    return { config: config, rawContent: content, configPath: configPath };
  } catch (err) {
    throw new Error('Could not parse config from ' + configFile + ': ' + err.message);
  }
}

// ============================================
// Function constructor pattern tests
// ============================================

describe('loadConfig pattern - Function constructor approach', function() {

  it('parses a simple const declaration', function() {
    var content = 'const MY_CONFIG = { name: "test", value: 42 };';
    var result = loadConfigFromContent(content, 'MY_CONFIG');
    assert.deepStrictEqual(result, { name: 'test', value: 42 });
  });

  it('parses config with nested objects', function() {
    var content = [
      'const CONFIG = {',
      '  assignments: {',
      '    "s1-test": {',
      '      title: "Test",',
      '      canvasId: "123",',
      '      points: 10',
      '    }',
      '  }',
      '};',
    ].join('\n');

    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.assignments['s1-test'].title, 'Test');
    assert.equal(result.assignments['s1-test'].points, 10);
    assert.equal(result.assignments['s1-test'].canvasId, '123');
  });

  it('parses config with arrays', function() {
    var content = 'const CONFIG = { items: [1, 2, 3], tags: ["a", "b"] };';
    var result = loadConfigFromContent(content, 'CONFIG');
    assert.deepStrictEqual(result.items, [1, 2, 3]);
    assert.deepStrictEqual(result.tags, ['a', 'b']);
  });

  it('handles var declarations', function() {
    var content = 'var CONFIG = { legacy: true };';
    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.legacy, true);
  });

  it('handles let declarations', function() {
    var content = 'let CONFIG = { mutable: true };';
    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.mutable, true);
  });

  it('handles config with comments', function() {
    var content = [
      '// This is a config file',
      '/* Multi-line',
      '   comment */',
      'const CONFIG = {',
      '  // Inline comment',
      '  value: 42',
      '};',
    ].join('\n');

    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.value, 42);
  });

  it('handles strings containing special characters', function() {
    var content = [
      'const CONFIG = {',
      '  url: "https://example.com/courses/12345",',
      '  name: "Sprint 1: Goals & Planning",',
      '  code: "CST349-01"',
      '};',
    ].join('\n');

    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.url, 'https://example.com/courses/12345');
    assert.equal(result.name, 'Sprint 1: Goals & Planning');
    assert.equal(result.code, 'CST349-01');
  });

  it('handles config with multiple variable declarations', function() {
    var content = [
      'const HELPER = { x: 1 };',
      'const CONFIG = { y: 2, z: HELPER.x };',
    ].join('\n');

    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.y, 2);
    assert.equal(result.z, 1);
  });

  it('handles config with computed properties', function() {
    var content = 'const CONFIG = { total: 10 + 20, flag: !false };';
    var result = loadConfigFromContent(content, 'CONFIG');
    assert.equal(result.total, 30);
    assert.equal(result.flag, true);
  });

  it('throws on wrong variable name', function() {
    var content = 'const MY_CONFIG = { test: true };';
    assert.throws(
      function() { loadConfigFromContent(content, 'WRONG_NAME'); },
      function(err) {
        assert.ok(err.message.includes('Could not parse config'));
        return true;
      }
    );
  });

  it('throws on invalid JavaScript', function() {
    assert.throws(
      function() { loadConfigFromContent('not valid { javascript }}', 'CONFIG'); },
      function(err) {
        assert.ok(err.message.includes('Could not parse config'));
        return true;
      }
    );
  });

  it('throws on empty content with a variable name', function() {
    assert.throws(
      function() { loadConfigFromContent('', 'CONFIG'); },
      function(err) {
        assert.ok(err.message.includes('Could not parse config'));
        return true;
      }
    );
  });

  it('handles config with boolean values', function() {
    var content = 'const C = { a: true, b: false, c: null };';
    var result = loadConfigFromContent(content, 'C');
    assert.equal(result.a, true);
    assert.equal(result.b, false);
    assert.equal(result.c, null);
  });

  it('handles config with numeric edge cases', function() {
    var content = 'const C = { zero: 0, neg: -1, float: 3.14 };';
    var result = loadConfigFromContent(content, 'C');
    assert.equal(result.zero, 0);
    assert.equal(result.neg, -1);
    assert.equal(result.float, 3.14);
  });
});

// ============================================
// Tests with actual project config files
// ============================================

describe('loadConfig with actual config files', function() {

  it('loads cst349-config.js successfully', function() {
    var result = loadConfig('config/cst349-config.js', 'CST349_CONFIG');
    assert.ok(result.config, 'Config object should exist');
    assert.ok(result.rawContent, 'Raw content should be returned');
    assert.ok(result.configPath.endsWith('cst349-config.js'));
  });

  it('loads cst395-config.js successfully', function() {
    var result = loadConfig('config/cst395-config.js', 'CST395_CONFIG');
    assert.ok(result.config, 'Config object should exist');
    assert.ok(result.config.assignments, 'Config should have assignments');
  });

  it('cst349 config has required top-level properties', function() {
    var config = loadConfig('config/cst349-config.js', 'CST349_CONFIG').config;

    assert.equal(typeof config.semester, 'string');
    assert.equal(typeof config.courseCode, 'string');
    assert.equal(typeof config.canvasBaseUrl, 'string');
    assert.equal(typeof config.assignments, 'object');
  });

  it('cst349 config canvasBaseUrl contains a course ID', function() {
    var config = loadConfig('config/cst349-config.js', 'CST349_CONFIG').config;
    assert.match(config.canvasBaseUrl, /\/courses\/\d+/);
  });

  it('config assignments have required fields (title, dueDate)', function() {
    var config = loadConfig('config/cst349-config.js', 'CST349_CONFIG').config;
    var keys = Object.keys(config.assignments);

    assert.ok(keys.length > 0, 'Should have at least one assignment');

    // Check first few assignments
    var sample = keys.slice(0, 5);
    for (var i = 0; i < sample.length; i++) {
      var key = sample[i];
      var a = config.assignments[key];
      assert.ok(a.title, 'Assignment "' + key + '" should have a title');
      assert.ok(a.dueDate, 'Assignment "' + key + '" should have a dueDate');
    }
  });

  it('returns rawContent as the exact file content', function() {
    var result = loadConfig('config/cst349-config.js', 'CST349_CONFIG');

    assert.equal(typeof result.rawContent, 'string');
    assert.ok(result.rawContent.includes('CST349_CONFIG'));
    assert.ok(result.rawContent.length > 100);
  });

  it('returns the resolved configPath', function() {
    var result = loadConfig('config/cst349-config.js', 'CST349_CONFIG');
    assert.equal(result.configPath, path.join(ROOT_DIR, 'config/cst349-config.js'));
  });

  it('throws on non-existent config file', function() {
    assert.throws(
      function() { loadConfig('config/nonexistent-file.js', 'SOME_VAR'); },
      function(err) {
        return err.code === 'ENOENT';
      }
    );
  });

  it('throws when using wrong variable name for existing config', function() {
    assert.throws(
      function() { loadConfig('config/cst349-config.js', 'WRONG_VAR_NAME'); },
      function(err) {
        assert.ok(err.message.includes('Could not parse config'));
        return true;
      }
    );
  });
});
