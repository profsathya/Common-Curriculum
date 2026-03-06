/**
 * Career Discovery Form v3 — API Layer
 */
import { CONFIG } from './config.js';

/**
 * Send the full conversation history to the AI proxy.
 * @param {string} systemPrompt - The system prompt
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 */
export async function callAI(systemPrompt, messages) {
  const response = await fetch(CONFIG.api_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      messages: messages,
      model: CONFIG.model,
      max_tokens: CONFIG.max_tokens,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return {
    content: data.content,
    usage: data.usage || { input_tokens: 0, output_tokens: 0 },
  };
}

/**
 * Parse a JSON phase response from the AI with resilient fallback.
 * Returns { reaction, follow_up, phase, next_question_id?, synthesis? }
 */
export function parsePhaseResponse(raw) {
  // Attempt 1: raw parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed.phase) return parsed;
  } catch { /* continue */ }

  // Attempt 2: strip markdown code fences
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '');
    const parsed = JSON.parse(stripped);
    if (parsed.phase) return parsed;
  } catch { /* continue */ }

  // Attempt 3: regex extract JSON object
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.phase) return parsed;
    }
  } catch { /* continue */ }

  // Fallback: treat as advance with raw text as reaction
  return {
    reaction: raw.trim(),
    follow_up: null,
    phase: 'advance',
  };
}
