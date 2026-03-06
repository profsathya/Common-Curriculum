/**
 * Career Discovery Form v3 — UI & State Machine
 *
 * 3 stages with AI deepening, synthesis, optional synthesis reaction.
 */
import { CONFIG } from './config.js';
import { STAGE_1_QUESTION, STAGE_2_QUESTION, STAGE_3_BANK } from './questions.js';
import { SYSTEM_PROMPT } from './prompts.js';
import { callAI, parsePhaseResponse } from './api.js';
import { downloadJSON } from './data.js';

// ============================================
// Stage Metadata & Icons
// ============================================

const STAGES = [
  { num: 1, label: 'Your Situation', color: '#2c5282' },
  { num: 2, label: 'Their Perspective', color: '#6b46c1' },
  { num: 3, label: 'Your Direction', color: '#b7791f' },
];

const ICONS = {
  1: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
};

// ============================================
// State
// ============================================

const state = {
  currentStage: 1,
  followUpCount: 0,
  messages: [],
  conversation: [],
  selectedQ3: null,
  synthesisText: null,
  synthesisReaction: null,
  synthesisAdjustment: null,
  timestamps: { start: new Date().toISOString(), end: null },
  tokenUsage: { input: 0, output: 0 },
  complete: false,
};

// ============================================
// Helpers
// ============================================

function getSystemPrompt() {
  return SYSTEM_PROMPT
    .replace(/{DATES_PLACEHOLDER}/g, CONFIG.dates_placeholder)
    .replace(/{LINK_PLACEHOLDER}/g, CONFIG.link_placeholder);
}

function getStageQuestion() {
  if (state.currentStage === 1) return STAGE_1_QUESTION;
  if (state.currentStage === 2) return STAGE_2_QUESTION;
  if (state.currentStage === 3 && state.selectedQ3) return STAGE_3_BANK[state.selectedQ3].text;
  return '';
}

function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    if (line.match(/^---+\s*$/)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push('<hr>');
    } else if (line.match(/^## /)) {
      if (inList) { result.push('</ul>'); inList = false; }
      const heading = escapeHtml(line.slice(3));
      result.push(`<h2>${heading}</h2>`);
    } else if (line.match(/^- /)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      const content = escapeHtml(line.slice(2)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      let processed = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (processed.trim() === '') continue;
      result.push(`<p>${processed}</p>`);
    }
  }
  if (inList) result.push('</ul>');
  return result.join('\n');
}

// ============================================
// Progress Bar
// ============================================

function renderProgressBar() {
  const bar = el('div', 'ci-progress');
  bar.id = 'ci-progress';

  const track = el('div', 'ci-progress__track');

  STAGES.forEach((stage, i) => {
    const stepEl = el('div', 'ci-progress__step ci-progress__step--upcoming');
    stepEl.dataset.step = stage.num;
    stepEl.innerHTML = `
      <div class="ci-progress__dot" style="--step-color: ${stage.color}">
        <span class="ci-progress__icon">${ICONS[stage.num]}</span>
        <span class="ci-progress__check">${ICONS.check}</span>
      </div>
      <div class="ci-progress__label">${stage.label}</div>
    `;
    track.appendChild(stepEl);

    if (i < STAGES.length - 1) {
      track.appendChild(el('div', 'ci-progress__connector'));
    }
  });

  bar.appendChild(track);

  const form = document.getElementById('ci-form');
  form.parentNode.insertBefore(bar, form);
}

function updateProgress(activeStage) {
  document.querySelectorAll('.ci-progress__step').forEach(stepEl => {
    const num = parseInt(stepEl.dataset.step);
    stepEl.classList.remove(
      'ci-progress__step--done',
      'ci-progress__step--active',
      'ci-progress__step--upcoming'
    );
    if (num < activeStage) {
      stepEl.classList.add('ci-progress__step--done');
    } else if (num === activeStage) {
      stepEl.classList.add('ci-progress__step--active');
    } else {
      stepEl.classList.add('ci-progress__step--upcoming');
    }
  });

  document.querySelectorAll('.ci-progress__connector').forEach((conn, i) => {
    conn.classList.toggle('ci-progress__connector--done', i < activeStage - 1);
  });
}

