/**
 * Career Discovery Form v4 — UI & State Machine
 *
 * 3 stages with AI deepening, transitions, two-part synthesis
 * (Career Brief + Pitch), optional reaction, collapsible brief sections.
 */
import { CONFIG } from './config.js';
import { STAGE_1_FRAME, STAGE_1_QUESTION, STAGE_2_QUESTION, STAGE_3_BANK } from './questions.js';
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

// Brief section icons (used in collapsible card)
const BRIEF_ICONS = {
  'Where You Are': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  'What I See': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  'A Direction Worth Exploring': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  'Your First Move': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
};

const BRIEF_COLORS = {
  'Where You Are': '#2c5282',
  'What I See': '#6b46c1',
  'A Direction Worth Exploring': '#b7791f',
  'Your First Move': '#276749',
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
  briefText: null,
  pitchText: null,
  synthesisReaction: null,
  synthesisAdjustment: null,
  transitions: { s1_to_s2: null, s2_to_s3: null },
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
    } else if (line.match(/^## /)) {
      if (inList) { result.push('</ul>'); inList = false; }
      const heading = escapeHtml(line.slice(3));
      result.push(`<h3>${heading}</h3>`);
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
    stepEl.classList.remove('ci-progress__step--done', 'ci-progress__step--active', 'ci-progress__step--upcoming');
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

function renderStageStart(stageNum, questionText, transitionText) {
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

  // Transition text (from previous stage advance)
  if (transitionText) {
    const trans = el('div', 'ci-transition');
    trans.innerHTML = `<p>${escapeHtml(transitionText)}</p>`;
    stage.appendChild(trans);
  }

  // Stage 1 frame text
  if (stageNum === 1) {
    const frame = el('div', 'ci-stage-frame');
    frame.innerHTML = `<p>${escapeHtml(STAGE_1_FRAME)}</p>`;
    stage.appendChild(frame);
  }

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

  // Character count hint
  const hint = el('div', 'ci-char-hint', '');
  area.appendChild(hint);

  const MIN_CHARS = 20;

  function checkInput() {
    const len = textarea.value.trim().length;
    submitBtn.disabled = len < MIN_CHARS;
    if (len > 0 && len < MIN_CHARS) {
      hint.textContent = `${MIN_CHARS - len} more characters needed`;
      hint.style.display = '';
    } else {
      hint.style.display = 'none';
    }
  }

  textarea.addEventListener('input', checkInput);
  textarea.addEventListener('keyup', checkInput);
  textarea.addEventListener('change', checkInput);
  textarea.addEventListener('paste', () => setTimeout(checkInput, 0));

  submitBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (text.length < MIN_CHARS) return;
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

function showLoading(container, message) {
  const loading = el('div', 'ci-loading');
  let html = '<span class="ci-loading__dot"></span><span class="ci-loading__dot"></span><span class="ci-loading__dot"></span>';
  if (message) {
    html += `<span class="ci-loading__message">${escapeHtml(message)}</span>`;
  }
  loading.innerHTML = html;
  container.appendChild(loading);
  return loading;
}

function showError(container, message, onRetry, onDownload) {
  const errorEl = el('div', 'ci-error');
  let html = `<p><strong>Something went wrong.</strong> ${escapeHtml(message)}</p>`;
  html += '<div class="ci-btn-row">';
  if (onRetry) {
    html += '<button class="ci-error__retry">Try again</button>';
  }
  if (onDownload) {
    html += '<button class="ci-error__download">Download your responses as-is</button>';
  }
  html += '</div>';
  errorEl.innerHTML = html;
  container.appendChild(errorEl);

  if (onRetry) {
    errorEl.querySelector('.ci-error__retry').addEventListener('click', () => {
      errorEl.remove();
      onRetry();
    });
  }
  if (onDownload) {
    errorEl.querySelector('.ci-error__download').addEventListener('click', () => {
      onDownload();
    });
  }
}

// ============================================
// Submit Handler
// ============================================

async function handleSubmit(text, inputArea) {
  const stageEl = getActiveStageEl();
  const stage = state.currentStage;
  const timestamp = new Date().toISOString();

  const textarea = inputArea.querySelector('.ci-textarea');
  const submitBtn = inputArea.querySelector('.ci-submit');
  textarea.disabled = true;
  submitBtn.disabled = true;

  inputArea.remove();
  const bubble = renderStudentBubble(stageEl, text);

  // Build context-labeled message
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

  // Determine if this could be a synthesis call (Stage 3 with enough material)
  const isSynthesis = stage === 3;
  const loadingMsg = isSynthesis ? 'Putting together your personalized summary — this takes a moment...' : null;
  const loading = showLoading(stageEl, loadingMsg);

  try {
    const result = await callAI(getSystemPrompt(), state.messages, { isSynthesis });

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();
    processAIResponse(parsed, stageEl);

  } catch (error) {
    loading.remove();
    state.messages.pop();
    state.conversation.pop();
    bubble.remove();

    if (isSynthesis) {
      // For synthesis failures, offer retry + download-as-is
      showError(stageEl,
        "We weren't able to generate your summary right now. Your responses have been saved.",
        () => {
          appendInputArea(stageEl);
          const newTextarea = stageEl.querySelector('.ci-textarea');
          if (newTextarea) newTextarea.value = text;
        },
        () => {
          state.timestamps.end = new Date().toISOString();
          downloadJSON(state);
        }
      );
    } else {
      showError(stageEl, error.message, () => {
        appendInputArea(stageEl);
        const newTextarea = stageEl.querySelector('.ci-textarea');
        if (newTextarea) newTextarea.value = text;
      });
    }
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
      transition: parsed.transition || null,
    });

    if (parsed.reaction) {
      renderAIBubble(stageEl, parsed.reaction, null);
    }

    advanceFromStage(stage, parsed.next_question_id, parsed.transition);

  } else if (parsed.phase === 'synthesis') {
    const briefText = parsed.brief || parsed.synthesis || '';
    const pitchText = parsed.pitch || '';

    state.briefText = briefText;
    state.pitchText = pitchText;
    state.currentStage = 'synthesis';

    state.conversation.push({
      role: 'ai',
      content: briefText,
      stage: 'synthesis',
      phase: 'synthesis',
    });

    stageEl.classList.remove('ci-stage--active');
    stageEl.classList.add('ci-stage--done');
    updateProgress(4);

    renderBrief(briefText);

  } else if (parsed.phase === 'synthesis_adjusted') {
    state.synthesisAdjustment = parsed.reaction;

    state.conversation.push({
      role: 'ai',
      content: parsed.reaction,
      stage: 'synthesis',
      phase: 'synthesis_adjusted',
    });

    renderSynthesisAdjustment(parsed.reaction);
    renderPostReactionActions();
  }
}

function advanceFromStage(stage, nextQuestionId, transition) {
  if (stage === 1) {
    state.transitions.s1_to_s2 = transition || null;
    state.currentStage = 2;
    state.followUpCount = 0;
    renderStageStart(2, STAGE_2_QUESTION, transition);
  } else if (stage === 2) {
    state.transitions.s2_to_s3 = transition || null;
    state.selectedQ3 = nextQuestionId || 'q3_e';
    state.currentStage = 3;
    state.followUpCount = 0;
    const q3 = STAGE_3_BANK[state.selectedQ3];
    renderStageStart(3, q3 ? q3.text : '', transition);
  } else if (stage === 3) {
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
  const loading = showLoading(form, 'Putting together your personalized summary — this takes a moment...');

  try {
    const result = await callAI(getSystemPrompt(), state.messages, { isSynthesis: true });

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();

    const briefText = parsed.brief || parsed.synthesis || parsed.reaction || result.content;
    const pitchText = parsed.pitch || '';

    state.briefText = briefText;
    state.pitchText = pitchText;

    state.conversation.push({
      role: 'ai',
      content: briefText,
      stage: 'synthesis',
      phase: 'synthesis',
    });

    renderBrief(briefText);

  } catch (error) {
    loading.remove();
    showError(form,
      "We weren't able to generate your summary right now. Your responses have been saved.",
      () => requestSynthesis(),
      () => {
        state.timestamps.end = new Date().toISOString();
        downloadJSON(state);
      }
    );
  }
}

// ============================================
// Skip Handler
// ============================================

async function handleSkip() {
  const stage = state.currentStage;
  const stageEl = getActiveStageEl();

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

  if (stage === 1) {
    state.currentStage = 2;
    state.followUpCount = 0;
    renderStageStart(2, STAGE_2_QUESTION, null);
    return;
  }

  const isSynthesis = stage === 3;
  const loadingMsg = isSynthesis ? 'Putting together your personalized summary — this takes a moment...' : null;
  const loading = showLoading(stageEl, loadingMsg);

  try {
    const result = await callAI(getSystemPrompt(), state.messages, { isSynthesis });

    state.tokenUsage.input += result.usage.input_tokens || 0;
    state.tokenUsage.output += result.usage.output_tokens || 0;

    const parsed = parsePhaseResponse(result.content);
    state.messages.push({ role: 'assistant', content: result.content });

    loading.remove();
    processAIResponse(parsed, stageEl);

  } catch (error) {
    loading.remove();
    state.messages.pop();
    state.conversation.pop();

    showError(stageEl, error.message, () => {
      appendInputArea(stageEl);
    });
  }
}

// ============================================
// Career Intelligence Brief (Collapsible)
// ============================================

function parseBriefSections(markdown) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentTitle = '';
  let currentContent = [];

  for (const line of lines) {
    if (line.match(/^#{1,3}\s/)) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = line.replace(/^#{1,3}\s+/, '').trim();
      currentContent = [];
    } else if (line.match(/^---+\s*$/)) {
      // skip separators
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
  }

  return sections;
}

function renderBrief(briefMarkdown) {
  const form = getForm();
  const section = el('div', 'ci-synthesis-section');

  // Header
  const synthHeader = el('div', 'ci-synth-header');
  synthHeader.innerHTML = `
    <h2 class="ci-synth-header__title">Your Career Intelligence Brief</h2>
    <p class="ci-synth-header__subtitle">Based on everything you shared across all three stages</p>
  `;
  section.appendChild(synthHeader);

  // Collapsible brief card
  const briefCard = el('div', 'ci-brief-card');
  const sections = parseBriefSections(briefMarkdown);

  if (sections.length === 0) {
    // Fallback: render as plain markdown if parsing finds no sections
    briefCard.innerHTML = renderMarkdown(briefMarkdown);
  } else {
    sections.forEach((s, index) => {
      const sectionEl = el('div', `ci-brief-section ${index === 0 ? 'ci-brief-section--expanded' : ''}`);

      const icon = BRIEF_ICONS[s.title] || '';
      const color = BRIEF_COLORS[s.title] || '#4a5568';

      // Extract first sentence for preview
      const firstSentence = s.content.split(/(?<=[.!?])\s/)[0] || '';

      const headerEl = el('div', 'ci-brief-section__header');
      headerEl.style.setProperty('--section-color', color);
      headerEl.innerHTML = `
        <div class="ci-brief-section__title-row">
          ${icon ? `<span class="ci-brief-section__icon" style="color:${color}">${icon}</span>` : ''}
          <div>
            <h3 class="ci-brief-section__title">${escapeHtml(s.title)}</h3>
            ${index > 0 ? `<span class="ci-brief-section__preview">${escapeHtml(firstSentence)}</span>` : ''}
          </div>
        </div>
        <span class="ci-brief-section__toggle">\u25BE</span>
      `;

      const contentEl = el('div', 'ci-brief-section__content');
      contentEl.innerHTML = renderMarkdown(s.content);

      headerEl.addEventListener('click', () => {
        sectionEl.classList.toggle('ci-brief-section--expanded');
      });

      sectionEl.appendChild(headerEl);
      sectionEl.appendChild(contentEl);
      briefCard.appendChild(sectionEl);
    });
  }

  section.appendChild(briefCard);
  requestAnimationFrame(() => briefCard.classList.add('ci-brief-card--visible'));

  form.appendChild(section);

  // Reaction area
  renderSynthesisReactionArea(section);

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Synthesis Reaction
// ============================================

function renderSynthesisReactionArea(container) {
  const area = el('div', 'ci-synthesis-reaction');
  area.innerHTML = `
    <p class="ci-synthesis-reaction__prompt">Does anything here surprise you or feel off? Tell me what and I'll adjust.</p>
  `;

  const textarea = document.createElement('textarea');
  textarea.className = 'ci-textarea';
  textarea.placeholder = 'Tell me what surprised you or felt off...';
  textarea.rows = 3;
  area.appendChild(textarea);

  const btnRow = el('div', 'ci-btn-row');

  const submitBtn = el('button', 'ci-submit', 'Submit feedback');
  submitBtn.disabled = true;
  btnRow.appendChild(submitBtn);

  const skipBtn = el('button', 'ci-skip', 'Looks good, continue');
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
      renderPostReactionActions();

    } catch (error) {
      loading.remove();
      showError(area, error.message);
      renderPostReactionActions();
    }
  });

  skipBtn.addEventListener('click', () => {
    area.remove();
    state.synthesisReaction = null;
    state.synthesisAdjustment = null;
    renderPostReactionActions();
  });
}

function renderSynthesisAdjustment(adjustmentText) {
  const section = document.querySelector('.ci-synthesis-section');
  const adj = el('div', 'ci-adjustment');
  adj.innerHTML = `<p>${escapeHtml(adjustmentText)}</p>`;
  section.appendChild(adj);
  requestAnimationFrame(() => adj.classList.add('ci-adjustment--visible'));
}

// ============================================
// Post-Reaction: "Want to Go Deeper?" + Download
// ============================================

function renderPostReactionActions() {
  state.timestamps.end = new Date().toISOString();
  state.currentStage = 'pitch';

  const section = document.querySelector('.ci-synthesis-section');
  const actions = el('div', 'ci-actions');

  const deeperBtn = el('button', 'ci-actions__deeper', 'Want to go deeper?');
  actions.appendChild(deeperBtn);

  const downloadBtn = el('button', 'ci-actions__download', 'Download session (JSON)');
  downloadBtn.addEventListener('click', () => {
    state.complete = true;
    downloadJSON(state);
  });
  actions.appendChild(downloadBtn);

  section.appendChild(actions);

  deeperBtn.addEventListener('click', () => {
    deeperBtn.disabled = true;
    deeperBtn.textContent = 'Showing details...';
    renderPitchSection(section);
  });

  actions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// Pitch Section: "Want to Go Deeper?"
// ============================================

function renderPitchSection(container) {
  state.currentStage = 'complete';
  state.complete = true;

  const pitchEl = el('div', 'ci-pitch-section');

  const opening = el('p', 'ci-pitch-section__opening');
  opening.textContent = "What you just experienced was a 15-minute version of a process we've been developing. Here's what the full experience looks like.";
  pitchEl.appendChild(opening);

  if (state.pitchText) {
    const pitchContent = el('div', 'ci-pitch-section__content');
    pitchContent.innerHTML = renderPitchMarkdown(state.pitchText);
    pitchEl.appendChild(pitchContent);
  }

  // Session info
  const cta = el('div', 'ci-pitch-section__cta');
  const dates = CONFIG.dates_placeholder;
  const link = CONFIG.link_placeholder;
  if (dates && dates !== '[DATES TBD]' && link && link !== '[LINK TBD]') {
    cta.innerHTML = `<p>We're running two focused sessions on <strong>${escapeHtml(dates)}</strong> that go deeper — strategic market mapping, value proposition development, and building an experimental approach to your search. <a href="${escapeHtml(link)}" target="_blank">Sign up here</a>.</p>`;
  } else {
    cta.innerHTML = `<p>Dates coming soon. Check back for session details.</p>`;
  }
  pitchEl.appendChild(cta);

  // Download at bottom of pitch
  const actions = el('div', 'ci-actions');
  const downloadBtn = el('button', 'ci-actions__download', 'Download session (JSON)');
  downloadBtn.addEventListener('click', () => downloadJSON(state));
  actions.appendChild(downloadBtn);
  pitchEl.appendChild(actions);

  container.appendChild(pitchEl);
  requestAnimationFrame(() => pitchEl.classList.add('ci-pitch-section--visible'));
  pitchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPitchMarkdown(text) {
  let html = '';
  const lines = text.split('\n');
  let inList = false;

  for (const line of lines) {
    if (line.match(/^---+\s*$/)) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }

    const fitMatch = line.match(/^This might be a good next step if:/i);
    const nofitMatch = line.match(/^This probably isn't the best use of your time if:/i);

    if (fitMatch) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="ci-pitch-fit">${escapeHtml(line)}</p>`;
    } else if (nofitMatch) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="ci-pitch-nofit">${escapeHtml(line)}</p>`;
    } else if (line.match(/^- /)) {
      if (!inList) { html += '<ul>'; inList = true; }
      const content = escapeHtml(line.slice(2)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${content}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      const processed = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (processed.trim()) {
        html += `<p>${processed}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';
  return html;
}

// ============================================
// Initialize
// ============================================

export function init() {
  console.log(`Career Discovery Form v${CONFIG.form_version} loaded`);
  renderProgressBar();
  renderStageStart(1, STAGE_1_QUESTION, null);
}
