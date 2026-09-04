/**
 * Generic AI Proxy
 *
 * Thin Netlify serverless function that proxies requests to the Anthropic
 * Claude API. All prompt logic lives client-side — this function only
 * handles authentication, forwarding, and CORS.
 *
 * Environment Variables Required:
 *   ANTHROPIC_API_KEY - Anthropic API key
 *
 * Request Body:
 *   {
 *     "system": "System prompt text",
 *     "messages": [{ "role": "user", "content": "..." }],
 *     "model": "claude-haiku-4-5-20251001",   // optional, defaults to haiku
 *     "max_tokens": 1024                       // optional, defaults to 1024
 *   }
 *
 * Returns:
 *   {
 *     "content": "Raw text response from Claude",
 *     "usage": { "input_tokens": 0, "output_tokens": 0 }
 *   }
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Server configuration error: missing API key' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { system, messages, model, max_tokens } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing required field: messages (non-empty array)' }),
    };
  }

  try {
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(max_tokens || 1024, 4096),
        messages: messages,
        ...(system ? { system } : {}),
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Anthropic API error:', apiResponse.status, errorText);

      // Parse Anthropic error for a user-useful message
      let detail = '';
      try {
        const errJson = JSON.parse(errorText);
        detail = errJson.error?.message || errorText;
      } catch {
        detail = errorText;
      }

      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: `AI service error (${apiResponse.status}): ${detail}`,
        }),
      };
    }

    const data = await apiResponse.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Empty response from AI service' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({
        content: content,
        usage: data.usage || null,
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
