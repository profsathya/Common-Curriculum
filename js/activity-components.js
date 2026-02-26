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

    // Render optional info block above the question
    if (question.infoBlock) {
      const infoEl = createElement('div', 'activity-question__info-block');
      infoEl.innerHTML = question.infoBlock;
      wrapper.appendChild(infoEl);
    }

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
      case 'ai-discussion':
        content = renderAiDiscussion(question, options);
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
  // AI Discussion — prompt building & response parsing
  // ============================================

  function buildDiscussionSystemPrompt(course, questionCount) {
    return `You are a peer discussion facilitator for a university course${course ? ` (${course})` : ''}. Your role is to help students have deeper conversations about their reflections and work.

Given a student's written response to a prompt, generate exactly ${questionCount} follow-up discussion questions. These questions will be used by a PARTNER who will ask them to the AUTHOR of the response in a face-to-face conversation.

Guidelines for generating questions:
- First, check if the response actually addresses the original prompt. If it doesn't, your observation should note this and at least one question should gently redirect — e.g., "The prompt asked about X, but your response focused on Y. Can you walk me through how those connect?"
- Questions should probe deeper into the student's thinking, not quiz them
- Ask "why" and "how" questions that encourage elaboration
- Challenge assumptions gently — "What if..." or "Have you considered..."
- Connect to concrete experiences — "Can you give me an example of..."
- Avoid yes/no questions
- Each question should explore a different angle of the response
- Keep questions conversational and natural, not academic or stiff
- Questions should be ones a thoughtful peer would ask, not a professor

Also provide a brief observation (1-2 sentences) about a strength or interesting aspect of the response that the partner can use to open the conversation positively.

Respond in this exact JSON format:
{
  "questions": ["Question 1?", "Question 2?", "Question 3?"],
  "observation": "Brief positive observation about the response."
}`;
  }

  function buildDiscussionUserMessage(prompt, responseText, context, questionCount) {
    return `Original prompt the student was responding to:
"${prompt}"

${context ? `Activity context: ${context}\n\n` : ''}Student's written response:
"${responseText}"

Generate ${questionCount} discussion questions for the partner to ask.`;
  }

  function parseDiscussionJson(rawText) {
    // Claude sometimes wraps JSON in markdown code blocks
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch { /* fall through */ }
    // Fallback: use the raw text as a single question
    return {
      questions: [rawText.trim()],
      observation: 'Here are some thoughts on this response.',
    };
  }

  // ============================================
  // AI Discussion (Enter → AI Questions → Discuss → Summarize)
  // ============================================

  function renderAiDiscussion(question, options) {
    const container = createElement('div', 'activity-question__content activity-ai-discussion');
    const themeClass = options.courseTheme === 'cst349' ? 'indigo' : 'teal';

    // Phase tracking via response state
    // options.response is { answer: {..., phase}, attempts, correct, skipped }
    const savedData = options.response?.answer || {};
    const currentPhase = savedData.phase || 'enter';

    // --- Prompt ---
    const prompt = createElement('p', 'activity-question__prompt', question.prompt);
    container.appendChild(prompt);

    if (question.partnerInstructions) {
      const instructions = createElement('div', 'activity-ai-discussion__instructions');
      instructions.innerHTML = `<strong>Partner instructions:</strong> ${question.partnerInstructions}`;
      container.appendChild(instructions);
    }

    // --- Phase 1: Enter the paper response ---
    const enterPhase = createElement('div', 'activity-ai-discussion__phase activity-ai-discussion__phase--enter');
    enterPhase.id = `ai-enter-${question.id}`;

    // Optional: question selector dropdown (for "choose 1 of N" prompts)
    let selectedPromptText = question.prompt;
    if (question.questionOptions && question.questionOptions.length > 0) {
      const selectorWrapper = createElement('div', 'activity-ai-discussion__selector');
      const selectorLabel = createElement('label', 'activity-ai-discussion__selector-label',
        question.selectorLabel || 'Which question is your partner responding to?');
      selectorLabel.setAttribute('for', `ai-selector-${question.id}`);
      selectorWrapper.appendChild(selectorLabel);

      const selector = document.createElement('select');
      selector.className = 'activity-ai-discussion__selector-dropdown';
      selector.id = `ai-selector-${question.id}`;

      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Select a question...';
      selector.appendChild(defaultOpt);

      question.questionOptions.forEach((opt, i) => {
        const optEl = document.createElement('option');
        optEl.value = i;
        optEl.textContent = opt;
        selector.appendChild(optEl);
      });

      // Restore saved selection
      if (savedData.selectedOption !== undefined && savedData.selectedOption !== null) {
        selector.value = savedData.selectedOption;
        selectedPromptText = question.questionOptions[savedData.selectedOption] || question.prompt;
      }

      selector.addEventListener('change', () => {
        const idx = selector.value;
        if (idx !== '') {
          selectedPromptText = question.questionOptions[parseInt(idx)];
        }
      });

      selectorWrapper.appendChild(selector);
      enterPhase.appendChild(selectorWrapper);
    }

    const textarea = document.createElement('textarea');
    textarea.className = 'activity-open__textarea';
    textarea.placeholder = question.placeholder || 'Type your partner\'s written response here...';
    textarea.rows = 6;

    if (savedData.enteredResponse) {
      textarea.value = savedData.enteredResponse;
    }

    enterPhase.appendChild(textarea);

    // Character count
    const minLength = question.minLength || 50;
    const charCount = createElement('div', 'activity-open__charcount');
    charCount.innerHTML = `<span id="ai-charcount-${question.id}">${textarea.value.length}</span> characters (minimum ${minLength})`;
    enterPhase.appendChild(charCount);

    textarea.addEventListener('input', () => {
      const count = textarea.value.length;
      document.getElementById(`ai-charcount-${question.id}`).textContent = count;
      if (count < minLength) {
        charCount.classList.add('activity-open__charcount--insufficient');
      } else {
        charCount.classList.remove('activity-open__charcount--insufficient');
      }
    });

    // Generate questions button
    const generateBtn = createElement('button', 'activity-ai-discussion__generate-btn');
    generateBtn.innerHTML = (question.generateButtonText || 'Get Discussion Questions') + ' &rarr;';
    generateBtn.addEventListener('click', () => {
      // Validate dropdown selection if question options exist
      if (question.questionOptions && question.questionOptions.length > 0) {
        const selector = document.getElementById(`ai-selector-${question.id}`);
        if (selector && selector.value === '') {
          alert('Please select which question your partner is responding to.');
          return;
        }
      }
      const text = textarea.value.trim();
      if (text.length < minLength) {
        alert(`Please enter at least ${minLength} characters before generating discussion questions.`);
        return;
      }
      // Pass the selected prompt (from dropdown or the default prompt)
      const effectivePrompt = selectedPromptText;
      handleAiGenerate(question, text, options, container, effectivePrompt, savedData);
    });
    enterPhase.appendChild(generateBtn);

    container.appendChild(enterPhase);

    // --- Phase 2: AI-generated discussion questions ---
    const discussPhase = createElement('div', 'activity-ai-discussion__phase activity-ai-discussion__phase--discuss');
    discussPhase.id = `ai-discuss-${question.id}`;
    discussPhase.style.display = (currentPhase === 'discuss' || currentPhase === 'summarize') ? 'block' : 'none';

    // Observation bubble
    const observationEl = createElement('div', 'activity-ai-discussion__observation');
    observationEl.id = `ai-observation-${question.id}`;
    if (savedData.observation) {
      observationEl.innerHTML = `<strong>Opening thought:</strong> ${savedData.observation}`;
    }
    discussPhase.appendChild(observationEl);

    // Questions list
    const questionsList = createElement('div', 'activity-ai-discussion__questions-list');
    questionsList.id = `ai-questions-list-${question.id}`;
    if (savedData.aiQuestions) {
      savedData.aiQuestions.forEach((q, i) => {
        const qEl = createElement('div', 'activity-ai-discussion__question-item');
        qEl.innerHTML = `<span class="activity-ai-discussion__question-number">${i + 1}</span><span>${q}</span>`;
        questionsList.appendChild(qEl);
      });
    }
    discussPhase.appendChild(questionsList);

    const discussPrompt = createElement('p', 'activity-ai-discussion__discuss-prompt',
      question.discussionPrompt || 'Take a few minutes to discuss these questions face-to-face with the author. When you\'re done, summarize below.');
    discussPhase.appendChild(discussPrompt);

    container.appendChild(discussPhase);

    // --- Loading state ---
    const loadingEl = createElement('div', 'activity-ai-discussion__loading');
    loadingEl.id = `ai-loading-${question.id}`;
    loadingEl.style.display = 'none';
    loadingEl.innerHTML = `
      <div class="activity-ai-discussion__spinner"></div>
      <p>${question.loadingText || 'Generating discussion questions...'}</p>
    `;
    container.appendChild(loadingEl);

    // --- Error state ---
    const errorEl = createElement('div', 'activity-ai-discussion__error');
    errorEl.id = `ai-error-${question.id}`;
    errorEl.style.display = 'none';
    container.appendChild(errorEl);

    // --- Phase 3: Discussion summary ---
    const summaryPhase = createElement('div', 'activity-ai-discussion__phase activity-ai-discussion__phase--summarize');
    summaryPhase.id = `ai-summarize-${question.id}`;
    summaryPhase.style.display = (currentPhase === 'discuss' || currentPhase === 'summarize') ? 'block' : 'none';

    const summaryLabel = createElement('label', 'activity-ai-discussion__summary-label', question.summaryLabel || 'Discussion Summary');
    summaryPhase.appendChild(summaryLabel);

    const summaryTextarea = document.createElement('textarea');
    summaryTextarea.className = 'activity-open__textarea activity-ai-discussion__summary-textarea';
    summaryTextarea.placeholder = question.summaryPlaceholder || 'What were the key insights from your discussion? What surprised you? What did the author learn from the questions?';
    summaryTextarea.rows = 5;
    summaryTextarea.id = `ai-summary-textarea-${question.id}`;

    if (savedData.discussionSummary) {
      summaryTextarea.value = savedData.discussionSummary;
    }
    summaryPhase.appendChild(summaryTextarea);

    const saveBtnText = question.saveButtonText || 'Save Discussion Summary';
    const updateBtnText = question.updateButtonText || 'Update Summary';
    const saveBtn = createElement('button', 'activity-open__save', savedData.discussionSummary ? updateBtnText : saveBtnText);

    // --- Dig Deeper button (shown after first save) ---
    const digDeeperBtn = createElement('button', 'activity-ai-discussion__dig-deeper-btn');
    digDeeperBtn.innerHTML = (question.digDeeperText || 'Dig deeper with AI guidance') + ' &rarr;';
    digDeeperBtn.style.display = 'none';

    // Iteration counter display
    const iterationInfo = createElement('div', 'activity-ai-discussion__iteration-info');
    iterationInfo.id = `ai-iteration-info-${question.id}`;
    const currentIterations = savedData.iterations || 0;
    if (currentIterations > 1) {
      iterationInfo.textContent = `${currentIterations} rounds of AI guidance completed`;
      iterationInfo.style.display = 'block';
    } else {
      iterationInfo.style.display = 'none';
    }

    // Show dig deeper button if already saved
    if (currentPhase === 'summarize' && savedData.discussionSummary) {
      digDeeperBtn.style.display = 'inline-block';
    }

    saveBtn.addEventListener('click', () => {
      const summary = summaryTextarea.value.trim();
      if (summary.length < 30) {
        alert('Please write at least a brief summary of your discussion (minimum 30 characters).');
        return;
      }

      const fullAnswer = {
        enteredResponse: savedData.enteredResponse || textarea.value.trim(),
        selectedOption: savedData.selectedOption ?? null,
        selectedPrompt: savedData.selectedPrompt || question.prompt,
        aiQuestions: savedData.aiQuestions || [],
        observation: savedData.observation || '',
        discussionSummary: summary,
        iterations: savedData.iterations || 1,
        phase: 'summarize',
      };

      savedData.discussionSummary = summary;
      savedData.phase = 'summarize';
      if (!savedData.iterations) savedData.iterations = 1;

      options.response = {
        answer: fullAnswer,
        attempts: 1,
        correct: null,
        skipped: false,
      };
      options.onAnswer(fullAnswer, null);
      updateQuestionStatus(question.id, { answer: fullAnswer, attempts: 1, correct: null, skipped: false });

      saveBtn.textContent = 'Saved \u2713';
      setTimeout(() => { saveBtn.textContent = updateBtnText; }, 2000);

      // Show dig deeper button after saving
      digDeeperBtn.style.display = 'inline-block';
    });
    summaryPhase.appendChild(saveBtn);

    digDeeperBtn.addEventListener('click', () => {
      const summaryText = summaryTextarea.value.trim();
      if (summaryText.length < 30) {
        alert('Please write or update your response before digging deeper (minimum 30 characters).');
        return;
      }
      handleAiIterate(question, summaryText, options, container, savedData, digDeeperBtn, iterationInfo);
    });
    summaryPhase.appendChild(digDeeperBtn);
    summaryPhase.appendChild(iterationInfo);

    container.appendChild(summaryPhase);

    // --- If already in discuss/summarize phase, keep textarea and button editable so student can update and regenerate ---
    if (currentPhase === 'discuss' || currentPhase === 'summarize') {
      generateBtn.innerHTML = (question.generateButtonText || 'Get Discussion Questions') + ' (update) &rarr;';
    }

    return container;
  }

  async function handleAiGenerate(question, responseText, options, container, effectivePrompt, savedData) {
    const loadingEl = document.getElementById(`ai-loading-${question.id}`);
    const errorEl = document.getElementById(`ai-error-${question.id}`);
    const enterPhase = document.getElementById(`ai-enter-${question.id}`);
    const discussPhase = document.getElementById(`ai-discuss-${question.id}`);
    const summaryPhase = document.getElementById(`ai-summarize-${question.id}`);

    // Show loading, hide error
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';

    // Disable the generate button
    const generateBtn = enterPhase.querySelector('.activity-ai-discussion__generate-btn');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
    }

    // Get the AI endpoint from the activity config
    const aiEndpoint = question.aiEndpoint ||
      options.aiEndpoint ||
      '/.netlify/functions/ai-proxy';

    const course = options.courseTheme === 'cst349' ? 'CST349' : 'CST395';
    const questionCount = question.numQuestions || 3;
    const prompt = effectivePrompt || question.prompt;

    try {
      const fetchResponse = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildDiscussionSystemPrompt(course, questionCount),
          messages: [{ role: 'user', content: buildDiscussionUserMessage(prompt, responseText, question.aiContext || '', questionCount) }],
          max_tokens: 512,
        }),
      });

      if (!fetchResponse.ok) {
        const errData = await fetchResponse.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${fetchResponse.status})`);
      }

      const raw = await fetchResponse.json();
      const data = parseDiscussionJson(raw.content);

      // Hide loading
      loadingEl.style.display = 'none';

      // Populate the discussion phase
      const observationEl = document.getElementById(`ai-observation-${question.id}`);
      if (observationEl && data.observation) {
        observationEl.innerHTML = `<strong>Opening thought:</strong> ${escapeHtml(data.observation)}`;
      }

      const questionsList = document.getElementById(`ai-questions-list-${question.id}`);
      questionsList.innerHTML = '';
      data.questions.forEach((q, i) => {
        const qEl = createElement('div', 'activity-ai-discussion__question-item');
        qEl.innerHTML = `<span class="activity-ai-discussion__question-number">${i + 1}</span><span>${escapeHtml(q)}</span>`;
        questionsList.appendChild(qEl);
      });

      // Show discuss and summary phases
      discussPhase.style.display = 'block';
      summaryPhase.style.display = 'block';

      // Re-enable the entry textarea and button so student can edit and regenerate
      const textarea = enterPhase.querySelector('textarea');
      if (textarea) textarea.disabled = false;
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = (question.generateButtonText || 'Get Discussion Questions') + ' (update) &rarr;';
      }

      // Save intermediate state to localStorage so it survives page refresh
      const selectorEl = document.getElementById(`ai-selector-${question.id}`);
      const existingSummary = options.response?.answer?.discussionSummary || '';
      const existingIterations = options.response?.answer?.iterations || 0;
      const intermediateAnswer = {
        enteredResponse: responseText,
        selectedOption: selectorEl ? parseInt(selectorEl.value) : null,
        selectedPrompt: effectivePrompt || question.prompt,
        aiQuestions: data.questions,
        observation: data.observation || '',
        discussionSummary: existingSummary,
        iterations: existingIterations + 1,
        phase: 'discuss',
      };
      options.response = {
        answer: intermediateAnswer,
        attempts: 0,
        correct: null,
        skipped: false,
      };
      // Persist via onAnswer so state survives refresh
      options.onAnswer(intermediateAnswer, null);

      // Sync intermediateAnswer fields back to savedData so downstream
      // handlers (save button, dig deeper) see the correct values
      Object.assign(savedData, intermediateAnswer);

    } catch (error) {
      console.error('AI discussion error:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.innerHTML = `
        <p><strong>Could not generate questions.</strong> ${escapeHtml(error.message)}</p>
        <button class="activity-ai-discussion__retry-btn" onclick="this.parentElement.style.display='none'">Dismiss</button>
      `;

      // Re-enable the generate button
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Try Again &rarr;';
      }
    }
  }

  async function handleAiIterate(question, summaryText, options, container, savedData, digDeeperBtn, iterationInfo) {
    const loadingEl = document.getElementById(`ai-loading-${question.id}`);
    const errorEl = document.getElementById(`ai-error-${question.id}`);
    const currentIterations = savedData.iterations || 1;

    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    digDeeperBtn.disabled = true;
    digDeeperBtn.textContent = 'Generating...';

    const aiEndpoint = question.aiEndpoint ||
      options.aiEndpoint ||
      '/.netlify/functions/ai-proxy';

    const course = options.courseTheme === 'cst349' ? 'CST349' : 'CST395';
    const questionCount = question.numQuestions || 3;
    const iterContext = (question.aiContext || '') +
      '\n\nThis is iteration ' + (currentIterations + 1) + '. The student is refining their thinking. Push them to be more specific and go deeper.';

    try {
      const fetchResponse = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildDiscussionSystemPrompt(course, questionCount),
          messages: [{ role: 'user', content: buildDiscussionUserMessage(savedData.selectedPrompt || question.prompt, summaryText, iterContext, questionCount) }],
          max_tokens: 512,
        }),
      });

      if (!fetchResponse.ok) {
        const errData = await fetchResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed (' + fetchResponse.status + ')');
      }

      const raw = await fetchResponse.json();
      const data = parseDiscussionJson(raw.content);
      loadingEl.style.display = 'none';

      // Replace observation and questions
      const observationEl = document.getElementById(`ai-observation-${question.id}`);
      if (observationEl && data.observation) {
        observationEl.innerHTML = '<strong>Opening thought:</strong> ' + escapeHtml(data.observation);
      }

      const questionsList = document.getElementById(`ai-questions-list-${question.id}`);
      questionsList.innerHTML = '';
      data.questions.forEach(function(q, i) {
        const qEl = createElement('div', 'activity-ai-discussion__question-item');
        qEl.innerHTML = '<span class="activity-ai-discussion__question-number">' + (i + 1) + '</span><span>' + escapeHtml(q) + '</span>';
        questionsList.appendChild(qEl);
      });

      // Update savedData
      savedData.aiQuestions = data.questions;
      savedData.observation = data.observation || '';
      savedData.iterations = currentIterations + 1;

      // Save state — fall back to textarea DOM value if savedData.enteredResponse is stale
      const enterTextarea = document.querySelector(`#ai-enter-${question.id} textarea`);
      const fullAnswer = {
        enteredResponse: savedData.enteredResponse || (enterTextarea && enterTextarea.value.trim()) || '',
        selectedOption: savedData.selectedOption ?? null,
        selectedPrompt: savedData.selectedPrompt || question.prompt,
        aiQuestions: data.questions,
        observation: data.observation || '',
        discussionSummary: summaryText,
        iterations: currentIterations + 1,
        phase: 'summarize',
      };
      options.response = { answer: fullAnswer, attempts: 1, correct: null, skipped: false };
      options.onAnswer(fullAnswer, null);
      updateQuestionStatus(question.id, { answer: fullAnswer, attempts: 1, correct: null, skipped: false });

      // Sync fullAnswer back to savedData so subsequent iterations stay consistent
      Object.assign(savedData, fullAnswer);

      // Update iteration counter display
      iterationInfo.textContent = (currentIterations + 1) + ' rounds of AI guidance completed';
      iterationInfo.style.display = 'block';

      digDeeperBtn.disabled = false;
      digDeeperBtn.innerHTML = (question.digDeeperText || 'Dig deeper with AI guidance') + ' &rarr;';

    } catch (error) {
      console.error('AI iteration error:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.innerHTML =
        '<p><strong>Could not generate questions.</strong> ' + escapeHtml(error.message) + '</p>' +
        '<button class="activity-ai-discussion__retry-btn" onclick="this.parentElement.style.display=\'none\'">Dismiss</button>';
      digDeeperBtn.disabled = false;
      digDeeperBtn.innerHTML = (question.digDeeperText || 'Dig deeper with AI guidance') + ' &rarr;';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
