/**
 * Career Discovery Form v4 — Configuration
 */
export const CONFIG = {
  api_endpoint: 'https://ai-assisted-pedagogy.netlify.app/.netlify/functions/ai-proxy',
  form_version: '4.0',
  model: 'claude-sonnet-4-6',
  max_tokens: 2500,
  synthesis_timeout_ms: 45000,
  retry_delays: [2000, 4000, 8000],
  dates_placeholder: '[DATES TBD]',
  link_placeholder: '[LINK TBD]',
  placeholder_text: 'Take your time — the more specific you are, the more useful the response will be.',
};
