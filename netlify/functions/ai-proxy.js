/**
 * AI Proxy — hardened 2026-09-04 after the API-key spend incident.
 *
 * What changed and why:
 *   - The caller no longer picks the model. Only the two course models are
 *     allowed and anything else falls back to the default. The old proxy let
 *     anyone POST { model: "claude-opus-5" } and run on the course key.
 *   - Output is capped at 2,500 tokens and input at ~60k characters, which is
 *     what the course pages actually need.
 *   - Requests must come from a course page origin. Browser fetches from
 *     other sites are refused. (A script can fake Origin, so this is a
 *     speed bump, not a lock — the spend cap on the Console workspace is
 *     the lock.)
 *   - Per-IP rate limit: 20 requests per 10 minutes. Netlify functions do not
 *     share memory between instances, so this is best-effort; it still
 *     stops a single loop from running away.
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

const ALLOWED_MODELS = {
  'claude-sonnet-4-6': 'claude-sonnet-4-6',
  'claude-sonnet-4-5-20250929': 'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5-20251001': 'claude-haiku-4-5-20251001',
};
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_OUTPUT_TOKENS = 2500;
const MAX_INPUT_CHARS = 60000;
const MAX_MESSAGES = 40;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 20;
const hits = new Map(); // ip -> [timestamps]

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

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > RATE_LIMIT;
}

function textLength(messages) {
  let n = 0;
  for (const m of messages) {
    if (typeof m.content === 'string') n += m.content.length;
    else if (Array.isArray(m.content)) {
      for (const part of m.content) if (typeof part.text === 'string') n += part.text.length;
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
  if (rateLimited(ip)) {
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
  const inputChars = textLength(messages) + (typeof system === 'string' ? system.length : 0);
  if (inputChars > MAX_INPUT_CHARS) {
    return json(413, headers, { error: 'Request too large' });
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
