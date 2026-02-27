/**
 * Career Intelligence Form — UI & State Machine
 */
import { CONFIG } from './config.js';
import { QUESTIONS } from './questions.js';
import { PROMPTS } from './prompts.js';
import { callAI, parseRoutingResponse, parseQ5Response } from './api.js';
import { copyToClipboard, downloadJSON } from './data.js';

// ============================================
// Step Metadata & Icons
// ============================================

const STEPS = [
  { num: 1, key: 'q1', label: 'Where You Are', color: '#2c5282' },
  { num: 2, key: 'q2', label: 'Going Deeper', color: '#6b46c1' },
  { num: 3, key: 'q3', label: 'Your Experience', color: '#b7791f' },
  { num: 4, key: 'q4', label: 'Insights', color: '#276749' },
  { num: 5, key: 'q5', label: 'Your Plan', color: '#c53030' },
];

const ICONS = {
  1: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/></svg>',
  4: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  5: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
};

function stepMeta(num) {
  return STEPS[num - 1];
}

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
// Progress Bar
// ============================================

function renderProgressBar() {
  const bar = el('div', 'ci-progress');
  bar.id = 'ci-progress';

  const track = el('div', 'ci-progress__track');

  STEPS.forEach((step, i) => {
    const stepEl = el('div', 'ci-progress__step ci-progress__step--upcoming');
    stepEl.dataset.step = step.num;
    stepEl.innerHTML = `
      <div class="ci-progress__dot" style="--step-color: ${step.color}">
        <span class="ci-progress__icon">${ICONS[step.num]}</span>
        <span class="ci-progress__check">${ICONS.check}</span>
      </div>
      <div class="ci-progress__label">${step.label}</div>
    `;
    track.appendChild(stepEl);

    if (i < STEPS.length - 1) {
      track.appendChild(el('div', 'ci-progress__connector'));
    }
  });

  bar.appendChild(track);

  const form = document.getElementById('ci-form');
  form.parentNode.insertBefore(bar, form);
}

function updateProgress(currentStep) {
  document.querySelectorAll('.ci-progress__step').forEach(stepEl => {
    const num = parseInt(stepEl.dataset.step);
    stepEl.classList.remove(
      'ci-progress__step--done',
      'ci-progress__step--active',
      'ci-progress__step--upcoming'
    );
    if (num < currentStep) {
      stepEl.classList.add('ci-progress__step--done');
    } else if (num === currentStep) {
      stepEl.classList.add('ci-progress__step--active');
    } else {
      stepEl.classList.add('ci-progress__step--upcoming');
    }
  });

  document.querySelectorAll('.ci-progress__connector').forEach((conn, i) => {
    conn.classList.toggle('ci-progress__connector--done', i < currentStep - 1);
  });
}

// ============================================
// Timeline (Collapsed Completed Steps)
// ============================================

function getQuestionTextForStep(stepNum) {
  if (stepNum === 1) return QUESTIONS.q1_situation.text;
  if (stepNum === 2) return getQuestionText(state.selectedQuestions.q2);
  if (stepNum === 3) return getQuestionText(state.selectedQuestions.q3);
  return '';
}

function collapseStep(stepNum) {
  const meta = stepMeta(stepNum);
  const key = meta.key;
  const response = state.responses[key] || '';
  const excerpt = response.length > 120
    ? response.substring(0, 120) + '\u2026'
    : response;
  const questionText = getQuestionTextForStep(stepNum);
  const aiReaction = state.aiReactions[key] || '';

  const item = el('div', 'ci-tl-item');
  item.dataset.step = stepNum;
  item.style.setProperty('--step-color', meta.color);

  item.innerHTML = `
    <div class="ci-tl-marker">
      <div class="ci-tl-dot">${ICONS.check}</div>
      <div class="ci-tl-line"></div>
    </div>
    <div class="ci-tl-card">
      <div class="ci-tl-header">
        <span class="ci-tl-icon">${ICONS[stepNum]}</span>
        <span class="ci-tl-label">${meta.label}</span>
        <span class="ci-tl-toggle">\u203A</span>
      </div>
      <div class="ci-tl-excerpt">\u201C${escapeHtml(excerpt)}\u201D</div>
      <div class="ci-tl-details">
        ${questionText ? `<div class="ci-tl-detail-row"><span class="ci-tl-detail-label">Question:</span> ${escapeHtml(questionText)}</div>` : ''}
        <div class="ci-tl-detail-row"><span class="ci-tl-detail-label">Your response:</span> ${escapeHtml(response)}</div>
        ${aiReaction ? `<div class="ci-tl-detail-row"><span class="ci-tl-detail-label">AI feedback:</span> ${escapeHtml(aiReaction)}</div>` : ''}
      </div>
    </div>
  `;

  // Toggle expand/collapse
  const header = item.querySelector('.ci-tl-header');
  const details = item.querySelector('.ci-tl-details');
  const toggle = item.querySelector('.ci-tl-toggle');

  header.addEventListener('click', () => {
    const isOpen = details.classList.toggle('ci-tl-details--open');
    toggle.classList.toggle('ci-tl-toggle--open', isOpen);
  });

  // Animate in
  item.style.opacity = '0';
  item.style.transform = 'translateY(10px)';
  document.getElementById('ci-timeline').appendChild(item);

  requestAnimationFrame(() => {
    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  });
}

// ============================================
// Step Rendering
// ============================================

function renderStep(stepNum, questionText) {
  const meta = stepMeta(stepNum);
  const activeArea = document.getElementById('ci-active');

  // Clear active area
  activeArea.innerHTML = '';

  // Update progress bar
  updateProgress(stepNum);

  const step = el('div', 'ci-step ci-step--active');
  step.id = `ci-step-${stepNum}`;
  step.setAttribute('data-step', stepNum);
  step.style.setProperty('--step-color', meta.color);

  // Step label with icon
  const label = el('div', 'ci-step-label');
  label.style.setProperty('--step-color', meta.color);
  label.innerHTML = `
    <span class="ci-step-label__icon">${ICONS[stepNum]}</span>
    <span class="ci-step-label__num">Step ${stepNum}</span>
    <span class="ci-step-label__title">${meta.label}</span>
  `;
  step.appendChild(label);

  // Question display (Q1-Q3 have explicit questions)
  if (stepNum <= 3 && questionText) {
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

  activeArea.appendChild(step);

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

    // Collapse into timeline
    collapseStep(stepNum);

    state.currentStep = stepNum + 1;

    if (stepNum <= 2) {
      // Q1->Q2 or Q2->Q3: load selected question from bank
      const nextKey = `q${stepNum + 1}`;
      const nextQId = state.selectedQuestions[nextKey];
      const nextQ = QUESTIONS[nextQId];
      renderStep(stepNum + 1, nextQ ? nextQ.text : '');
    } else {
      // Q3->Q4: reaction's final sentence IS the prompt, just show textarea
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

    // Collapse into timeline
    collapseStep(4);

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

  // Mark all steps done in progress bar
  updateProgress(6);

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
  const form = document.getElementById('ci-form');

  // Create timeline container (collapsed completed steps go here)
  const timeline = el('div', 'ci-timeline');
  timeline.id = 'ci-timeline';
  form.appendChild(timeline);

  // Create active step container (current step renders here)
  const active = el('div', 'ci-active');
  active.id = 'ci-active';
  form.appendChild(active);

  // Render sticky progress bar
  renderProgressBar();

  // Start step 1
  const q1 = QUESTIONS.q1_situation;
  renderStep(1, q1.text);
}