// ============================================
// UI Rendering
// ============================================

function getForm() {
  return document.getElementById('ci-form');
}

function getActiveStageEl() {
  return document.querySelector('.ci-stage--active');
}

function renderStageStart(stageNum, questionText) {
  // Mark previous stage as done
  const prev = getActiveStageEl();
  if (prev) {
    prev.classList.remove('ci-stage--active');
    prev.classList.add('ci-stage--done');
  }

  const meta = STAGES[stageNum - 1];

  const stage = el('div', 'ci-stage ci-stage--active');
  stage.dataset.stage = stageNum;
  stage.style.setProperty('--step-color', meta.color);

  // Stage header
  const header = el('div', 'ci-stage-header');
  header.innerHTML = `
    <span class="ci-stage-header__icon">${ICONS[stageNum]}</span>
    <span class="ci-stage-header__num">Stage ${stageNum}</span>
    <span class="ci-stage-header__title">${meta.label}</span>
  `;
  stage.appendChild(header);

  // Question card
  const qCard = el('div', 'ci-question');
  qCard.innerHTML = `<p>${escapeHtml(questionText)}</p>`;
  stage.appendChild(qCard);

  getForm().appendChild(stage);

  // Input area
  appendInputArea(stage);

  // Update progress
  updateProgress(stageNum);

  // Scroll to stage
  stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function appendInputArea(container) {
  // Remove any existing input area in this container
  const existing = container.querySelector('.ci-input-area');
  if (existing) existing.remove();

  const area = el('div', 'ci-input-area');

  const textarea = document.createElement('textarea');
  textarea.className = 'ci-textarea';
  textarea.placeholder = CONFIG.placeholder_text;
  textarea.rows = 5;
  area.appendChild(textarea);

  const btnRow = el('div', 'ci-btn-row');

  const submitBtn = el('button', 'ci-submit', 'Submit');
  submitBtn.disabled = true;
  btnRow.appendChild(submitBtn);

  // Skip button after 2 follow-ups
  if (state.followUpCount >= 2) {
    const skipBtn = el('button', 'ci-skip', 'Continue to next stage');
    skipBtn.addEventListener('click', () => handleSkip());
    btnRow.appendChild(skipBtn);
  }

  area.appendChild(btnRow);
  container.appendChild(area);

  // Enable submit when content is long enough
  textarea.addEventListener('input', () => {
    submitBtn.disabled = textarea.value.trim().length < 20;
  });

  submitBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (text.length < 20) return;
    handleSubmit(text, area);
  });

  setTimeout(() => textarea.focus(), 300);
}

function renderStudentBubble(container, text) {
  const bubble = el('div', 'ci-student-response');
  bubble.innerHTML = `<p>${escapeHtml(text)}</p>`;
  container.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('ci-student-response--visible'));
  return bubble;
}

function renderAIBubble(container, reaction, followUp) {
  const bubble = el('div', 'ci-reaction');
  let html = `<p>${escapeHtml(reaction)}</p>`;
  if (followUp) {
    html += `<p class="ci-follow-up">${escapeHtml(followUp)}</p>`;
  }
  bubble.innerHTML = html;
  container.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('ci-reaction--visible'));
}

function showLoading(container) {
  const loading = el('div', 'ci-loading');
  loading.innerHTML = '<span class="ci-loading__dot"></span><span class="ci-loading__dot"></span><span class="ci-loading__dot"></span>';
  container.appendChild(loading);
  return loading;
}

