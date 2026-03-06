/**
 * Career Discovery Form v3 — Data Export Utilities
 */
import { CONFIG } from './config.js';
import { STAGE_1_QUESTION, STAGE_2_QUESTION, STAGE_3_BANK } from './questions.js';

/**
 * Build the full export JSON from form state.
 */
export function buildExportData(state) {
  // Group conversation entries by stage
  const stageEntries = { 1: [], 2: [], 3: [] };
  for (const entry of state.conversation) {
    const s = entry.stage;
    if (s >= 1 && s <= 3) {
      stageEntries[s].push(entry);
    }
  }

  function formatExchanges(entries) {
    return entries.map(e => {
      if (e.role === 'student') {
        const obj = { role: 'student', content: e.content, timestamp: e.timestamp };
        if (e.skipped) obj.skipped = true;
        return obj;
      }
      return {
        role: 'ai',
        reaction: e.reaction || '',
        follow_up: e.follow_up || null,
        phase: e.phase,
      };
    });
  }

  const q3 = state.selectedQ3 ? STAGE_3_BANK[state.selectedQ3] : null;

  return {
    timestamp_start: state.timestamps.start,
    timestamp_end: state.timestamps.end,
    duration_seconds: state.timestamps.start && state.timestamps.end
      ? Math.round((new Date(state.timestamps.end) - new Date(state.timestamps.start)) / 1000)
      : null,
    stages: {
      stage_1: {
        question: STAGE_1_QUESTION,
        exchanges: formatExchanges(stageEntries[1]),
      },
      stage_2: {
        question: STAGE_2_QUESTION,
        exchanges: formatExchanges(stageEntries[2]),
      },
      stage_3: {
        question_id: state.selectedQ3,
        question: q3 ? q3.text : '',
        exchanges: formatExchanges(stageEntries[3]),
      },
    },
    synthesis: state.synthesisText,
    synthesis_reaction: {
      student_response: state.synthesisReaction || null,
      ai_adjustment: state.synthesisAdjustment || null,
      skipped: !state.synthesisReaction,
    },
    metadata: {
      form_version: CONFIG.form_version,
      model_used: CONFIG.model,
      total_input_tokens: state.tokenUsage.input,
      total_output_tokens: state.tokenUsage.output,
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
  a.download = `career-discovery-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
