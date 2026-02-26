/**
 * Career Intelligence Form — UI & State Machine
 */
import { CONFIG } from './config.js';
import { QUESTIONS } from './questions.js';
import { PROMPTS } from './prompts.js';
import { callAI, parseRoutingResponse, parseQ5Response } from './api.js';
import { copyToClipboard, downloadJSON } from './data.js';

// ============================================
// State
// ============================================

const state = {
  currentStep: 1,
  responses: {},
  aiReactions: {},
  selectedQuestions: { q1: 'q1_situation', q2: null, q3: null },
  routingRationales: {},
  timestamps: { start: new Date().toISOString() },
  invitationOption: null,
  tokenUsage: { input: 0, output: 0 },
  complete: false,
};

// ============================================
// Prompt Builder
// ============================================

function getQuestionText(questionId) {
  return questionId && QUESTIONS[questionId] ? QUESTIONS[questionId].text : '';
}

function buildPrompt(template) {
  return template
    .replace(/{q1_response}/g, state.responses.q1 || '')
    .replace(/{q1_ai_reaction}/g, state.aiReactions.q1 || '')
    .replace(/{q2_response}/g, state.responses.q2 || '')
    .replace(/{q2_ai_reaction}/g, state.aiReactions.q2 || '')
    .replace(/{q2_question_text}/g, getQuestionText(state.selectedQuestions.q2))
    .replace(/{q2_question_id}/g, state.selectedQuestions.q2 || '')
    .replace(/{q3_response}/g, state.responses.q3 || '')
    .replace(/{q3_ai_reaction}/g, state.aiReactions.q3 || '')
    .replace(/{q3_question_text}/g, getQuestionText(state.selectedQuestions.q3))
    .replace(/{q3_question_id}/g, state.selectedQuestions.q3 || '')
    .replace(/{q4_response}/g, state.responses.q4 || '')
    .replace(/{q4_ai_reaction}/g, state.aiReactions.q4 || '')
    .replace(/{q5_response}/g, state.responses.q5 || '')
    .replace(/{DATES_PLACEHOLDER}/g, CONFIG.dates_placeholder)
    .replace(/{LINK_PLACEHOLDER}/g, CONFIG.link_placeholder);
}

// ============================================
// DOM Helpers
// ============================================

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

/**
 * Render light markdown: **bold**, ## headings, --- rules, paragraphs.
 */
