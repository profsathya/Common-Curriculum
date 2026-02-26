/**
 * Career Intelligence Form — API Layer
 */
import { CONFIG } from './config.js';

/**
 * Send a prompt + student response to the AI proxy and return raw text.
 */
export async function callAI(systemPrompt, userMessage) {
  const response = await fetch(CONFIG.api_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
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
 * Parse a JSON response from Claude with a resilient fallback chain.
 * Returns { student_reaction, next_question_id, routing_rationale }.
 */
export function parseRoutingResponse(raw, defaultNextId) {
  // Attempt 1: raw parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed.student_reaction) return parsed;
  } catch { /* continue */ }

  // Attempt 2: strip markdown code fences
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '');
    const parsed = JSON.parse(stripped);
    if (parsed.student_reaction) return parsed;
  } catch { /* continue */ }

  // Attempt 3: regex extract JSON object
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.student_reaction) return parsed;
    }
  } catch { /* continue */ }

  // Fallback: use full text as reaction, default routing
  return {
    student_reaction: raw.trim(),
    next_question_id: defaultNextId,
    routing_rationale: 'Fallback — could not parse JSON from AI response.',
  };
}

/**
 * Parse Q5 response: strip INVITATION_OPTION line, return { text, invitationOption }.
 */
export function parseQ5Response(raw) {
  const lines = raw.split('\n');
  let invitationOption = 'A';

  const filtered = lines.filter(line => {
    const match = line.match(/^INVITATION_OPTION:\s*([ABC])/i);
    if (match) {
      invitationOption = match[1].toUpperCase();
      return false;
    }
    return true;
  });

  return {
    text: filtered.join('\n').trimEnd(),
    invitationOption,
  };
}
