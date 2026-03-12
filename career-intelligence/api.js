/**
 * Career Discovery Form v4 — API Layer
 *
 * Features:
 * - Exponential backoff retry for failed requests
 * - Configurable timeout (longer for synthesis calls)
 * - Resilient JSON parsing with newline normalization
 */
import { CONFIG } from './config.js';

/**
 * Send the full conversation history to the AI proxy.
 * @param {string} systemPrompt - The system prompt
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @param {Object} [options] - Optional settings
 * @param {number} [options.timeout] - Request timeout in ms
 * @param {boolean} [options.isSynthesis] - Whether this is a synthesis call (enables longer timeout + retries)
 */
export async function callAI(systemPrompt, messages, options = {}) {
  const timeout = options.timeout || (options.isSynthesis ? CONFIG.synthesis_timeout_ms : 30000);
  const retryDelays = options.isSynthesis ? CONFIG.retry_delays : [];
  let lastError = null;

  // Attempt the call, with retries for synthesis
  const maxAttempts = 1 + retryDelays.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      const delay = retryDelays[attempt - 1];
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(CONFIG.api_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: messages,
          model: CONFIG.model,
          max_tokens: CONFIG.max_tokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      // Normalize content to a string — the proxy may return it as:
      // - A plain string (already good)
      // - An array of content blocks [{type: "text", text: "..."}] (Anthropic API format)
      let content = data.content;
      if (Array.isArray(content)) {
        content = content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('');
      } else if (typeof content !== 'string') {
        content = String(content);
      }
      return {
        content,
        usage: data.usage || { input_tokens: 0, output_tokens: 0 },
      };

    } catch (error) {
      lastError = error;
      // Only retry on network/timeout errors for synthesis, not on 4xx errors
      if (error.name === 'AbortError') {
        lastError = new Error('Request timed out — the server took too long to respond.');
      }
      if (attempt < maxAttempts - 1) {
        continue; // retry
      }
    }
  }

  throw lastError;
}

/**
 * Parse a JSON phase response from the AI with resilient fallback.
 * Normalizes escaped newlines in long-form fields (brief, pitch, synthesis).
 */
export function parsePhaseResponse(raw) {
  let parsed = null;

  // Attempt 1: raw parse
  try {
    const candidate = JSON.parse(raw);
    if (candidate.phase) parsed = candidate;
  } catch { /* continue */ }

  // Attempt 2: strip markdown code fences
  if (!parsed) {
    try {
      const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '');
      const candidate = JSON.parse(stripped);
      if (candidate.phase) parsed = candidate;
    } catch { /* continue */ }
  }

  // Attempt 3: regex extract JSON object
  if (!parsed) {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const candidate = JSON.parse(match[0]);
        if (candidate.phase) parsed = candidate;
      }
    } catch { /* continue */ }
  }

  // Attempt 4: fix literal newlines inside JSON string values.
  // The AI sometimes returns JSON with unescaped newlines in long-form
  // fields (brief, pitch), which makes JSON.parse fail.
  if (!parsed) {
    try {
      const fixed = fixJsonStringNewlines(raw);
      const candidate = JSON.parse(fixed);
      if (candidate.phase) parsed = candidate;
    } catch { /* continue */ }
  }

  // Attempt 5: combine fence-stripping + newline fix
  if (!parsed) {
    try {
      const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '');
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        const fixed = fixJsonStringNewlines(match[0]);
        const candidate = JSON.parse(fixed);
        if (candidate.phase) parsed = candidate;
      }
    } catch { /* continue */ }
  }

  // Attempt 6: marker-based extraction for synthesis responses with
  // unescaped quotes. The AI's specific advice (e.g. Replace "X" with "Y")
  // contains unescaped double quotes that break JSON structure. Extract
  // the brief using ## section headings as anchors instead.
  if (!parsed && typeof raw === 'string') {
    const FIRST_HEADINGS = ['## Where You Are', '## Your Situation'];
    let hasMarkers = false;
    for (const heading of FIRST_HEADINGS) {
      if (raw.includes(heading)) { hasMarkers = true; break; }
    }
    if (hasMarkers && raw.includes('"brief"')) {
      // Extract the brief content directly — never pass raw JSON through.
      const brief = extractBriefValue(raw);
      return {
        reaction: null,
        follow_up: null,
        phase: 'synthesis',
        brief: brief || raw,
        pitch: extractPitchValue(raw),
      };
    }
  }

  // Attempt 7: regex extraction of the "brief" field value from JSON-like string.
  // Even when the JSON structure is broken, we can grab the value after "brief": "
  // up to the next JSON field boundary.
  if (!parsed && typeof raw === 'string' && raw.includes('"brief"')) {
    const brief = extractBriefValue(raw);
    if (brief) {
      return {
        reaction: null,
        follow_up: null,
        phase: 'synthesis',
        brief,
        pitch: extractPitchValue(raw),
      };
    }
  }

  // Fallback: treat as advance with raw text as reaction
  if (!parsed) {
    return {
      reaction: raw.trim(),
      follow_up: null,
      phase: 'advance',
    };
  }

  // Normalize escaped newlines in long-form text fields
  normalizeNewlines(parsed, 'synthesis');
  normalizeNewlines(parsed, 'brief');
  normalizeNewlines(parsed, 'pitch');
  normalizeNewlines(parsed, 'reaction');
  normalizeNewlines(parsed, 'transition');

  // When phase is synthesis and both reaction and brief exist, discard reaction
  if (parsed.phase === 'synthesis' && parsed.brief) {
    parsed.reaction = null;
  }

  return parsed;
}