function showError(container, message, onRetry) {
  const errorEl = el('div', 'ci-error');
  errorEl.innerHTML = `
    <p><strong>Something went wrong.</strong> ${escapeHtml(message)}</p>
    <button class="ci-error__retry">Try again</button>
  `;
  container.appendChild(errorEl);

  errorEl.querySelector('.ci-error__retry').addEventListener('click', () => {
    errorEl.remove();
    if (onRetry) onRetry();
  });
}

// ============================================
// Submit Handler
// ============================================

async function handleSubmit(text, inputArea) {
  const stageEl = getActiveStageEl();
  const stage = state.currentStage;
  const timestamp = new Date().toISOString();

  // Disable input
  const textarea = inputArea.querySelector('.ci-textarea');
  const submitBtn = inputArea.querySelector('.ci-submit');
  textarea.disabled = true;
  submitBtn.disabled = true;

  // Replace input area with student bubble
  inputArea.remove();
  const bubble = renderStudentBubble(stageEl, text);

  // Build context-labeled message for AI
  const questionText = getStageQuestion();
  let contextLabel;
  if (state.followUpCount === 0) {
    contextLabel = `[Stage ${stage} | Response 1 | Question: "${questionText}"]`;
  } else {
    const lastAI = [...state.conversation].reverse().find(
      e => e.role === 'ai' && e.stage === stage
    );
    const fq = lastAI?.follow_up || questionText;
    contextLabel = `[Stage ${stage} | Follow-up ${state.followUpCount} response | Question: "${fq}"]`;
  }

  const userMessage = `${contextLabel}\n${text}`;
  state.messages.push({ role: 'user', content: userMessage });
  state.conversation.push({
    role: 'student',
    content: text,
    stage: stage,
    timestamp: timestamp,
  });

  // Show loading
  const loading = showLoading(stageEl);

  try {
    const result = await callAI(getSystemPrompt(), state.messages);

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();
    processAIResponse(parsed, stageEl);

  } catch (error) {
    loading.remove();
    // Roll back state
    state.messages.pop();
    state.conversation.pop();
    bubble.remove();

    showError(stageEl, error.message, () => {
      appendInputArea(stageEl);
      const newTextarea = stageEl.querySelector('.ci-textarea');
      if (newTextarea) newTextarea.value = text;
    });
  }
}

// ============================================
// AI Response Processing
// ============================================

function processAIResponse(parsed, stageEl) {
  const stage = state.currentStage;

  if (parsed.phase === 'deepening') {
    state.conversation.push({
      role: 'ai',
      content: parsed.reaction + (parsed.follow_up ? '\n\n' + parsed.follow_up : ''),
      stage: stage,
      phase: 'deepening',
      reaction: parsed.reaction,
      follow_up: parsed.follow_up,
    });

    state.followUpCount++;
    renderAIBubble(stageEl, parsed.reaction, parsed.follow_up);
    appendInputArea(stageEl);

  } else if (parsed.phase === 'advance') {
    state.conversation.push({
      role: 'ai',
      content: parsed.reaction || '',
      stage: stage,
      phase: 'advance',
      reaction: parsed.reaction || '',
      follow_up: null,
      next_question_id: parsed.next_question_id || null,
    });

    if (parsed.reaction) {
      renderAIBubble(stageEl, parsed.reaction, null);
    }

    advanceFromStage(stage, parsed.next_question_id);

  } else if (parsed.phase === 'synthesis') {
    state.synthesisText = parsed.synthesis;
    state.currentStage = 'synthesis';

    state.conversation.push({
      role: 'ai',
      content: parsed.synthesis,
      stage: 'synthesis',
      phase: 'synthesis',
    });

    // Mark stage 3 as done
    stageEl.classList.remove('ci-stage--active');
    stageEl.classList.add('ci-stage--done');
    updateProgress(4); // all 3 done

    renderSynthesis(parsed.synthesis);

  } else if (parsed.phase === 'synthesis_adjusted') {
    state.synthesisAdjustment = parsed.reaction;

    state.conversation.push({
      role: 'ai',
      content: parsed.reaction,
      stage: 'synthesis',
      phase: 'synthesis_adjusted',
    });

    renderSynthesisAdjustment(parsed.reaction);
    showCompletionActions();
  }
}

