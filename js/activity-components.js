/**
 * Activity Components
 * Renderers for different question types
 */

const ActivityComponents = (function() {
  'use strict';

  // ============================================
  // Utility Functions
  // ============================================

  function createElement(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ============================================
  // Question Wrapper
  // ============================================

  function renderQuestion(question, index, options) {
    const wrapper = createElement('div', 'activity-question');
    wrapper.setAttribute('data-question-id', question.id);
    wrapper.setAttribute('data-question-type', question.type);

    const header = createElement('div', 'activity-question__header');
    header.innerHTML = `
      <span class="activity-question__number">Q${index + 1}</span>
      <span class="activity-question__status" id="status-${question.id}"></span>
    `;
    wrapper.appendChild(header);

    // Render based on type
    let content;
    switch (question.type) {
      case 'multiple-choice':
        content = renderMultipleChoice(question, options);
        break;
      case 'open-ended':
        content = renderOpenEnded(question, options);
        break;
      case 'fill-blank-text':
        content = renderFillBlankText(question, options);
        break;
      case 'fill-blank-dropdown':
        content = renderFillBlankDropdown(question, options);
        break;
      case 'match-following':
        content = renderMatchFollowing(question, options);
        break;
      default:
        content = createElement('div', 'activity-question__error', `Unknown question type: ${question.type}`);
    }

    wrapper.appendChild(content);

    // Update status if already answered
    if (options.response) {
      updateQuestionStatus(question.id, options.response);
    }

    return wrapper;
  }

  function updateQuestionStatus(questionId, response) {
    const statusEl = document.getElementById(`status-${questionId}`);
    if (!statusEl) return;

    if (response.skipped) {
      statusEl.textContent = 'Skipped';
      statusEl.className = 'activity-question__status activity-question__status--skipped';
    } else if (response.correct === true) {
      statusEl.textContent = '✓ Correct';
      statusEl.className = 'activity-question__status activity-question__status--correct';
    } else if (response.correct === false) {
      statusEl.textContent = `Attempt ${response.attempts}`;
      statusEl.className = 'activity-question__status activity-question__status--incorrect';
    } else if (response.answer !== null) {
      // Open-ended or other non-graded
      statusEl.textContent = '✓ Answered';
      statusEl.className = 'activity-question__status activity-question__status--answered';
    }
  }

  // ============================================
  // Multiple Choice
  // ============================================

  function renderMultipleChoice(question, options) {
    const container = createElement('div', 'activity-question__content activity-mc');

    const prompt = createElement('p', 'activity-question__prompt', question.prompt);
    container.appendChild(prompt);

    const optionsContainer = createElement('div', 'activity-mc__options');

    question.options.forEach((optionText, optIndex) => {
      const optionBtn = createElement('button', 'activity-mc__option');
      optionBtn.setAttribute('data-index', optIndex);
      optionBtn.innerHTML = `
        <span class="activity-mc__option-letter">${String.fromCharCode(65 + optIndex)}</span>
        <span class="activity-mc__option-text">${optionText}</span>
      `;

      // Restore state if previously answered
      if (options.response && options.response.answer === optIndex) {
        optionBtn.classList.add('activity-mc__option--selected');
        if (options.response.correct) {
          optionBtn.classList.add('activity-mc__option--correct');
        } else {
          optionBtn.classList.add('activity-mc__option--incorrect');
        }
      }

      optionBtn.addEventListener('click', () => {
        handleMultipleChoiceSelect(question, optIndex, optionBtn, optionsContainer, options);
      });

      optionsContainer.appendChild(optionBtn);
    });

    container.appendChild(optionsContainer);

    // Hint area (shown after X attempts)
    const hintArea = createElement('div', 'activity-question__hint', '');
    hintArea.id = `hint-${question.id}`;
    hintArea.style.display = 'none';
    container.appendChild(hintArea);

    // Explanation area (shown after correct or max attempts)
    const explainArea = createElement('div', 'activity-question__explanation', '');
    explainArea.id = `explain-${question.id}`;
    explainArea.style.display = 'none';
    container.appendChild(explainArea);

    // Show hint/explanation if already attempted enough
    if (options.response && question.hint) {
      if (options.response.attempts >= options.showHintsAfterAttempt && !options.response.correct) {
        hintArea.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
        hintArea.style.display = 'block';
      }
    }
    if (options.response && question.explanation) {
      if (options.response.correct || options.response.attempts >= options.showExplanationAfterAttempt) {
        explainArea.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
        explainArea.style.display = 'block';
      }
    }

    // Skip button
    const skipBtn = createElement('button', 'activity-question__skip', 'Skip this question');
    if (options.response?.correct || options.response?.skipped) {
      skipBtn.style.display = 'none';
    }
    skipBtn.addEventListener('click', () => {
      if (options.onSkip()) {
        skipBtn.style.display = 'none';
        updateQuestionStatus(question.id, { skipped: true });
      }
    });
    container.appendChild(skipBtn);

    return container;
  }

  function handleMultipleChoiceSelect(question, selectedIndex, selectedBtn, optionsContainer, options) {
    // Don't allow changes if already correct or at max retries
    const currentResponse = options.response || { attempts: 0, correct: false };
    if (currentResponse.correct) return;
    if (currentResponse.attempts >= options.maxRetries) return;

    // Check answer
    const isCorrect = selectedIndex === question.correctIndex;

    // Update UI
    optionsContainer.querySelectorAll('.activity-mc__option').forEach(btn => {
      btn.classList.remove('activity-mc__option--selected', 'activity-mc__option--incorrect');
    });
    selectedBtn.classList.add('activity-mc__option--selected');

    if (isCorrect) {
      selectedBtn.classList.add('activity-mc__option--correct');
      // Show explanation
      if (question.explanation) {
        const explainArea = document.getElementById(`explain-${question.id}`);
        if (explainArea) {
          explainArea.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
          explainArea.style.display = 'block';
        }
      }
      // Hide skip button
      const skipBtn = selectedBtn.closest('.activity-question__content').querySelector('.activity-question__skip');
      if (skipBtn) skipBtn.style.display = 'none';
    } else {
      selectedBtn.classList.add('activity-mc__option--incorrect');

      const newAttempts = (currentResponse.attempts || 0) + 1;

      // Show hint after threshold
      if (question.hint && newAttempts >= options.showHintsAfterAttempt) {
        const hintArea = document.getElementById(`hint-${question.id}`);
        if (hintArea) {
          hintArea.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
          hintArea.style.display = 'block';
        }
      }

      // Show explanation and correct answer after max attempts
      if (newAttempts >= options.maxRetries) {
        if (question.explanation) {
          const explainArea = document.getElementById(`explain-${question.id}`);
          if (explainArea) {
            explainArea.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
            explainArea.style.display = 'block';
          }
        }
        // Highlight correct answer
        const correctBtn = optionsContainer.querySelector(`[data-index="${question.correctIndex}"]`);
        if (correctBtn) {
          correctBtn.classList.add('activity-mc__option--correct');
        }
      }
    }

    // Notify engine
    options.response = {
      answer: selectedIndex,
      attempts: (currentResponse.attempts || 0) + 1,
      correct: isCorrect,
      skipped: false
    };
    options.onAnswer(selectedIndex, isCorrect);
    updateQuestionStatus(question.id, options.response);
  }

  // ============================================
  // Open Ended
  // ============================================

  function renderOpenEnded(question, options) {
    const container = createElement('div', 'activity-question__content activity-open');

    const prompt = createElement('p', 'activity-question__prompt', question.prompt);
    container.appendChild(prompt);

    const textarea = document.createElement('textarea');
    textarea.className = 'activity-open__textarea';
    textarea.placeholder = question.placeholder || 'Type your response here...';
    textarea.rows = 5;

    // Restore state
    if (options.response && options.response.answer) {
      textarea.value = options.response.answer;
    }

    container.appendChild(textarea);

    // Character count
    const minLength = question.minLength || 0;
    const charCount = createElement('div', 'activity-open__charcount');
    charCount.innerHTML = `<span id="charcount-${question.id}">${textarea.value.length}</span> characters${minLength ? ` (minimum ${minLength})` : ''}`;
    container.appendChild(charCount);

    // Save button
    const saveBtn = createElement('button', 'activity-open__save', 'Save Response');
    if (options.response?.answer) {
      saveBtn.textContent = 'Update Response';
    }

    textarea.addEventListener('input', () => {
      const count = textarea.value.length;
      document.getElementById(`charcount-${question.id}`).textContent = count;

      // Visual feedback for minimum length
      if (minLength && count < minLength) {
        charCount.classList.add('activity-open__charcount--insufficient');
      } else {
        charCount.classList.remove('activity-open__charcount--insufficient');
      }
    });

    saveBtn.addEventListener('click', () => {
      const value = textarea.value.trim();

      if (minLength && value.length < minLength) {
        alert(`Please write at least ${minLength} characters.`);
        return;
      }

      options.onAnswer(value, null); // null for correct since open-ended isn't auto-graded
      saveBtn.textContent = 'Saved ✓';
      setTimeout(() => {
        saveBtn.textContent = 'Update Response';
      }, 2000);

      updateQuestionStatus(question.id, { answer: value, attempts: 1, correct: null, skipped: false });
    });

    container.appendChild(saveBtn);

    return container;
  }

  // ============================================
  // Fill in the Blank (Text Input)
  // ============================================

  function renderFillBlankText(question, options) {
    const container = createElement('div', 'activity-question__content activity-fill');

    // Parse template and create inputs
    const template = question.template || question.prompt;
    const blanks = question.blanks || {};
    const blankIds = Object.keys(blanks);

    let html = template;
    blankIds.forEach(blankId => {
      const inputHtml = `<input type="text" class="activity-fill__input" data-blank-id="${blankId}" placeholder="..." autocomplete="off">`;
      html = html.replace(`{{${blankId}}}`, inputHtml);
    });

    const promptDiv = createElement('div', 'activity-fill__prompt');
    promptDiv.innerHTML = html;
    container.appendChild(promptDiv);

    // Check button
    const checkBtn = createElement('button', 'activity-fill__check', 'Check Answer');

    // Restore state
    if (options.response && options.response.answer) {
      Object.entries(options.response.answer).forEach(([blankId, value]) => {
        const input = promptDiv.querySelector(`[data-blank-id="${blankId}"]`);
        if (input) {
          input.value = value;
          if (options.response.correct) {
            input.classList.add('activity-fill__input--correct');
            input.disabled = true;
          }
        }
      });
      if (options.response.correct) {
        checkBtn.style.display = 'none';
      }
    }

    checkBtn.addEventListener('click', () => {
      handleFillBlankCheck(question, promptDiv, options, checkBtn);
    });

    container.appendChild(checkBtn);

    // Hint area
    const hintArea = createElement('div', 'activity-question__hint', '');
    hintArea.id = `hint-${question.id}`;
    hintArea.style.display = 'none';
    container.appendChild(hintArea);

    // Skip button
    const skipBtn = createElement('button', 'activity-question__skip', 'Skip this question');
    if (options.response?.correct || options.response?.skipped) {
      skipBtn.style.display = 'none';
    }
    skipBtn.addEventListener('click', () => {
      if (options.onSkip()) {
        skipBtn.style.display = 'none';
        updateQuestionStatus(question.id, { skipped: true });
      }
    });
    container.appendChild(skipBtn);

    return container;
  }

  function handleFillBlankCheck(question, promptDiv, options, checkBtn) {
    const blanks = question.blanks || {};
    const inputs = promptDiv.querySelectorAll('.activity-fill__input');
    const answers = {};
    let allCorrect = true;

    inputs.forEach(input => {
      const blankId = input.getAttribute('data-blank-id');
      const value = input.value.trim();
      answers[blankId] = value;

      const blank = blanks[blankId];
      const correctAnswer = blank.answer || blank.correct;
      const alternatives = blank.alternatives || [];

      const isCorrect = value.toLowerCase() === correctAnswer.toLowerCase() ||
        alternatives.some(alt => value.toLowerCase() === alt.toLowerCase());

      if (isCorrect) {
        input.classList.remove('activity-fill__input--incorrect');
        input.classList.add('activity-fill__input--correct');
      } else {
        input.classList.remove('activity-fill__input--correct');
        input.classList.add('activity-fill__input--incorrect');
        allCorrect = false;
      }
    });

    const currentAttempts = (options.response?.attempts || 0) + 1;

    if (allCorrect) {
      inputs.forEach(input => input.disabled = true);
      checkBtn.style.display = 'none';
      // Hide skip button
      const skipBtn = promptDiv.closest('.activity-question__content').querySelector('.activity-question__skip');
      if (skipBtn) skipBtn.style.display = 'none';
    } else {
      // Show hint after threshold
      if (question.hint && currentAttempts >= options.showHintsAfterAttempt) {
        const hintArea = document.getElementById(`hint-${question.id}`);
        if (hintArea) {
          hintArea.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
          hintArea.style.display = 'block';
        }
      }

      // Show correct answers after max attempts
      if (currentAttempts >= options.maxRetries) {
        inputs.forEach(input => {
          const blankId = input.getAttribute('data-blank-id');
          const blank = blanks[blankId];
          input.value = blank.answer || blank.correct;
          input.classList.remove('activity-fill__input--incorrect');
          input.classList.add('activity-fill__input--correct');
          input.disabled = true;
        });
        checkBtn.style.display = 'none';
      }
    }

    options.response = {
      answer: answers,
      attempts: currentAttempts,
      correct: allCorrect,
      skipped: false
    };
    options.onAnswer(answers, allCorrect);
    updateQuestionStatus(question.id, options.response);
  }

  // ============================================
  // Fill in the Blank (Dropdown)
  // ============================================

  function renderFillBlankDropdown(question, options) {
    const container = createElement('div', 'activity-question__content activity-fill');

    const template = question.template || question.prompt;
    const blanks = question.blanks || {};
    const blankIds = Object.keys(blanks);

    let html = template;
    blankIds.forEach(blankId => {
      const blank = blanks[blankId];
      const optionsHtml = blank.options.map(opt =>
        `<option value="${opt}">${opt}</option>`
      ).join('');
      const selectHtml = `<select class="activity-fill__select" data-blank-id="${blankId}"><option value="">Select...</option>${optionsHtml}</select>`;
      html = html.replace(`{{${blankId}}}`, selectHtml);
    });

    const promptDiv = createElement('div', 'activity-fill__prompt');
    promptDiv.innerHTML = html;
    container.appendChild(promptDiv);

    // Check button
    const checkBtn = createElement('button', 'activity-fill__check', 'Check Answer');

    // Restore state
    if (options.response && options.response.answer) {
      Object.entries(options.response.answer).forEach(([blankId, value]) => {
        const select = promptDiv.querySelector(`[data-blank-id="${blankId}"]`);
        if (select) {
          select.value = value;
          if (options.response.correct) {
            select.classList.add('activity-fill__select--correct');
            select.disabled = true;
          }
        }
      });
      if (options.response.correct) {
        checkBtn.style.display = 'none';
      }
    }

    checkBtn.addEventListener('click', () => {
      handleFillDropdownCheck(question, promptDiv, options, checkBtn);
    });

    container.appendChild(checkBtn);

    // Hint area
    const hintArea = createElement('div', 'activity-question__hint', '');
    hintArea.id = `hint-${question.id}`;
    hintArea.style.display = 'none';
    container.appendChild(hintArea);

    // Skip button
    const skipBtn = createElement('button', 'activity-question__skip', 'Skip this question');
    if (options.response?.correct || options.response?.skipped) {
      skipBtn.style.display = 'none';
    }
    skipBtn.addEventListener('click', () => {
      if (options.onSkip()) {
        skipBtn.style.display = 'none';
        updateQuestionStatus(question.id, { skipped: true });
      }
    });
    container.appendChild(skipBtn);

    return container;
  }

  function handleFillDropdownCheck(question, promptDiv, options, checkBtn) {
    const blanks = question.blanks || {};
    const selects = promptDiv.querySelectorAll('.activity-fill__select');
    const answers = {};
    let allCorrect = true;

    selects.forEach(select => {
      const blankId = select.getAttribute('data-blank-id');
      const value = select.value;
      answers[blankId] = value;

      const blank = blanks[blankId];
      const isCorrect = value === blank.correct;

      if (isCorrect) {
        select.classList.remove('activity-fill__select--incorrect');
        select.classList.add('activity-fill__select--correct');
      } else {
        select.classList.remove('activity-fill__select--correct');
        select.classList.add('activity-fill__select--incorrect');
        allCorrect = false;
      }
    });

    const currentAttempts = (options.response?.attempts || 0) + 1;

    if (allCorrect) {
      selects.forEach(select => select.disabled = true);
      checkBtn.style.display = 'none';
      const skipBtn = promptDiv.closest('.activity-question__content').querySelector('.activity-question__skip');
      if (skipBtn) skipBtn.style.display = 'none';
    } else {
      if (question.hint && currentAttempts >= options.showHintsAfterAttempt) {
        const hintArea = document.getElementById(`hint-${question.id}`);
        if (hintArea) {
          hintArea.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
          hintArea.style.display = 'block';
        }
      }

      if (currentAttempts >= options.maxRetries) {
        selects.forEach(select => {
          const blankId = select.getAttribute('data-blank-id');
          const blank = blanks[blankId];
          select.value = blank.correct;
          select.classList.remove('activity-fill__select--incorrect');
          select.classList.add('activity-fill__select--correct');
          select.disabled = true;
        });
        checkBtn.style.display = 'none';
      }
    }

    options.response = {
      answer: answers,
      attempts: currentAttempts,
      correct: allCorrect,
      skipped: false
    };
    options.onAnswer(answers, allCorrect);
    updateQuestionStatus(question.id, options.response);
  }

  // ============================================
  // Match Following (Tap to Select)
  // ============================================

  function renderMatchFollowing(question, options) {
    const container = createElement('div', 'activity-question__content activity-match');

    const prompt = createElement('p', 'activity-question__prompt', question.prompt);
    container.appendChild(prompt);

    const pairs = question.pairs || [];
    const leftItems = pairs.map((p, i) => ({ text: p.left, index: i }));
    const rightItems = pairs.map((p, i) => ({ text: p.right, index: i }));

    // Shuffle right items if specified
    const shuffledRight = question.shuffleRight !== false ? shuffleArray(rightItems) : rightItems;

    // Track matches
    const matches = options.response?.answer ? { ...options.response.answer } : {};
    let selectedLeft = null;

    const matchContainer = createElement('div', 'activity-match__container');

    // Left column
    const leftCol = createElement('div', 'activity-match__column activity-match__column--left');
    leftItems.forEach(item => {
      const btn = createElement('button', 'activity-match__item activity-match__item--left');
      btn.setAttribute('data-index', item.index);
      btn.textContent = item.text;

      // Mark if already matched
      if (matches[item.index] !== undefined) {
        btn.classList.add('activity-match__item--matched');
      }

      btn.addEventListener('click', () => {
        if (options.response?.correct) return;

        // Deselect others
        leftCol.querySelectorAll('.activity-match__item').forEach(b => b.classList.remove('activity-match__item--selected'));

        // Select this one
        btn.classList.add('activity-match__item--selected');
        selectedLeft = item.index;
      });

      leftCol.appendChild(btn);
    });

    // Right column
    const rightCol = createElement('div', 'activity-match__column activity-match__column--right');
    shuffledRight.forEach(item => {
      const btn = createElement('button', 'activity-match__item activity-match__item--right');
      btn.setAttribute('data-index', item.index);
      btn.textContent = item.text;

      // Mark if already matched
      const matchedTo = Object.entries(matches).find(([k, v]) => v === item.index);
      if (matchedTo) {
        btn.classList.add('activity-match__item--matched');
      }

      btn.addEventListener('click', () => {
        if (options.response?.correct) return;
        if (selectedLeft === null) {
          alert('First select an item from the left column.');
          return;
        }

        // Create match
        matches[selectedLeft] = item.index;

        // Update UI
        const leftBtn = leftCol.querySelector(`[data-index="${selectedLeft}"]`);
        leftBtn.classList.remove('activity-match__item--selected');
        leftBtn.classList.add('activity-match__item--matched');
        btn.classList.add('activity-match__item--matched');

        selectedLeft = null;

        // Update stored response
        options.response = {
          answer: { ...matches },
          attempts: options.response?.attempts || 0,
          correct: null,
          skipped: false
        };
      });

      rightCol.appendChild(btn);
    });

    matchContainer.appendChild(leftCol);
    matchContainer.appendChild(rightCol);
    container.appendChild(matchContainer);

    // Check button
    const checkBtn = createElement('button', 'activity-match__check', 'Check Matches');

    if (options.response?.correct) {
      checkBtn.style.display = 'none';
    }

    checkBtn.addEventListener('click', () => {
      handleMatchCheck(question, matches, leftCol, rightCol, options, checkBtn);
    });

    container.appendChild(checkBtn);

    // Clear button
    const clearBtn = createElement('button', 'activity-match__clear', 'Clear Matches');
    if (options.response?.correct) {
      clearBtn.style.display = 'none';
    }
    clearBtn.addEventListener('click', () => {
      Object.keys(matches).forEach(k => delete matches[k]);
      leftCol.querySelectorAll('.activity-match__item').forEach(b => {
        b.classList.remove('activity-match__item--matched', 'activity-match__item--correct', 'activity-match__item--incorrect');
      });
      rightCol.querySelectorAll('.activity-match__item').forEach(b => {
        b.classList.remove('activity-match__item--matched', 'activity-match__item--correct', 'activity-match__item--incorrect');
      });
    });
    container.appendChild(clearBtn);

    // Hint area
    const hintArea = createElement('div', 'activity-question__hint', '');
    hintArea.id = `hint-${question.id}`;
    hintArea.style.display = 'none';
    container.appendChild(hintArea);

    // Skip button
    const skipBtn = createElement('button', 'activity-question__skip', 'Skip this question');
    if (options.response?.correct || options.response?.skipped) {
      skipBtn.style.display = 'none';
    }
    skipBtn.addEventListener('click', () => {
      if (options.onSkip()) {
        skipBtn.style.display = 'none';
        updateQuestionStatus(question.id, { skipped: true });
      }
    });
    container.appendChild(skipBtn);

    return container;
  }

  function handleMatchCheck(question, matches, leftCol, rightCol, options, checkBtn) {
    const pairs = question.pairs || [];

    // Check if all items are matched
    if (Object.keys(matches).length !== pairs.length) {
      alert('Please match all items before checking.');
      return;
    }

    let allCorrect = true;

    // Check each match - correct match is when left index matches right index
    Object.entries(matches).forEach(([leftIndex, rightIndex]) => {
      const leftBtn = leftCol.querySelector(`[data-index="${leftIndex}"]`);
      const rightBtn = rightCol.querySelector(`[data-index="${rightIndex}"]`);

      // Correct if leftIndex === rightIndex (they were originally paired)
      const isCorrect = parseInt(leftIndex) === parseInt(rightIndex);

      if (isCorrect) {
        leftBtn.classList.add('activity-match__item--correct');
        rightBtn.classList.add('activity-match__item--correct');
      } else {
        leftBtn.classList.add('activity-match__item--incorrect');
        rightBtn.classList.add('activity-match__item--incorrect');
        allCorrect = false;
      }
    });

    const currentAttempts = (options.response?.attempts || 0) + 1;

    if (allCorrect) {
      checkBtn.style.display = 'none';
      const clearBtn = checkBtn.nextElementSibling;
      if (clearBtn) clearBtn.style.display = 'none';
      const skipBtn = checkBtn.closest('.activity-question__content').querySelector('.activity-question__skip');
      if (skipBtn) skipBtn.style.display = 'none';
    } else {
      // Show hint after threshold
      if (question.hint && currentAttempts >= options.showHintsAfterAttempt) {
        const hintArea = document.getElementById(`hint-${question.id}`);
        if (hintArea) {
          hintArea.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
          hintArea.style.display = 'block';
        }
      }

      // Show correct answers after max attempts
      if (currentAttempts >= options.maxRetries) {
        // Clear incorrect highlights and show correct matches
        leftCol.querySelectorAll('.activity-match__item').forEach((btn, i) => {
          btn.classList.remove('activity-match__item--incorrect');
          btn.classList.add('activity-match__item--correct');
        });
        rightCol.querySelectorAll('.activity-match__item').forEach(btn => {
          btn.classList.remove('activity-match__item--incorrect');
          btn.classList.add('activity-match__item--correct');
        });
        checkBtn.style.display = 'none';
        const clearBtn = checkBtn.nextElementSibling;
        if (clearBtn) clearBtn.style.display = 'none';
      }
    }

    options.response = {
      answer: { ...matches },
      attempts: currentAttempts,
      correct: allCorrect,
      skipped: false
    };
    options.onAnswer(matches, allCorrect);
    updateQuestionStatus(question.id, options.response);
  }

  // ============================================
  // Public API
  // ============================================

  return {
    renderQuestion,
    updateQuestionStatus
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActivityComponents;
}
