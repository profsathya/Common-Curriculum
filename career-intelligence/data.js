/**
 * Career Discovery Form v4 — Data Export Utilities
 */
import { CONFIG } from './config.js';
import { STAGE_1_FRAME, STAGE_1_QUESTION, STAGE_2_QUESTION, STAGE_3_BANK } from './questions.js';

/**
 * Build the full export JSON from form state.
 */
export function buildExportData(state) {
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
      const obj = {
        role: 'ai',
        reaction: e.reaction || '',
        follow_up: e.follow_up || null,
        phase: e.phase,
      };
      if (e.transition) obj.transition = e.transition;
      return obj;
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
        frame: STAGE_1_FRAME,
        question: STAGE_1_QUESTION,
        exchanges: formatExchanges(stageEntries[1]),
      },
      stage_2: {
        question: STAGE_2_QUESTION,
        transition_in: state.transitions.s1_to_s2 || null,
        exchanges: formatExchanges(stageEntries[2]),
      },
      stage_3: {
        question_id: state.selectedQ3,
        question: q3 ? q3.text : '',
        transition_in: state.transitions.s2_to_s3 || null,
        exchanges: formatExchanges(stageEntries[3]),
      },
    },
    brief: state.briefText,
    pitch: state.pitchText,
    synthesis_reaction: {
      student_response: state.synthesisReaction || null,
      ai_adjustment: state.synthesisAdjustment || null,
      skipped: !state.synthesisReaction,
    },
    tracking: state.tracking || [],
    metadata: {
      form_version: CONFIG.form_version,
      model_used: CONFIG.model,
      total_input_tokens: state.tokenUsage.input,
      total_output_tokens: state.tokenUsage.output,
    },
  };
}

/**
 * Generate formatted plain-text brief for clipboard copy.
 * Includes 3-stage conversation summaries + 4-section synthesis.
 */
export function generateBriefText(state) {
  const lines = [];
  lines.push('CAREER INTELLIGENCE BRIEF');
  lines.push('========================');
  lines.push('');

  // Stage conversations
  const stageLabels = {
    1: 'Stage 1: Your Situation',
    2: 'Stage 2: Their Perspective',
    3: 'Stage 3: Your Direction',
  };

  for (let s = 1; s <= 3; s++) {
    const entries = state.conversation.filter(e => e.stage === s);
    if (entries.length === 0) continue;

    lines.push(stageLabels[s]);
    lines.push('-'.repeat(stageLabels[s].length));

    for (const entry of entries) {
      if (entry.role === 'student') {
        if (entry.skipped) {
          lines.push('[Continued to next stage]');
        } else {
          lines.push('');
          lines.push('You: ' + entry.content);
        }
      } else if (entry.role === 'ai' && entry.reaction) {
        lines.push('');
        lines.push(entry.reaction);
        if (entry.follow_up) {
          lines.push('');
          lines.push(entry.follow_up);
        }
      }
    }
    lines.push('');
    lines.push('');
  }

  // Synthesis brief
  if (state.briefText) {
    lines.push('YOUR CAREER INTELLIGENCE BRIEF');
    lines.push('==============================');
    lines.push('');
    // Strip markdown headers (## -> plain text with underline)
    const briefLines = state.briefText.split('\n');
    for (const line of briefLines) {
      if (line.match(/^#{1,3}\s/)) {
        const title = line.replace(/^#{1,3}\s+/, '').trim();
        lines.push(title);
        lines.push('-'.repeat(title.length));
      } else if (line.match(/^---+\s*$/)) {
        // skip separators
      } else {
        // Strip bold markdown
        lines.push(line.replace(/\*\*(.+?)\*\*/g, '$1'));
      }
    }
    lines.push('');
  }

  // Synthesis reaction/adjustment
  if (state.synthesisReaction) {
    lines.push('Your feedback: ' + state.synthesisReaction);
    if (state.synthesisAdjustment) {
      lines.push('');
      lines.push('Adjustment: ' + state.synthesisAdjustment);
    }
    lines.push('');
  }

  // Pitch
  if (state.pitchText) {
    lines.push('');
    lines.push(state.pitchText.replace(/\*\*(.+?)\*\*/g, '$1'));
  }

  return lines.join('\n').trim();
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