function renderMarkdown(text) {
  return text
    .split('\n')
    .map(line => {
      if (line.match(/^---+\s*$/)) return '<hr>';
      if (line.match(/^## /)) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      // Bold
      line = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line.trim() === '') return '';
      return `<p>${line}</p>`;
    })
    .join('\n');
}

// ============================================
// Step Rendering
// ============================================

function getContainer() {
  return document.getElementById('ci-form');
}

/**
 * Dim all previous steps.
 */
function dimPreviousSteps() {
  const steps = getContainer().querySelectorAll('.ci-step');
  steps.forEach(s => {
    if (!s.classList.contains('ci-step--active')) {
      s.classList.add('ci-step--dimmed');
    }
  });
}

/**
 * Render a step: question text + response area.
 * For Q4/Q5, questionText comes from the previous AI reaction.
 */
function renderStep(stepNum, questionText) {
  dimPreviousSteps();

  const step = el('div', 'ci-step ci-step--active');
  step.id = `ci-step-${stepNum}`;
  step.setAttribute('data-step', stepNum);

  // Question display (Q4/Q5 don't have a separate question card)
  if (stepNum <= 3) {
    const questionCard = el('div', 'ci-question');
    questionCard.innerHTML = `<p>${escapeHtml(questionText)}</p>`;
    step.appendChild(questionCard);
  }

  // Response area
  const textarea = document.createElement('textarea');
  textarea.className = 'ci-textarea';
  textarea.placeholder = CONFIG.placeholder_text;
  textarea.rows = 5;
  step.appendChild(textarea);

  // Submit button
  const submitBtn = el('button', 'ci-submit', 'Submit');
  submitBtn.disabled = true;
  step.appendChild(submitBtn);

  // Enable submit when there's content
  textarea.addEventListener('input', () => {
    submitBtn.disabled = textarea.value.trim().length < 20;
  });

  // Handle submit
  submitBtn.addEventListener('click', () => handleSubmit(stepNum, textarea, submitBtn, step));

  getContainer().appendChild(step);

  // Scroll into view
  step.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Focus textarea
  setTimeout(() => textarea.focus(), 300);
}

// ============================================
// Submit Handler
// ============================================

async function handleSubmit(stepNum, textarea, submitBtn, stepEl) {
  const response = textarea.value.trim();
  const key = `q${stepNum}`;

  // Store response and timestamp
  state.responses[key] = response;
  state.timestamps[`${key}_submit`] = new Date().toISOString();

  // Disable inputs
  textarea.disabled = true;
  submitBtn.disabled = true;
  submitBtn.style.display = 'none';

  // Show loading indicator
  const loading = el('div', 'ci-loading');
  loading.innerHTML = '<span class="ci-loading__dot"></span><span class="ci-loading__dot"></span><span class="ci-loading__dot"></span>';
  stepEl.appendChild(loading);

  try {
    // Build system prompt
    const promptTemplate = PROMPTS[key];
    const systemPrompt = buildPrompt(promptTemplate);

    // Call AI
    const result = await callAI(systemPrompt, response);

    // Track tokens
    if (result.usage) {
      state.tokenUsage.input += result.usage.input_tokens || 0;
      state.tokenUsage.output += result.usage.output_tokens || 0;
    }

    // Remove loading
    loading.remove();

    // Process response based on step
    if (stepNum <= 3) {
      handleRoutingResponse(stepNum, result.content, stepEl);
    } else if (stepNum === 4) {
      handleQ4Response(result.content, stepEl);
    } else if (stepNum === 5) {
      handleQ5Response(result.content, stepEl);
    }

  } catch (error) {
    loading.remove();
    showError(stepEl, error.message, () => {
      textarea.disabled = false;
      submitBtn.disabled = false;
      submitBtn.style.display = '';
    });
  }
}

// ============================================
// Response Handlers
// ============================================

function handleRoutingResponse(stepNum, rawContent, stepEl) {
  const key = `q${stepNum}`;
  const defaultNextId = stepNum === 1 ? 'q2_active_unfocused' : 'q3_credentials_only';
  const parsed = parseRoutingResponse(rawContent, defaultNextId);

  // Store reaction and routing
  state.aiReactions[key] = parsed.student_reaction;

  if (stepNum <= 2 && parsed.next_question_id) {
    const nextKey = `q${stepNum + 1}`;
    state.selectedQuestions[nextKey] = parsed.next_question_id;
    state.routingRationales[nextKey] = parsed.routing_rationale || '';
  }

  // Display reaction
  const reactionEl = el('div', 'ci-reaction');
  reactionEl.innerHTML = `<p>${escapeHtml(parsed.student_reaction)}</p>`;
  stepEl.appendChild(reactionEl);

  // Animate in
  requestAnimationFrame(() => reactionEl.classList.add('ci-reaction--visible'));

  // Continue button
  const continueBtn = el('button', 'ci-continue', 'Continue');
  stepEl.appendChild(continueBtn);

  continueBtn.addEventListener('click', () => {
    continueBtn.remove();
    stepEl.classList.remove('ci-step--active');
    state.currentStep = stepNum + 1;

    if (stepNum <= 2) {
      // Q1→Q2 or Q2→Q3: load selected question from bank
      const nextKey = `q${stepNum + 1}`;
      const nextQId = state.selectedQuestions[nextKey];
      const nextQ = QUESTIONS[nextQId];
      renderStep(stepNum + 1, nextQ ? nextQ.text : '');
    } else {
      // Q3→Q4: reaction's final sentence IS the prompt, just show textarea
      renderStep(4, '');
    }
  });
}

function handleQ4Response(rawContent, stepEl) {
  state.aiReactions.q4 = rawContent;

  // Display synthesis with markdown
  const reactionEl = el('div', 'ci-reaction ci-reaction--synthesis');
  reactionEl.innerHTML = renderMarkdown(rawContent);
  stepEl.appendChild(reactionEl);

  requestAnimationFrame(() => reactionEl.classList.add('ci-reaction--visible'));

  // Q5 textarea appears below (synthesis ends with "what resonates?")
  const continueBtn = el('button', 'ci-continue', 'Continue');
  stepEl.appendChild(continueBtn);

  continueBtn.addEventListener('click', () => {
    continueBtn.remove();
    stepEl.classList.remove('ci-step--active');
    state.currentStep = 5;
    renderStep(5, '');
  });
}

function handleQ5Response(rawContent, stepEl) {
  const { text, invitationOption } = parseQ5Response(rawContent);

  state.aiReactions.q5 = text;
  state.invitationOption = invitationOption;
  state.timestamps.end = new Date().toISOString();
  state.complete = true;

  // Render the deliverable card
  const card = el('div', 'ci-deliverable');
  card.innerHTML = renderMarkdown(text);
  stepEl.appendChild(card);

  requestAnimationFrame(() => card.classList.add('ci-deliverable--visible'));

  // Action buttons
  const actions = el('div', 'ci-actions');

  const copyBtn = el('button', 'ci-actions__copy', 'Copy to clipboard');
  copyBtn.addEventListener('click', async () => {
    const ok = await copyToClipboard(text);
    copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
    setTimeout(() => { copyBtn.textContent = 'Copy to clipboard'; }, 2000);
  });

  const downloadBtn = el('button', 'ci-actions__download', 'Download full session (JSON)');
  downloadBtn.addEventListener('click', () => downloadJSON(state));

  actions.appendChild(copyBtn);
  actions.appendChild(downloadBtn);
  stepEl.appendChild(actions);
}

// ============================================
// Error Handling
// ============================================

function showError(stepEl, message, onRetry) {
  const errorEl = el('div', 'ci-error');
  errorEl.innerHTML = `
    <p><strong>Something went wrong.</strong> ${escapeHtml(message)}</p>
    <button class="ci-error__retry">Try again</button>
  `;
  stepEl.appendChild(errorEl);

  errorEl.querySelector('.ci-error__retry').addEventListener('click', () => {
    errorEl.remove();
    if (onRetry) onRetry();
  });
}

// ============================================
// Initialize
// ============================================

export function init() {
  const q1 = QUESTIONS.q1_situation;
  renderStep(1, q1.text);
}