/**
 * Replace literal \n sequences (backslash + n) with actual newlines.
 * Handles both single-escaped and double-escaped variants.
 */
function normalizeNewlines(obj, key) {
  if (typeof obj[key] === 'string') {
    obj[key] = obj[key].replace(/\\n/g, '\n');
  }
}

/**
 * Extract the value of the "brief" key from a JSON-like string using regex.
 * Works even when the JSON is malformed (unescaped quotes, etc.) by finding
 * "brief": " and reading until the next JSON field boundary.
 * Returns the unescaped brief text, or null if not found.
 */
export function extractBriefValue(raw) {
  // Find "brief" : "...
  const briefKeyMatch = raw.match(/"brief"\s*:\s*"/);
  if (!briefKeyMatch) return null;

  const valueStart = briefKeyMatch.index + briefKeyMatch[0].length;

  // Find the end: look for ", "pitch": or ", "phase": or ", "reaction": etc.
  // or a closing "} at the end. We scan for these JSON field boundary patterns.
  const FIELD_BOUNDARIES = [
    /",\s*"pitch"\s*:/,
    /",\s*"phase"\s*:/,
    /",\s*"reaction"\s*:/,
    /",\s*"follow_up"\s*:/,
    /",\s*"next_question_id"\s*:/,
    /",\s*"synthesis"\s*:/,
  ];

  let end = raw.length;
  for (const boundary of FIELD_BOUNDARIES) {
    const match = raw.substring(valueStart).match(boundary);
    if (match) {
      end = Math.min(end, valueStart + match.index);
    }
  }

  // Also check for trailing "} or "\n}
  const trailingMatch = raw.substring(valueStart).match(/"\s*}\s*$/);
  if (trailingMatch) {
    end = Math.min(end, valueStart + trailingMatch.index);
  }

  let value = raw.substring(valueStart, end);
  // Unescape JSON string escapes
  value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return value.trim() || null;
}

/**
 * Extract the value of the "pitch" key from a JSON-like string using regex.
 */
function extractPitchValue(raw) {
  const pitchKeyMatch = raw.match(/"pitch"\s*:\s*"/);
  if (!pitchKeyMatch) return null;

  const valueStart = pitchKeyMatch.index + pitchKeyMatch[0].length;

  const FIELD_BOUNDARIES = [
    /",\s*"brief"\s*:/,
    /",\s*"phase"\s*:/,
    /",\s*"reaction"\s*:/,
    /",\s*"follow_up"\s*:/,
  ];

  let end = raw.length;
  for (const boundary of FIELD_BOUNDARIES) {
    const match = raw.substring(valueStart).match(boundary);
    if (match) {
      end = Math.min(end, valueStart + match.index);
    }
  }

  const trailingMatch = raw.substring(valueStart).match(/"\s*}\s*$/);
  if (trailingMatch) {
    end = Math.min(end, valueStart + trailingMatch.index);
  }

  let value = raw.substring(valueStart, end);
  value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return value.trim() || null;
}

/**
 * Fix literal (unescaped) newlines, carriage returns, and tabs inside
 * JSON string values. Walks character-by-character tracking whether
 * we're inside a quoted string, and escapes only those literals.
 */
export function fixJsonStringNewlines(str) {
  let inString = false;
  let escaped = false;
  let result = '';
  for (const ch of str) {
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
}
