/**
 * Synthesis Parsing & Rendering Tests
 *
 * Tests parsePhaseResponse(), extractBriefValue(), fixJsonStringNewlines(),
 * and extractBriefByMarkers() against a variety of AI response formats
 * that have caused raw JSON rendering bugs in production.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readSource } = require('./helpers');

// ============================================
// Load functions from ES module source files
// ============================================

function loadModuleFunctions(relativePath, extraPreamble) {
  var source = readSource(relativePath);
  // Strip ES module syntax
  var cleaned = source
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+(async\s+)?function/gm, '$1function')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '');
  var sandbox = Object.create(null);
  sandbox.JSON = JSON;
  sandbox.Array = Array;
  sandbox.String = String;
  sandbox.RegExp = RegExp;
  sandbox.Error = Error;
  sandbox.Object = Object;
  sandbox.console = console;
  sandbox.parseInt = parseInt;
  sandbox.Math = Math;
  // Allow global constructors
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  sandbox.fetch = function () {};
  sandbox.AbortController = AbortController;
  if (extraPreamble) {
    vm.runInNewContext(extraPreamble, sandbox);
  }
  vm.runInNewContext(cleaned, sandbox);
  return sandbox;
}

// Load api.js (small file, safe to eval entirely)
var api = loadModuleFunctions('career-intelligence/api.js', 'var CONFIG = {};');
var parsePhaseResponse = api.parsePhaseResponse;
var fixJsonStringNewlines = api.fixJsonStringNewlines;
var extractBriefValue = api.extractBriefValue;

// For extractBriefByMarkers, define it directly from the source to avoid
// loading the entire form.js (which has heavy DOM dependencies).
// We read just this function's source between known markers.
var formSource = readSource('career-intelligence/form.js');
var fnStart = formSource.indexOf('function extractBriefByMarkers(raw)');
// Find matching closing brace using a proper parser that skips strings and regex
var fnSource = (function extractFn(src, start) {
  var bracePos = src.indexOf('{', start);
  var depth = 0;
  var inString = false;
  var stringChar = '';
  var escaped = false;
  for (var i = bracePos; i < src.length; i++) {
    var ch = src[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    // Skip regex literals — detect them by looking for / preceded by certain tokens
    if (ch === '/' && i > 0) {
      var prev = src.substring(Math.max(0, i - 20), i).trimEnd();
      var lastChar = prev[prev.length - 1];
      if (lastChar === '=' || lastChar === '(' || lastChar === ',' || lastChar === '[' || lastChar === '!' || lastChar === '&' || lastChar === '|' || lastChar === ':' || lastChar === ';' || lastChar === '{' || lastChar === '}' || lastChar === 'n') {
        // Likely a regex, skip to closing /
        var j = i + 1;
        var regEscaped = false;
        var inCharClass = false;
        while (j < src.length) {
          var rc = src[j];
          if (regEscaped) { regEscaped = false; j++; continue; }
          if (rc === '\\') { regEscaped = true; j++; continue; }
          if (rc === '[') { inCharClass = true; j++; continue; }
          if (rc === ']') { inCharClass = false; j++; continue; }
          if (rc === '/' && !inCharClass) { i = j; break; }
          j++;
        }
        continue;
      }
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) return src.substring(start, i + 1);
  }
  return null;
})(formSource, fnStart);

var formSandbox = Object.create(null);
formSandbox.JSON = JSON;
formSandbox.Array = Array;
formSandbox.String = String;
formSandbox.RegExp = RegExp;
formSandbox.Math = Math;
formSandbox.parseInt = parseInt;
vm.runInNewContext(fnSource, formSandbox);
var extractBriefByMarkers = formSandbox.extractBriefByMarkers;

// ============================================
// Test data: real-world AI response variants
// ============================================

var WELL_FORMED_JSON = JSON.stringify({
  reaction: null,
  follow_up: null,
  phase: 'synthesis',
  brief: '## Where You Are\n\nYou\'re a graduating senior in CS.\n\n## What I See\n\nStrong technical skills.\n\n## A Direction Worth Exploring\n\nProduct management.\n\n## Your First Move\n\nReach out to 3 PMs this week.',
  pitch: 'CTI\'s Career Intelligence program might be a good next step if:\n- You want structured guidance\n- You\'re open to exploring',
});

var JSON_WITH_ESCAPED_QUOTES = JSON.stringify({
  reaction: null,
  follow_up: null,
  phase: 'synthesis',
  brief: '## Where You Are\n\nYou mentioned wanting to "break into tech."\n\n## What I See\n\nReplace "seeking opportunities" with "targeting PM roles at Series B startups."\n\n## A Direction Worth Exploring\n\nProduct strategy.\n\n## Your First Move\n\nUpdate your LinkedIn headline.',
  pitch: 'This program helps you build a strategy.',
});

// JSON with literal (unescaped) newlines inside string values
var JSON_WITH_LITERAL_NEWLINES =
  '{"reaction": null, "follow_up": null, "phase": "synthesis", "brief": "## Where You Are\n\nYou are a senior.\n\n## What I See\n\nGood skills.\n\n## A Direction Worth Exploring\n\nConsulting.\n\n## Your First Move\n\nNetwork.", "pitch": "Consider the program."}';

// JSON wrapped in markdown code fences
var JSON_IN_CODE_FENCE = '```json\n' + WELL_FORMED_JSON + '\n```';

// JSON with unescaped double quotes inside prose (breaks JSON.parse).
var BROKEN_JSON_UNESCAPED_QUOTES =
  '{"reaction": null, "follow_up": null, "phase": "synthesis", "brief": "## Where You Are\\n\\nYou are graduating.\\n\\n## What I See\\n\\nReplace "seeking opportunities" with "targeting PM roles."\\n\\n## A Direction Worth Exploring\\n\\nProduct management.\\n\\n## Your First Move\\n\\nReach out to PMs.", "pitch": "Consider the program."}';

// Deepening response (not synthesis)
var DEEPENING_RESPONSE = JSON.stringify({
  reaction: 'That\'s interesting. Tell me more about your experience.',
  follow_up: 'What specific projects have you worked on?',
  phase: 'deepening',
});

// Advance response
var ADVANCE_RESPONSE = JSON.stringify({
  reaction: 'Great, let\'s move on.',
  follow_up: null,
  phase: 'advance',
  transition: 'Now let\'s look at this from a different angle.',
  next_question_id: 'q3_a',
});

// ============================================
// parsePhaseResponse tests
// ============================================

describe('parsePhaseResponse', function () {

  it('parses well-formed JSON synthesis response', function () {
    var result = parsePhaseResponse(WELL_FORMED_JSON);
    assert.equal(result.phase, 'synthesis');
    assert.ok(result.brief.includes('Where You Are'));
    assert.ok(result.brief.includes('Your First Move'));
    assert.ok(result.pitch.includes('Career Intelligence'));
    assert.equal(result.reaction, null);
  });

  it('parses JSON with escaped quotes in prose', function () {
    var result = parsePhaseResponse(JSON_WITH_ESCAPED_QUOTES);
    assert.equal(result.phase, 'synthesis');
    assert.ok(result.brief.includes('break into tech'));
    assert.ok(result.brief.includes('targeting PM roles'));
  });

  it('parses JSON with literal newlines inside string values', function () {
    var result = parsePhaseResponse(JSON_WITH_LITERAL_NEWLINES);
    assert.equal(result.phase, 'synthesis');
    assert.ok(result.brief.includes('Where You Are'));
    assert.ok(result.brief.includes('Your First Move'));
  });

  it('parses JSON wrapped in markdown code fences', function () {
    var result = parsePhaseResponse(JSON_IN_CODE_FENCE);
    assert.equal(result.phase, 'synthesis');
    assert.ok(result.brief.includes('Where You Are'));
  });

  it('extracts brief from JSON with unescaped quotes (broken JSON)', function () {
    var result = parsePhaseResponse(BROKEN_JSON_UNESCAPED_QUOTES);
    assert.equal(result.phase, 'synthesis');
    assert.ok(result.brief, 'brief should not be empty');
    assert.ok(result.brief.includes('Where You Are'), 'brief should contain section headings');
    assert.ok(!result.brief.trimStart().startsWith('{"'), 'brief should not start with {" (raw JSON)');
  });

  it('parses a deepening response correctly', function () {
    var result = parsePhaseResponse(DEEPENING_RESPONSE);
    assert.equal(result.phase, 'deepening');
    assert.ok(result.reaction.includes('Tell me more'));
    assert.ok(result.follow_up.includes('specific projects'));
  });

  it('parses an advance response correctly', function () {
    var result = parsePhaseResponse(ADVANCE_RESPONSE);
    assert.equal(result.phase, 'advance');
    assert.equal(result.next_question_id, 'q3_a');
    assert.ok(result.transition.includes('different angle'));
  });

  it('returns advance fallback for completely unparseable text', function () {
    var result = parsePhaseResponse('Hello, this is just plain text with no JSON.');
    assert.equal(result.phase, 'advance');
    assert.ok(result.reaction.includes('Hello'));
  });

  it('normalizes escaped newlines in brief field', function () {
    var result = parsePhaseResponse(WELL_FORMED_JSON);
    assert.ok(result.brief.includes('\n'), 'brief should contain actual newlines');
    assert.ok(!result.brief.includes('\\n'), 'brief should not contain literal \\n');
  });

  it('discards reaction when phase is synthesis and brief exists', function () {
    var json = JSON.stringify({
      reaction: 'Some reaction text',
      follow_up: null,
      phase: 'synthesis',
      brief: '## Where You Are\n\nContent here.',
      pitch: null,
    });
    var result = parsePhaseResponse(json);
    assert.equal(result.reaction, null, 'reaction should be null when synthesis has brief');
    assert.ok(result.brief.includes('Where You Are'));
  });
});

// ============================================
// extractBriefValue tests
// ============================================

describe('extractBriefValue', function () {

  it('extracts brief from well-formed JSON string', function () {
    var result = extractBriefValue(WELL_FORMED_JSON);
    assert.ok(result, 'should return a value');
    assert.ok(result.includes('Where You Are'));
    assert.ok(result.includes('Your First Move'));
    assert.ok(!result.trimStart().startsWith('{"'), 'should not include JSON wrapper');
  });

  it('extracts brief from JSON with unescaped quotes', function () {
    var result = extractBriefValue(BROKEN_JSON_UNESCAPED_QUOTES);
    assert.ok(result, 'should return a value');
    assert.ok(result.includes('Where You Are'));
  });

  it('unescapes \\n to actual newlines', function () {
    var json = '{"brief": "Line 1\\nLine 2\\n\\n## Heading", "pitch": "test"}';
    var result = extractBriefValue(json);
    assert.ok(result.includes('\n'), 'should contain actual newlines');
    assert.ok(result.includes('## Heading'));
  });

  it('unescapes \\" to actual quotes', function () {
    var json = '{"brief": "She said \\"hello\\"", "pitch": "test"}';
    var result = extractBriefValue(json);
    assert.ok(result.includes('"hello"'), 'should contain unescaped quotes');
  });

  it('returns null when no brief field exists', function () {
    var result = extractBriefValue('{"reaction": "hello", "phase": "deepening"}');
    assert.equal(result, null);
  });

  it('handles brief as the last field before closing brace', function () {
    var json = '{"phase": "synthesis", "brief": "## Where You Are\\n\\nContent here."}';
    var result = extractBriefValue(json);
    assert.ok(result, 'should return a value');
    assert.ok(result.includes('Where You Are'));
  });

  it('stops at pitch field boundary', function () {
    var json = '{"brief": "The brief content", "pitch": "The pitch content"}';
    var brief = extractBriefValue(json);
    assert.ok(brief, 'should return a value');
    assert.ok(!brief.includes('pitch content'), 'should not include pitch content');
  });
});

// ============================================
// extractBriefByMarkers tests
// ============================================

describe('extractBriefByMarkers', function () {

  it('extracts brief using ## Where You Are marker', function () {
    var json = '{"brief": "## Where You Are\\n\\nContent.\\n\\n## What I See\\n\\nMore content.\\n\\n## A Direction Worth Exploring\\n\\nDirection.\\n\\n## Your First Move\\n\\nAction.", "pitch": "Pitch text"}';
    var result = extractBriefByMarkers(json);
    assert.ok(result, 'should return a result');
    assert.ok(result.brief, 'should have brief');
    assert.ok(result.brief.includes('Where You Are'));
  });

  it('extracts brief using ## Your Situation marker', function () {
    var json = '{"brief": "## Your Situation\\n\\nContent here.", "pitch": "Pitch"}';
    var result = extractBriefByMarkers(json);
    assert.ok(result, 'should return a result');
    assert.ok(result.brief.includes('Your Situation'));
  });

  it('returns null when no markers found', function () {
    var result = extractBriefByMarkers('{"brief": "No headings here", "pitch": "test"}');
    assert.equal(result, null);
  });

  it('extracts pitch when present', function () {
    var raw = '{"brief": "## Where You Are\\n\\nContent.", "pitch": "Consider the program."}';
    var result = extractBriefByMarkers(raw);
    if (result && result.pitch) {
      assert.ok(result.pitch.includes('Consider'));
    }
  });

  it('unescapes JSON string sequences in extracted brief', function () {
    var raw = '{"brief": "## Where You Are\\n\\nYou said \\"hello.\\"\\n\\n## What I See\\n\\nGood.", "pitch": null}';
    var result = extractBriefByMarkers(raw);
    assert.ok(result, 'should return a result');
    assert.ok(result.brief.includes('\n'), 'should have actual newlines');
    assert.ok(result.brief.includes('"hello."'), 'should have unescaped quotes');
  });
});

// ============================================
// fixJsonStringNewlines tests
// ============================================

describe('fixJsonStringNewlines', function () {

  it('escapes literal newlines inside JSON strings', function () {
    var input = '{"key": "line1\nline2"}';
    var result = fixJsonStringNewlines(input);
    var parsed = JSON.parse(result);
    assert.equal(parsed.key, 'line1\nline2');
  });

  it('does not affect newlines outside JSON strings', function () {
    var input = '{\n  "key": "value"\n}';
    var result = fixJsonStringNewlines(input);
    var parsed = JSON.parse(result);
    assert.equal(parsed.key, 'value');
  });

  it('handles tabs inside strings', function () {
    var input = '{"key": "col1\tcol2"}';
    var result = fixJsonStringNewlines(input);
    var parsed = JSON.parse(result);
    assert.equal(parsed.key, 'col1\tcol2');
  });

  it('preserves already-escaped sequences', function () {
    var input = '{"key": "already\\nescaped"}';
    var result = fixJsonStringNewlines(input);
    var parsed = JSON.parse(result);
    assert.equal(parsed.key, 'already\nescaped');
  });
});

// ============================================
// Integration: simulated end-to-end scenarios
// ============================================

describe('End-to-end synthesis parsing scenarios', function () {

  it('Scenario: AI returns perfectly valid JSON', function () {
    var raw = JSON.stringify({
      reaction: null, follow_up: null, phase: 'synthesis',
      brief: '## Where You Are\n\nGraduating senior in business.\n\n## What I See\n\nStrong communication.\n\n## A Direction Worth Exploring\n\nConsulting.\n\n## Your First Move\n\nApply to 3 firms.',
      pitch: 'The program helps you build strategy.',
    });
    var parsed = parsePhaseResponse(raw);
    assert.equal(parsed.phase, 'synthesis');
    assert.ok(!parsed.brief.startsWith('{'));
    assert.ok(parsed.brief.includes('Graduating senior'));
    assert.ok(parsed.brief.includes('Apply to 3 firms'));
    assert.ok(parsed.pitch.includes('strategy'));
  });

  it('Scenario: AI returns JSON with advice containing escaped double quotes', function () {
    var raw = '{"reaction": null, "follow_up": null, "phase": "synthesis", "brief": "## Where You Are\\n\\nYou are graduating.\\n\\n## What I See\\n\\nYour resume says \\"seeking opportunities\\" — replace that with \\"targeting product roles.\\"\\n\\n## A Direction Worth Exploring\\n\\nProduct management.\\n\\n## Your First Move\\n\\nRewrite your LinkedIn.", "pitch": "Consider the program."}';
    var parsed = parsePhaseResponse(raw);
    assert.equal(parsed.phase, 'synthesis');
    assert.ok(parsed.brief, 'brief should exist');
    assert.ok(!parsed.brief.trimStart().startsWith('{"'), 'brief should not be raw JSON');
  });

  it('Scenario: AI returns synthesis with literal newlines (not escaped)', function () {
    var raw = '{"phase": "synthesis", "brief": "## Where You Are\n\nSenior year.\n\n## What I See\n\nPotential.\n\n## A Direction Worth Exploring\n\nStartups.\n\n## Your First Move\n\nNetwork.", "pitch": "Join us."}';
    var parsed = parsePhaseResponse(raw);
    assert.equal(parsed.phase, 'synthesis');
    assert.ok(parsed.brief.includes('Where You Are'));
  });

  it('Scenario: AI wraps JSON in code fences', function () {
    var inner = JSON.stringify({
      phase: 'synthesis',
      brief: '## Where You Are\n\nContent.\n\n## What I See\n\nMore.\n\n## A Direction Worth Exploring\n\nDirection.\n\n## Your First Move\n\nAction.',
      pitch: 'Pitch.',
    });
    var raw = '```json\n' + inner + '\n```';
    var parsed = parsePhaseResponse(raw);
    assert.equal(parsed.phase, 'synthesis');
    assert.ok(parsed.brief.includes('Where You Are'));
  });

  it('Scenario: brief field contains all 4 expected sections', function () {
    var raw = JSON.stringify({
      phase: 'synthesis', reaction: null, follow_up: null,
      brief: '## Where You Are\n\nSection 1.\n\n## What I See\n\nSection 2.\n\n## A Direction Worth Exploring\n\nSection 3.\n\n## Your First Move\n\nSection 4.',
      pitch: 'Pitch text.',
    });
    var parsed = parsePhaseResponse(raw);
    var brief = parsed.brief;
    assert.ok(brief.includes('Where You Are'));
    assert.ok(brief.includes('What I See'));
    assert.ok(brief.includes('A Direction Worth Exploring'));
    assert.ok(brief.includes('Your First Move'));
  });

  it('Scenario: parsePhaseResponse never returns raw JSON as brief', function () {
    var inputs = [
      WELL_FORMED_JSON,
      JSON_WITH_ESCAPED_QUOTES,
      JSON_WITH_LITERAL_NEWLINES,
      JSON_IN_CODE_FENCE,
      BROKEN_JSON_UNESCAPED_QUOTES,
    ];

    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var parsed = parsePhaseResponse(input);
      if (parsed.phase === 'synthesis' && parsed.brief) {
        assert.ok(
          !parsed.brief.trimStart().startsWith('{"'),
          'brief should not be raw JSON for input #' + (i + 1)
        );
      }
    }
  });
});