function advanceFromStage(stage, nextQuestionId) {
  if (stage === 1) {
    state.currentStage = 2;
    state.followUpCount = 0;
    renderStageStart(2, STAGE_2_QUESTION);
  } else if (stage === 2) {
    state.selectedQ3 = nextQuestionId || 'q3_e';
    state.currentStage = 3;
    state.followUpCount = 0;
    const q3 = STAGE_3_BANK[state.selectedQ3];
    renderStageStart(3, q3 ? q3.text : '');
  } else if (stage === 3) {
    // AI gave advance instead of synthesis — request synthesis separately
    requestSynthesis();
  }
}

async function requestSynthesis() {
  state.currentStage = 'synthesis';
  updateProgress(4);

  const stageEl = getActiveStageEl();
  if (stageEl) {
    stageEl.classList.remove('ci-stage--active');
    stageEl.classList.add('ci-stage--done');
  }

  state.messages.push({
    role: 'user',
    content: '[All stages complete — generate synthesis]',
  });

  const form = getForm();
  const loading = showLoading(form);

  try {
    const result = await callAI(getSystemPrompt(), state.messages);

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();

    state.synthesisText = parsed.synthesis || parsed.reaction || result.content;
    state.conversation.push({
      role: 'ai',
      content: state.synthesisText,
      stage: 'synthesis',
      phase: 'synthesis',
    });

    renderSynthesis(state.synthesisText);

  } catch (error) {
    loading.remove();
    showError(form, error.message, () => requestSynthesis());
  }
}

// ============================================
// Skip Handler
// ============================================

async function handleSkip() {
  const stage = state.currentStage;
  const stageEl = getActiveStageEl();

  // Remove input area
  const inputArea = stageEl.querySelector('.ci-input-area');
  if (inputArea) inputArea.remove();

  const skipMessage = `[Stage ${stage} | Student chose to continue to next stage]`;
  state.messages.push({ role: 'user', content: skipMessage });
  state.conversation.push({
    role: 'student',
    content: '[Continued to next stage]',
    stage: stage,
    timestamp: new Date().toISOString(),
    skipped: true,
  });

  // Stage 1: advance directly without AI call
  if (stage === 1) {
    state.currentStage = 2;
    state.followUpCount = 0;
    renderStageStart(2, STAGE_2_QUESTION);
    return;
  }

  // Stages 2 and 3: need AI call (for q3 selection or synthesis)
  const loading = showLoading(stageEl);

  try {
    const result = await callAI(getSystemPrompt(), state.messages);

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();
    processAIResponse(parsed, stageEl);

  } catch (error) {
    loading.remove();
    // Roll back skip
    state.messages.pop();
    state.conversation.pop();

    showError(stageEl, error.message, () => {
      appendInputArea(stageEl);
    });
  }
}

// ============================================
// Synthesis
// ============================================

