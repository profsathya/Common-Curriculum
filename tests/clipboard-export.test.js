/**
 * Activity Engine — clipboard export smoke test
 *
 * Stubs navigator.clipboard.writeText and exercises the exposed
 * ActivityEngine._copyMarkdownToClipboard() helper that handleDownload()
 * calls after gating passes.
 */

const { test } = require('node:test');
const assert = require('node:assert');

// Node 21+ exposes a built-in `navigator` that can't be replaced via assignment,
// but individual properties are writable. Patch `navigator.clipboard` directly.
function ensureNavigator() {
  if (typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {};
  }
}

test('ActivityEngine._copyMarkdownToClipboard writes markdown to the clipboard', async () => {
  ensureNavigator();
  const calls = [];
  const originalClipboard = globalThis.navigator.clipboard;
  globalThis.navigator.clipboard = {
    writeText: (text) => {
      calls.push(text);
      return Promise.resolve();
    }
  };

  delete require.cache[require.resolve('../js/activity-engine.js')];
  const ActivityEngine = require('../js/activity-engine.js');

  const studentMarkdown =
    '# Goal Statement\n\n**Student:** Jane Doe\n\nMy Sprint 4 goal is to extend the MDRO decontamination retry layer...';

  try {
    await ActivityEngine._copyMarkdownToClipboard(studentMarkdown);

    assert.strictEqual(calls.length, 1, 'writeText should be called exactly once');
    assert.strictEqual(calls[0], studentMarkdown, 'writeText should receive the exact markdown string');
    assert.ok(calls[0].includes('Jane Doe'), 'clipboard payload should contain student identifiers');
    assert.ok(calls[0].includes('Sprint 4 goal'), 'clipboard payload should contain the student response body');
  } finally {
    globalThis.navigator.clipboard = originalClipboard;
  }
});

test('ActivityEngine._copyMarkdownToClipboard rejects when Clipboard API is unavailable', async () => {
  ensureNavigator();
  const originalClipboard = globalThis.navigator.clipboard;
  globalThis.navigator.clipboard = undefined;

  delete require.cache[require.resolve('../js/activity-engine.js')];
  const ActivityEngine = require('../js/activity-engine.js');

  try {
    await assert.rejects(
      () => ActivityEngine._copyMarkdownToClipboard('anything'),
      /Clipboard API unavailable/
    );
  } finally {
    globalThis.navigator.clipboard = originalClipboard;
  }
});

test('ActivityEngine._copyMarkdownToClipboard propagates writeText rejection (so handleDownload can take the fallback branch)', async () => {
  ensureNavigator();
  const originalClipboard = globalThis.navigator.clipboard;
  const failure = new Error('NotAllowedError: clipboard write blocked');
  globalThis.navigator.clipboard = {
    writeText: () => Promise.reject(failure)
  };

  delete require.cache[require.resolve('../js/activity-engine.js')];
  const ActivityEngine = require('../js/activity-engine.js');

  try {
    await assert.rejects(
      () => ActivityEngine._copyMarkdownToClipboard('some markdown'),
      /clipboard write blocked/
    );
  } finally {
    globalThis.navigator.clipboard = originalClipboard;
  }
});

test('ActivityEngine._exportPayloadForMode returns formatted JSON for json mode', () => {
  delete require.cache[require.resolve('../js/activity-engine.js')];
  const ActivityEngine = require('../js/activity-engine.js');

  const exportData = {
    activityId: 'deanza-course1-ai-discussion',
    studentName: 'Jane Doe',
    responses: [
      {
        questionId: 'q1',
        questionType: 'ai-discussion',
        answer: { discussionSummary: 'Specific stakeholder evidence.' }
      }
    ],
    markdown: '# Human readable response'
  };

  const payload = ActivityEngine._exportPayloadForMode(exportData, 'json');
  const parsed = JSON.parse(payload);

  assert.strictEqual(parsed.activityId, 'deanza-course1-ai-discussion');
  assert.strictEqual(parsed.studentName, 'Jane Doe');
  assert.ok(payload.includes('\n  "responses": ['));
  assert.ok(!payload.startsWith('# Human readable response'));
});

test('ActivityEngine._exportPayloadForMode keeps markdown as the default mode', () => {
  delete require.cache[require.resolve('../js/activity-engine.js')];
  const ActivityEngine = require('../js/activity-engine.js');

  const exportData = {
    activityId: 'deanza-course1-native-copy',
    markdown: '# Human readable response'
  };

  assert.strictEqual(
    ActivityEngine._exportPayloadForMode(exportData, 'markdown'),
    '# Human readable response'
  );
});
