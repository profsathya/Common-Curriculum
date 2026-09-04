/**
 * AI Proxy — hardened 2026-09-04 after the API-key spend incident.
 *
 * What changed and why:
 *   - The caller no longer picks the model. Sonnet requests go to Sonnet 5,
 *     Haiku stays Haiku, and anything else falls back to the default. The old proxy let
 *     anyone POST { model: "claude-opus-5" } and run on the course key.
 *   - Output is capped at 2,500 tokens and input at ~60k characters, which is
 *     what the course pages actually need.
 *   - Requests must come from a course page origin. Browser fetches from
 *     other sites are refused. (A script can fake Origin, so this is a
 *     speed bump, not a lock — the spend cap on the Console workspace is
 *     the lock.)
 *   - Rate limits: 200 requests per 10 minutes per IP (a classroom behind one
 *     campus IP must fit) and 600 per instance. Netlify functions do not
 *     share memory between instances, so this is best-effort; it still
 *     stops a single loop from running away.
 *   - Only text content blocks are accepted; image/document blocks are refused
 *     so the input cap cannot be bypassed with base64 payloads.
 *   - Streaming is never enabled and nothing but system/messages is forwarded.
 *
 * Environment: ANTHROPIC_API_KEY (Netlify site env var).
 * Request body: { system?, messages, model?, max_tokens? } — unchanged for pages.
 * Response: { content, usage } — unchanged.
 */

const ALLOWED_ORIGINS = [
  'https://profsathya.github.io',
  'https://ai-assisted-pedagogy.netlify.app',
  'https://csumb.instructure.com',
];

// Sathya's call 2026-09-04: students get Sonnet 5. The pages still name
// the older Sonnet models, so those names are mapped here rather than
// edited in ten files. Haiku stays Haiku (used for short classifications).
const ALLOWED_MODELS = {
  'claude-sonnet-5': 'claude-sonnet-5',
  'claude-sonnet-4-6': 'claude-sonnet-5',
  'claude-sonnet-4-5-20250929': 'claude-sonnet-5',
  'claude-haiku-4-5-20251001': 'claude-haiku-4-5-20251001',
};
const DEFAULT_MODEL = 'claude-sonnet-5';
const MAX_OUTPUT_TOKENS = 2500;
const MAX_INPUT_CHARS = 60000;
const MAX_MESSAGES = 40;

// Rate limits. A whole classroom can sit behind one campus IP, so the
// per-IP figure is sized for a class (40 students x 5 requests), not a
// person; it is a brake on runaway loops, not the lock. The lock is the
// spend cap on the Console workspace. A per-instance ceiling backs it up.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_PER_IP = 200;
const RATE_LIMIT_GLOBAL = 600;
const hits = new Map(); // ip -> [timestamps]
const allHits = [];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(statusCode, headers, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(obj) };
}

// Per-IP check runs first, before the body is parsed, so one noisy client
// is cut off cheaply. The per-instance quota is counted only for requests
// that passed validation and are about to reach Anthropic; otherwise a
// stream of malformed POSTs could fill it and lock real students out.
function ipLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > RATE_LIMIT_PER_IP;
}

function globalLimited() {
  const now = Date.now();
  while (allHits.length && now - allHits[0] >= RATE_WINDOW_MS) allHits.shift();
  if (allHits.length >= RATE_LIMIT_GLOBAL) return true;
  allHits.push(now);
  return false;
}

// The course pages send text only. Anything else (images, documents,
// tool blocks) is refused rather than measured, so the input cap cannot
// be bypassed with base64 payloads. Returns -1 for a disallowed shape.
function textLength(messages) {
  let n = 0;
  for (const m of messages) {
    if (typeof m.content === 'string') {
      n += m.content.length;
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (!part || part.type !== 'text' || typeof part.text !== 'string') return -1;
        n += part.text.length;
      }
    } else {
      return -1;
    }
  }
  return n;
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const originOk = ALLOWED_ORIGINS.includes(origin);
  const headers = corsHeaders(originOk ? origin : ALLOWED_ORIGINS[0]);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: originOk ? 204 : 403, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, headers, { error: 'Method not allowed' });
  }
  if (!originOk) {
    console.warn('Refused origin:', origin || '(none)');
    return json(403, headers, { error: 'This endpoint only serves the course pages.' });
  }

  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown').split(',')[0].trim();
  if (ipLimited(ip)) {
    console.warn('Rate limited:', ip);
    return json(429, headers, { error: 'Too many requests. Please wait a few minutes and try again.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, headers, { error: 'Server configuration error: missing API key' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '');
  } catch {
    return json(400, headers, { error: 'Invalid JSON in request body' });
  }

  const { system, messages, model, max_tokens } = body;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json(400, headers, { error: 'messages must be a non-empty array of at most ' + MAX_MESSAGES });
  }
  if (!messages.every((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content != null)) {
    return json(400, headers, { error: 'Each message needs a role of user/assistant and content' });
  }
  const msgChars = textLength(messages);
  if (msgChars < 0 || (system !== undefined && typeof system !== 'string')) {
    return json(400, headers, { error: 'Only text content is accepted' });
  }
  const inputChars = msgChars + (system ? system.length : 0);
  if (inputChars > MAX_INPUT_CHARS) {
    return json(413, headers, { error: 'Request too large' });
  }

  if (globalLimited()) {
    console.warn('Instance quota reached');
    return json(429, headers, { error: 'The AI helper is busy. Please wait a few minutes and try again.' });
  }

  const chosenModel = ALLOWED_MODELS[model] || DEFAULT_MODEL;
  const outTokens = Math.min(Number(max_tokens) || 1024, MAX_OUTPUT_TOKENS);

  try {
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: outTokens,
        messages,
        // Prompt caching: the page's system prompt is the same for every
        // student on that page, so mark it cacheable. Cached reads cost ~10%
        // of a normal input token. Below the model's minimum size the flag is
        // simply ignored, so it is safe to set unconditionally.
        ...(typeof system === 'string' && system
          ? { system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] }
          : {}),
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Anthropic API error:', apiResponse.status, errorText);
      let detail = errorText;
      try { detail = JSON.parse(errorText).error?.message || errorText; } catch {}
      return json(502, headers, { error: `AI service error (${apiResponse.status}): ${detail}` });
    }

    const data = await apiResponse.json();
    const content = data.content?.[0]?.text;
    if (!content) return json(502, headers, { error: 'Empty response from AI service' });

    console.log('ai-proxy ok', JSON.stringify({ ip, origin, model: chosenModel, usage: data.usage || null }));
    return json(200, headers, { content, usage: data.usage || null });
  } catch (error) {
    console.error('Function error:', error);
    return json(500, headers, { error: 'Internal server error' });
  }
};
