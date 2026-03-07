/**
 * Career Discovery Form v4 — Configuration
 */
export const CONFIG = {
  api_endpoint: 'https://ai-assisted-pedagogy.netlify.app/.netlify/functions/ai-proxy',
  form_version: '4.1',
  model: 'claude-sonnet-4-6',
  max_tokens: 2500,
  synthesis_timeout_ms: 45000,
  retry_delays: [2000, 4000, 8000],
  dates_placeholder: '[DATES TBD]',
  link_placeholder: '[LINK TBD]',
  placeholder_text: 'Take your time — the more specific you are, the more useful the response will be.',
};

export const PROGRAM_CONFIG = {
  program_name: 'Career Intelligence',
  dates: 'Summer 2026 (exact dates TBD)',
  session_times: 'Two 90-minute sessions',
  description: [
    'Career Intelligence is a program designed for graduating seniors who want to go beyond the standard job search.',
    '',
    'Over two focused sessions, you\'ll work through:',
    '• Strategic market mapping — understanding where your skills meet real demand',
    '• Value proposition development — articulating what makes you distinct, not just qualified',
    '• An experimental approach to your search — testing directions instead of guessing',
    '',
    'The program builds on the kind of self-assessment you just completed, going deeper with structured exercises and peer feedback.',
  ].join('\n'),
  google_form_url: 'https://forms.gle/QduKtjX7fhLi8nuC9',
};
