/**
 * Career Intelligence Form — Data Export Utilities
 */
import { QUESTIONS } from './questions.js';
import { CONFIG } from './config.js';

/**
 * Build the full export JSON from form state.
 */
export function buildExportData(state) {
  const conversation = [];

  for (let step = 1; step <= 5; step++) {
    const key = `q${step}`;
    if (!state.responses[key]) continue;

    const questionId = step <= 3
      ? state.selectedQuestions[key]
      : null;

    const entry = {
      step,
      question_id: questionId,
      question_text: questionId && QUESTIONS[questionId]
        ? QUESTIONS[questionId].text
        : (step === 4 ? '(Prompted by Q3 reaction)' : '(Prompted by Q4 synthesis)'),
      student_response: state.responses[key],
      ai_reaction: state.aiReactions[key] || '',
      timestamp: state.timestamps[`${key}_submit`] || null,
    };

    if (step <= 2) {
      entry.routing = {
        next_question_id: state.selectedQuestions[`q${step + 1}`] || null,
        rationale: state.routingRationales[`q${step + 1}`] || '',
      };
    }

    conversation.push(entry);
  }

  return {
    timestamp_start: state.timestamps.start || null,
    timestamp_end: state.timestamps.end || null,
    duration_seconds: state.timestamps.start && state.timestamps.end
      ? Math.round((new Date(state.timestamps.end) - new Date(state.timestamps.start)) / 1000)
      : null,
    path_taken: {
      q1: state.selectedQuestions.q1,
      q2: state.selectedQuestions.q2,
      q3: state.selectedQuestions.q3,
    },
    conversation,
    invitation_option: state.invitationOption,
    metadata: {
      form_version: CONFIG.form_version,
      model_used: CONFIG.model,
      total_input_tokens: state.tokenUsage?.input || 0,
      total_output_tokens: state.tokenUsage?.output || 0,
    },
  };
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Download state as JSON file.
 */
export function downloadJSON(state) {
  const data = buildExportData(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `career-intelligence-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
