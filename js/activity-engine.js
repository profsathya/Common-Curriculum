/**
 * Activity Engine
 * Core logic for interactive course activities
 *
 * Handles: state management, localStorage, mobile gate, export, name locking
 */

const ActivityEngine = (function() {
  'use strict';

  // ============================================
  // Configuration & State
  // ============================================

  let config = null;
  let state = null;
  let containerId = null;
  let courseTheme = 'cst395'; // 'cst395' (teal) or 'cst349' (indigo)
  let canvasAssignmentUrl = null;

  const STORAGE_PREFIX = 'activity_';

  // ============================================
  // Utility Functions
  // ============================================

  function isMobile() {
    // If viewport is wide enough, consider it desktop regardless of user agent
    // This prevents false positives in Canvas iframes on desktop
    if (window.innerWidth >= 768) {
      return false;
    }
    // For narrow viewports, check user agent to distinguish mobile from narrow desktop window
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function getStorageKey() {
    return STORAGE_PREFIX + config.activityId + '_state';
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return null;
  }

  function saveState() {
    try {
      state.lastUpdatedAt = new Date().toISOString();
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  function clearState() {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (e) {
      console.warn('Failed to clear state from localStorage:', e);
    }
  }

  function createInitialState() {
    return {
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      responses: {},
      currentQuestionIndex: 0,
      name: null,
      downloadedAt: null,
      device: {
        type: isMobile() ? 'mobile' : 'desktop',
        sawMobileWarning: false,
        continuedOnMobile: false
      }
    };
  }

  // ============================================
  // Mobile Gate
  // ============================================

  function showMobileGate(container, onContinue, onSwitch) {
    const themeColor = courseTheme === 'cst395' ? '#14b8a6' : '#6366f1';

    container.innerHTML = `
      <div class="activity-mobile-gate">
        <div class="activity-mobile-gate__content">
          <div class="activity-mobile-gate__icon">📱</div>
          <h2 class="activity-mobile-gate__title">You're on a mobile device</h2>
          <p class="activity-mobile-gate__text">
            This activity works best on a computer — larger screen helps with reading and interaction.
          </p>
          <p class="activity-mobile-gate__text" style="margin-top: 12px; font-weight: 500;">
            If you start here, you'll need to finish here.<br>
            Progress won't transfer to another device.
          </p>

          <div class="activity-mobile-gate__buttons">
            <button class="activity-mobile-gate__btn activity-mobile-gate__btn--primary" id="mobile-switch-btn">
              I'll switch to a computer
              <span class="activity-mobile-gate__btn-hint">(recommended)</span>
            </button>
            <button class="activity-mobile-gate__btn activity-mobile-gate__btn--secondary" id="mobile-continue-btn">
              Continue on mobile
              <span class="activity-mobile-gate__btn-hint">I understand I must finish here</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('mobile-switch-btn').addEventListener('click', onSwitch);
    document.getElementById('mobile-continue-btn').addEventListener('click', onContinue);
  }

  function showSwitchMessage(container) {
    const themeColor = courseTheme === 'cst395' ? '#14b8a6' : '#6366f1';

    container.innerHTML = `
      <div class="activity-mobile-gate">
        <div class="activity-mobile-gate__content">
          <div class="activity-mobile-gate__icon">💻</div>
          <h2 class="activity-mobile-gate__title">Great choice!</h2>
          <p class="activity-mobile-gate__text">
            Open this same link on your computer to begin the activity.
          </p>
          <p class="activity-mobile-gate__text" style="margin-top: 16px; font-size: 14px; color: #64748b;">
            Tip: Send yourself this URL or find it in your course materials.
          </p>
        </div>
      </div>
    `;
  }

  // ============================================
  // Activity Rendering
  // ============================================

  function renderActivity(container) {
    const themeColor = courseTheme === 'cst395' ? 'teal' : 'indigo';

    container.innerHTML = `
      <div class="activity" data-theme="${themeColor}">
        <header class="activity__header">
          <div class="activity__badge">${config.course || 'Activity'}</div>
          <h1 class="activity__title">${config.title}</h1>
          ${config.description ? `<p class="activity__description">${config.description}</p>` : ''}
        </header>

        ${config.roster && config.roster.length > 0 ? `
        <div class="activity__author-section">
          <label for="activity-author-input" class="activity__author-label">Author Name</label>
          <p class="activity__author-hint">Select the name of the person whose written responses you are entering.</p>
          <input
            type="text"
            id="activity-author-input"
            class="activity__author-input"
            list="activity-author-list"
            placeholder="Start typing to search..."
            autocomplete="off"
          >
          <datalist id="activity-author-list">
            ${config.roster.map(name => `<option value="${name}">`).join('\n            ')}
          </datalist>
        </div>
        ` : ''}

        <div class="activity__progress">
          <div class="activity__progress-bar">
            <div class="activity__progress-fill" id="activity-progress-fill"></div>
          </div>
          <div class="activity__progress-text" id="activity-progress-text">
            Question 1 of ${config.questions.length}
          </div>
        </div>

        <main class="activity__questions" id="activity-questions">
          <!-- Questions rendered here -->
        </main>

        <footer class="activity__footer" id="activity-footer">
          <div class="activity__submit-section">
            <h3 class="activity__submit-title">Ready to submit?</h3>
            <p class="activity__submit-text">Enter your name exactly as it appears in Canvas, then download your responses.</p>

            <div class="activity__name-input-wrapper">
              <label for="activity-name-input" class="activity__name-label">Your Name</label>
              <input
                type="text"
                id="activity-name-input"
                class="activity__name-input"
                placeholder="Enter your full name"
                autocomplete="name"
              >
            </div>

            <div class="activity__warning" id="activity-name-warning">
              <strong>Important:</strong> Make sure your name is correct before downloading.
              If you change your name after downloading, all responses will be cleared and you'll need to redo the activity.
            </div>

            <button class="activity__download-btn" id="activity-download-btn" disabled>
              Download Responses
            </button>

            ${canvasAssignmentUrl ? `
              <a href="${canvasAssignmentUrl}" target="_blank" class="activity__canvas-link" id="activity-canvas-link">
                Upload to Canvas →
              </a>
            ` : ''}
          </div>
        </footer>

        <div class="activity__version">
          Activity v${config.version}${config.versionNotes ? ` — ${config.versionNotes}` : ''}
        </div>
      </div>
    `;

    // Set up name input listener
    const nameInput = document.getElementById('activity-name-input');
    const downloadBtn = document.getElementById('activity-download-btn');

    nameInput.addEventListener('input', (e) => {
      const name = e.target.value.trim();
      downloadBtn.disabled = name.length < 2;

      // Check if name changed after download
      if (state.downloadedAt && state.name && name !== state.name) {
        if (confirm('Changing your name after downloading will clear all your responses. You will need to redo the activity. Continue?')) {
          // Clear everything and restart
          clearState();
          state = createInitialState();
          state.device.sawMobileWarning = true;
          if (isMobile()) {
            state.device.continuedOnMobile = true;
          }
          saveState();
          renderActivity(container);
          renderQuestions();
        } else {
          // Restore original name
          nameInput.value = state.name;
        }
      }
    });

    downloadBtn.addEventListener('click', handleDownload);

    // Restore name if previously entered
    if (state.name) {
      nameInput.value = state.name;
      downloadBtn.disabled = false;
    }

    // Set up author name input (for roster-based activities)
    const authorInput = document.getElementById('activity-author-input');
    if (authorInput) {
      if (state.authorName) {
        authorInput.value = state.authorName;
      }
      authorInput.addEventListener('change', () => {
        state.authorName = authorInput.value.trim();
        saveState();
      });
      authorInput.addEventListener('blur', () => {
        state.authorName = authorInput.value.trim();
        saveState();
      });
    }

    // Render questions
    renderQuestions();
  }

  function renderQuestions() {
    const questionsContainer = document.getElementById('activity-questions');
    if (!questionsContainer) return;

    questionsContainer.innerHTML = '';

    config.questions.forEach((question, index) => {
      const questionEl = ActivityComponents.renderQuestion(question, index, {
        maxRetries: question.maxRetries || config.settings?.maxRetries || 5,
        showHintsAfterAttempt: question.showHintsAfterAttempt || config.settings?.showHintsAfterAttempt || 2,
        showExplanationAfterAttempt: question.showExplanationAfterAttempt || config.settings?.showExplanationAfterAttempt || 5,
        response: state.responses[question.id],
        onAnswer: (answer, isCorrect) => handleAnswer(question.id, answer, isCorrect),
        onSkip: () => handleSkip(question.id),
        courseTheme: courseTheme,
        aiEndpoint: config.settings?.aiEndpoint || null
      });
      questionsContainer.appendChild(questionEl);
    });

    updateProgress();
    checkCompletion();
  }

  function updateProgress() {
    const answered = Object.keys(state.responses).length;
    const total = config.questions.length;
    const percent = (answered / total) * 100;

    const progressFill = document.getElementById('activity-progress-fill');
    const progressText = document.getElementById('activity-progress-text');

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${answered} of ${total} questions answered`;
    }
  }

  function checkCompletion() {
    // Footer is always visible — students can download at any time
    // This function is kept for future use (e.g., completion indicators)
  }

  // ============================================
  // Event Handlers
  // ============================================

  function handleAnswer(questionId, answer, isCorrect) {
    if (!state.responses[questionId]) {
      state.responses[questionId] = {
        answer: null,
        attempts: 0,
        correct: null,
        skipped: false
      };
    }

    state.responses[questionId].answer = answer;
    state.responses[questionId].attempts++;
    state.responses[questionId].correct = isCorrect;
    state.responses[questionId].skipped = false;

    saveState();
    updateProgress();
    checkCompletion();
  }

  function handleSkip(questionId) {
    const skipNudgeMessage = config.settings?.skipNudgeMessage ||
      "This question reinforces an important concept. Are you sure you want to skip?";

    if (!state.responses[questionId]?.skipped) {
      if (!confirm(skipNudgeMessage)) {
        return false;
      }
    }

    if (!state.responses[questionId]) {
      state.responses[questionId] = {
        answer: null,
        attempts: 0,
        correct: null,
        skipped: true
      };
    } else {
      state.responses[questionId].skipped = true;
    }

    saveState();
    updateProgress();
    checkCompletion();
    return true;
  }

  function handleDownload() {
    const nameInput = document.getElementById('activity-name-input');
    const name = nameInput.value.trim();

    if (name.length < 2) {
      alert('Please enter your full name.');
      return;
    }

    // Save name and download timestamp
    state.name = name;
    state.downloadedAt = new Date().toISOString();
    saveState();

    // Generate export data
    const exportData = generateExport();

    // Create and download JSON file
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);

    const link = document.createElement('a');
    link.href = jsonUrl;
    link.download = `${config.activityId}_${name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(jsonUrl);

    // Disable further changes
    nameInput.disabled = true;
    document.getElementById('activity-download-btn').textContent = 'Downloaded ✓';
    document.getElementById('activity-download-btn').disabled = true;
  }

  // ============================================
  // Export Generation
  // ============================================

  function generateExport() {
    const responses = [];
    let totalAttempts = 0;
    let correctOnFirst = 0;
    let attempted = 0;
    let skipped = 0;

    config.questions.forEach(question => {
      const response = state.responses[question.id];

      if (response) {
        attempted++;
        totalAttempts += response.attempts || 0;

        if (response.skipped) {
          skipped++;
        } else if (response.correct && response.attempts === 1) {
          correctOnFirst++;
        }

        responses.push({
          questionId: question.id,
          questionType: question.type,
          answer: response.answer,
          attempts: response.attempts,
          correct: response.correct,
          skipped: response.skipped
        });
      } else {
        responses.push({
          questionId: question.id,
          questionType: question.type,
          answer: null,
          attempts: 0,
          correct: null,
          skipped: false,
          notAttempted: true
        });
      }
    });

    return {
      // Metadata
      activityId: config.activityId,
      version: config.version,
      versionNotes: config.versionNotes || null,
      course: config.course || null,

      // Student info
      studentName: state.name,
      authorName: state.authorName || null,
      submittedAt: state.downloadedAt,

      // Device info
      device: state.device,

      // Timing
      startedAt: state.startedAt,

      // Responses
      responses: responses,

      // Summary
      summary: {
        totalQuestions: config.questions.length,
        attempted: attempted,
        skipped: skipped,
        correctOnFirst: correctOnFirst,
        totalAttempts: totalAttempts
      },

      // Markdown version for human readability
      markdown: generateMarkdown(responses)
    };
  }

  function generateMarkdown(responses) {
    let md = `# ${config.title}\n\n`;
    md += `**Student:** ${state.name}\n`;
    if (state.authorName) {
      md += `**Author:** ${state.authorName}\n`;
    }
    md += `**Submitted:** ${new Date(state.downloadedAt).toLocaleString()}\n`;
    md += `**Activity Version:** ${config.version}\n`;
    if (state.device.type === 'mobile') {
      md += `**Device:** Mobile\n`;
    }
    md += `\n---\n\n`;
    md += `## Responses\n\n`;

    config.questions.forEach((question, index) => {
      const response = state.responses[question.id];

      md += `### Q${index + 1}: ${question.prompt || question.template || 'Question'}\n\n`;

      if (!response || response.skipped) {
        md += `*Skipped*\n\n`;
      } else if (response.answer === null) {
        md += `*Not attempted*\n\n`;
      } else {
        if (question.type === 'open-ended') {
          md += `> ${response.answer}\n\n`;
        } else if (question.type === 'multiple-choice') {
          const selectedOption = question.options[response.answer];
          md += `**Answer:** ${selectedOption} ${response.correct ? '✓' : '✗'}\n`;
          md += `**Attempts:** ${response.attempts}\n\n`;
        } else if (question.type === 'ai-discussion') {
          const a = response.answer;
          md += `**Partner's Response:**\n> ${a.enteredResponse || 'N/A'}\n\n`;
          if (a.aiQuestions && a.aiQuestions.length > 0) {
            md += `**AI-Generated Discussion Questions:**\n`;
            a.aiQuestions.forEach((q, i) => { md += `${i + 1}. ${q}\n`; });
            md += `\n`;
          }
          md += `**Discussion Summary:**\n> ${a.discussionSummary || 'N/A'}\n\n`;
        } else if (question.type === 'match-following') {
          md += `**Matches:** ${JSON.stringify(response.answer)}\n`;
          md += `**Attempts:** ${response.attempts}\n\n`;
        } else {
          md += `**Answer:** ${JSON.stringify(response.answer)}\n`;
          md += `**Attempts:** ${response.attempts}\n\n`;
        }
      }
    });

    md += `---\n\n`;
    md += `*Activity ID: ${config.activityId} | Version: ${config.version}*\n`;

    return md;
  }

  // ============================================
  // Public API
  // ============================================

  return {
    /**
     * Initialize the activity engine
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of container element
     * @param {string} options.configUrl - URL to activity config JSON
     * @param {string} options.courseTheme - 'cst395' or 'cst349'
     * @param {string} options.canvasUrl - Optional Canvas assignment URL
     */
    async init(options) {
      containerId = options.containerId;
      courseTheme = options.courseTheme || 'cst395';
      canvasAssignmentUrl = options.canvasUrl || null;

      const container = document.getElementById(containerId);
      if (!container) {
        console.error('Activity container not found:', containerId);
        return;
      }

      // Show loading state
      container.innerHTML = '<div class="activity-loading">Loading activity...</div>';

      try {
        // Load config
        const response = await fetch(options.configUrl);
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status}`);
        }
        config = await response.json();

        // Load or create state
        state = loadState() || createInitialState();

        // Check mobile gate
        if (isMobile() && !state.device.sawMobileWarning) {
          showMobileGate(
            container,
            // Continue on mobile
            () => {
              state.device.sawMobileWarning = true;
              state.device.continuedOnMobile = true;
              state.device.type = 'mobile';
              saveState();
              renderActivity(container);
            },
            // Switch to computer
            () => {
              showSwitchMessage(container);
            }
          );
        } else {
          renderActivity(container);
        }

      } catch (error) {
        console.error('Failed to initialize activity:', error);
        container.innerHTML = `
          <div class="activity-error">
            <h2>Failed to load activity</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()">Try Again</button>
          </div>
        `;
      }
    },

    /**
     * Get current state (for debugging)
     */
    getState() {
      return { config, state };
    },

    /**
     * Clear state and restart (for debugging)
     */
    reset() {
      clearState();
      location.reload();
    }
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActivityEngine;
}