function renderSynthesis(synthesisMarkdown) {
  const form = getForm();
  const section = el('div', 'ci-synthesis-section');

  // Deliverable card
  const card = el('div', 'ci-deliverable');
  let html = renderMarkdown(synthesisMarkdown);
  html = postProcessSynthesisHtml(html);
  card.innerHTML = html;
  section.appendChild(card);

  requestAnimationFrame(() => card.classList.add('ci-deliverable--visible'));

  form.appendChild(section);

  // Synthesis reaction area
  renderSynthesisReactionArea(section);

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function postProcessSynthesisHtml(html) {
  // Add accent styling to "good fit" line
  html = html.replace(
    /(<p>)(This might be a good fit if:)/,
    '$1<span class="ci-fit-positive">$2</span>'
  );
  // Add muted styling to "NOT" line
  html = html.replace(
    /(<p>)(This is probably NOT the best use of your time if:)/,
    '$1<span class="ci-fit-negative">$2</span>'
  );
  return html;
}

function renderSynthesisReactionArea(container) {
  const area = el('div', 'ci-synthesis-reaction');
  area.innerHTML = `
    <p class="ci-synthesis-reaction__prompt">Does anything here surprise you or feel off? Tell me what — I'll adjust. If it looks right, you can skip to the summary.</p>
  `;

  const textarea = document.createElement('textarea');
  textarea.className = 'ci-textarea';
  textarea.placeholder = 'Tell me what surprised you or felt off...';
  textarea.rows = 3;
  area.appendChild(textarea);

  const btnRow = el('div', 'ci-btn-row');

  const submitBtn = el('button', 'ci-submit', 'Submit');
  submitBtn.disabled = true;
  btnRow.appendChild(submitBtn);

  const skipBtn = el('button', 'ci-skip', 'Looks good \u2014 show me the summary');
  btnRow.appendChild(skipBtn);

  area.appendChild(btnRow);
  container.appendChild(area);

  textarea.addEventListener('input', () => {
    submitBtn.disabled = textarea.value.trim().length < 5;
  });

  submitBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (text.length < 5) return;

    textarea.disabled = true;
    submitBtn.disabled = true;
    skipBtn.disabled = true;

    state.synthesisReaction = text;

    state.messages.push({
      role: 'user',
      content: `[Synthesis reaction]\nStudent's response: "${text}"`,
    });
    state.conversation.push({
      role: 'student',
      content: text,
      stage: 'synthesis',
      timestamp: new Date().toISOString(),
    });

    // Replace buttons with student bubble + loading
    btnRow.remove();
    textarea.style.display = 'none';
    const prompt = area.querySelector('.ci-synthesis-reaction__prompt');
    if (prompt) prompt.style.display = 'none';

    renderStudentBubble(area, text);
    const loading = showLoading(area);

    try {
      const result = await callAI(getSystemPrompt(), state.messages);

      state.tokenUsage.input += result.usage.input_tokens || 0;
      state.tokenUsage.output += result.usage.output_tokens || 0;

      const parsed = parsePhaseResponse(result.content);
      state.messages.push({ role: 'assistant', content: result.content });

      loading.remove();

      state.synthesisAdjustment = parsed.reaction || result.content;
      state.conversation.push({
        role: 'ai',
        content: state.synthesisAdjustment,
        stage: 'synthesis',
        phase: 'synthesis_adjusted',
      });

      renderSynthesisAdjustment(state.synthesisAdjustment);
      showCompletionActions();

    } catch (error) {
      loading.remove();
      showError(area, error.message);
      // Show completion actions even on error
      showCompletionActions();
    }
  });

  skipBtn.addEventListener('click', () => {
    area.remove();
    state.synthesisReaction = null;
    state.synthesisAdjustment = null;
    showCompletionActions();
  });
}

function renderSynthesisAdjustment(adjustmentText) {
  const section = document.querySelector('.ci-synthesis-section');
  const adj = el('div', 'ci-adjustment');
  adj.innerHTML = `<p>${escapeHtml(adjustmentText)}</p>`;
  section.appendChild(adj);
  requestAnimationFrame(() => adj.classList.add('ci-adjustment--visible'));
}

function showCompletionActions() {
  state.timestamps.end = new Date().toISOString();
  state.currentStage = 'complete';
  state.complete = true;

  const section = document.querySelector('.ci-synthesis-section');
  const actions = el('div', 'ci-actions');

  const downloadBtn = el('button', 'ci-actions__download', 'Download session (JSON)');
  downloadBtn.addEventListener('click', () => downloadJSON(state));
  actions.appendChild(downloadBtn);

  section.appendChild(actions);
  actions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// Initialize
// ============================================

export function init() {
  renderProgressBar();
  renderStageStart(1, STAGE_1_QUESTION);
}
