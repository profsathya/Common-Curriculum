/**
 * Shared Components JavaScript
 * For Canvas Course Pages
 */

// ============================================
// Collapsible Sections
// ============================================

/**
 * Initialize all collapsible sections on the page
 */
function initCollapsibles() {
  const headers = document.querySelectorAll('[data-collapse-toggle]');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-collapse-toggle');
      const content = document.getElementById(targetId);

      if (!content) {
        console.warn(`Collapse target not found: ${targetId}`);
        return;
      }

      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      // Toggle state
      header.setAttribute('aria-expanded', !isExpanded);
      content.classList.toggle('is-expanded');
    });
  });
}

/**
 * Expand a specific collapsible by its content ID
 * @param {string} contentId - The ID of the content element
 */
function expandCollapsible(contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;

  const header = document.querySelector(`[data-collapse-toggle="${contentId}"]`);
  if (header) {
    header.setAttribute('aria-expanded', 'true');
  }
  content.classList.add('is-expanded');
}

/**
 * Collapse a specific collapsible by its content ID
 * @param {string} contentId - The ID of the content element
 */
function collapseCollapsible(contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;

  const header = document.querySelector(`[data-collapse-toggle="${contentId}"]`);
  if (header) {
    header.setAttribute('aria-expanded', 'false');
  }
  content.classList.remove('is-expanded');
}

// ============================================
// Canvas Link Population
// ============================================

/**
 * Populate all assignment links on the page from config
 * Links should have data-assignment-key="assignment-key" attribute
 * @param {Object} config - The course config object (CST395_CONFIG or CST349_CONFIG)
 */
function populateAssignmentLinks(config) {
  const links = document.querySelectorAll('[data-assignment-key]');

  links.forEach(link => {
    const key = link.getAttribute('data-assignment-key');
    const assignment = config.assignments[key];

    if (!assignment) {
      console.warn(`Assignment not found in config: ${key}`);
      return;
    }

    // Build Canvas URL
    const url = `${config.canvasBaseUrl}/assignments/${assignment.canvasId}`;
    link.href = url;

    // Open in new tab (not inside iframe)
    link.target = '_blank';

    // Optionally set title if not already set
    if (!link.textContent.trim() && assignment.title) {
      link.textContent = assignment.title;
    }
  });
}

/**
 * Populate all due dates on the page from config
 * Elements should have data-due-date="assignment-key" attribute
 * @param {Object} config - The course config object
 */
function populateDueDates(config) {
  const elements = document.querySelectorAll('[data-due-date]');

  elements.forEach(element => {
    const key = element.getAttribute('data-due-date');
    const assignment = config.assignments[key];

    if (!assignment) {
      console.warn(`Assignment not found for due date: ${key}`);
      return;
    }

    element.textContent = formatDate(assignment.dueDate);
  });
}

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date like "Wed, Jan 22"
 */
function formatDate(dateString) {
  const date = new Date(dateString + 'T12:00:00'); // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================
// Current Week Highlighting
// ============================================

/**
 * Highlight the current week section and auto-expand it
 * @param {Object} config - The course config object
 */
function highlightCurrentWeek(config) {
  // Use test week if set, otherwise calculate from date
  const currentWeek = typeof getEffectiveCurrentWeek === 'function'
    ? getEffectiveCurrentWeek()
    : getCurrentWeekFromConfig(config);

  if (!currentWeek) {
    console.log('No current week found (outside semester dates)');
    return;
  }

  // Find the week section
  const weekSection = document.querySelector(`[data-week="${currentWeek}"]`);
  if (!weekSection) {
    console.log(`Week section not found for week ${currentWeek}`);
    return;
  }

  // Add current styling
  weekSection.classList.add('week-section--current');

  // Auto-expand this week
  const contentId = `week-${currentWeek}-content`;
  expandCollapsible(contentId);

  console.log(`Highlighted and expanded week ${currentWeek}`);
}

/**
 * Calculate current week from config dates
 * @param {Object} config - The course config object
 * @returns {number|null} Week number or null
 */
function getCurrentWeekFromConfig(config) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const [weekNum, dates] of Object.entries(config.weekDates)) {
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    end.setHours(23, 59, 59, 999);

    if (today >= start && today <= end) {
      return parseInt(weekNum);
    }
  }

  return null;
}

// ============================================
// Dynamic Content Generation
// ============================================

/**
 * Generate "Due This Week" items from config
 * @param {Object} config - The course config object
 * @param {number} weekNum - Week number to show
 * @param {string} containerId - ID of container element
 */
function renderDueThisWeek(config, weekNum, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const weekData = config.weekDates[weekNum];
  if (!weekData) {
    container.innerHTML = '<p class="text-gray-500">No assignments found for this week.</p>';
    return;
  }

  const start = new Date(weekData.start);
  const end = new Date(weekData.end);
  end.setHours(23, 59, 59, 999);

  // Find assignments due this week
  const dueItems = [];
  for (const [key, assignment] of Object.entries(config.assignments)) {
    const dueDate = new Date(assignment.dueDate + 'T12:00:00');
    if (dueDate >= start && dueDate <= end) {
      dueItems.push({ key, ...assignment });
    }
  }

  // Sort by due date
  dueItems.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (dueItems.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm);">No assignments due this week.</p>';
    return;
  }

  // Generate HTML
  const html = dueItems.map(item => {
    const url = `${config.canvasBaseUrl}/assignments/${item.canvasId}`;
    const dotClass = `due-item__dot--${item.type || 'assignment'}`;

    return `
      <div class="due-item">
        <div class="due-item__left">
          <span class="due-item__dot ${dotClass}"></span>
          <span class="due-item__title">
            <a href="${url}" target="_blank">${item.title}</a>
          </span>
        </div>
        <span class="due-item__date">${formatDate(item.dueDate)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Get assignments due in a specific week from config
 * Works with both CST349 and CST395 configs
 * @param {Object} config - The course config object
 * @param {number} weekNum - Week number
 * @returns {Array} Array of assignment objects with keys
 */
function getAssignmentsDueInWeekFromConfig(config, weekNum) {
  const weekData = config.weekDates[weekNum];
  if (!weekData) return [];

  const start = new Date(weekData.start);
  const end = new Date(weekData.end);
  end.setHours(23, 59, 59, 999);

  const assignments = [];
  for (const [key, assignment] of Object.entries(config.assignments)) {
    const dueDate = new Date(assignment.dueDate + 'T12:00:00');
    if (dueDate >= start && dueDate <= end) {
      assignments.push({ key, ...assignment });
    }
  }

  return assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Get the first assignment from the next week (for "Looking Ahead" feature)
 * @param {Object} config - The course config object
 * @param {number} currentWeekNum - Current week number
 * @returns {Object|null} First assignment from next week, or null
 */
function getFirstItemFromNextWeek(config, currentWeekNum) {
  const nextWeekNum = currentWeekNum + 1;
  if (nextWeekNum > 16) return null;

  const nextWeekAssignments = getAssignmentsDueInWeekFromConfig(config, nextWeekNum);
  return nextWeekAssignments.length > 0 ? nextWeekAssignments[0] : null;
}

/**
 * Render the "What You Should Be Learning" section with Looking Ahead
 * @param {Object} config - The course config object
 * @param {number} weekNum - Current week number
 * @param {string} containerId - ID of the container element for this week's items
 * @param {string} lookingAheadContainerId - ID of container for Looking Ahead card
 * @param {Object} localAssignmentUrls - Map of assignment keys to local HTML file URLs
 */
function renderWeeklyLearning(config, weekNum, containerId, lookingAheadContainerId, localAssignmentUrls) {
  const container = document.getElementById(containerId);
  if (!container) return;

  localAssignmentUrls = localAssignmentUrls || {};

  // Get this week's assignments
  const thisWeekItems = getAssignmentsDueInWeekFromConfig(config, weekNum);

  if (thisWeekItems.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm); padding: var(--space-2);">No assignments due this week.</p>';
  } else {
    // Render this week's items
    container.innerHTML = thisWeekItems.map(item => {
      const localUrl = localAssignmentUrls[item.key];
      const url = localUrl || `${config.canvasBaseUrl}/assignments/${item.canvasId}`;
      const dotClass = `due-item__dot--${item.type || 'assignment'}`;
      const displayTitle = item.title.replace(/^S\d+: /, '');

      return `
        <div class="due-item">
          <div class="due-item__left">
            <span class="due-item__dot ${dotClass}"></span>
            <span class="due-item__title">
              <a href="${url}" target="_blank">${displayTitle}</a>
            </span>
          </div>
          <span class="due-item__date">${formatDate(item.dueDate)}</span>
        </div>
      `;
    }).join('');
  }

  // Render Looking Ahead card
  const lookingAheadContainer = document.getElementById(lookingAheadContainerId);
  if (!lookingAheadContainer) return;

  const nextItem = getFirstItemFromNextWeek(config, weekNum);
  if (!nextItem) {
    lookingAheadContainer.style.display = 'none';
    return;
  }

  const nextWeekData = config.weekDates[weekNum + 1];
  const localUrl = localAssignmentUrls[nextItem.key];
  const url = localUrl || `${config.canvasBaseUrl}/assignments/${nextItem.canvasId}`;
  const displayTitle = nextItem.title.replace(/^S\d+: /, '');
  const dotClass = `due-item__dot--${nextItem.type || 'assignment'}`;

  lookingAheadContainer.innerHTML = `
    <button class="looking-ahead__header" data-collapse-toggle="looking-ahead-content" aria-expanded="false">
      <div class="looking-ahead__header-left">
        <span class="looking-ahead__icon">👀</span>
        <span class="looking-ahead__title">Looking Ahead: Week ${weekNum + 1}</span>
      </div>
      <span class="looking-ahead__toggle">+</span>
    </button>
    <div class="looking-ahead__content" id="looking-ahead-content">
      <p class="looking-ahead__subtitle">${nextWeekData?.title || 'Next Week'}</p>
      <div class="due-item">
        <div class="due-item__left">
          <span class="due-item__dot ${dotClass}"></span>
          <span class="due-item__title">
            <a href="${url}" target="_blank">${displayTitle}</a>
          </span>
        </div>
        <span class="due-item__date">${formatDate(nextItem.dueDate)}</span>
      </div>
    </div>
  `;

  lookingAheadContainer.style.display = 'block';

  // Initialize collapsible for looking ahead
  const lookingAheadHeader = lookingAheadContainer.querySelector('[data-collapse-toggle]');
  if (lookingAheadHeader) {
    lookingAheadHeader.addEventListener('click', () => {
      const contentId = lookingAheadHeader.getAttribute('data-collapse-toggle');
      const content = document.getElementById(contentId);
      if (!content) return;

      const isExpanded = lookingAheadHeader.getAttribute('aria-expanded') === 'true';
      lookingAheadHeader.setAttribute('aria-expanded', !isExpanded);
      content.classList.toggle('is-expanded');

      // Toggle the + / - icon
      const toggle = lookingAheadHeader.querySelector('.looking-ahead__toggle');
      if (toggle) {
        toggle.textContent = isExpanded ? '+' : '−';
      }
    });
  }
}

/**
 * Update status banner with current position
 * @param {Object} config - The course config object
 */
function updateStatusBanner(config) {
  const currentWeek = typeof getEffectiveCurrentWeek === 'function'
    ? getEffectiveCurrentWeek()
    : getCurrentWeekFromConfig(config);

  const titleEl = document.getElementById('status-title');
  const subtitleEl = document.getElementById('status-subtitle');
  const progressNumEl = document.getElementById('status-progress-num');
  const progressBar = document.getElementById('status-progress-bar');

  // Handle pre-semester or post-semester state
  if (!currentWeek) {
    const today = new Date();
    const week1Start = new Date(config.weekDates[1].start);
    const week16End = new Date(config.weekDates[16].end);

    if (today < week1Start) {
      // Before semester starts
      if (titleEl) titleEl.textContent = 'Course Starting Soon';
      if (subtitleEl) subtitleEl.textContent = `Week 1 begins ${formatDate(config.weekDates[1].start)}`;
      if (progressNumEl) progressNumEl.textContent = '0/16';
      if (progressBar) progressBar.style.width = '0%';
    } else if (today > week16End) {
      // After semester ends
      if (titleEl) titleEl.textContent = 'Course Complete';
      if (subtitleEl) subtitleEl.textContent = 'Congratulations on finishing the journey!';
      if (progressNumEl) progressNumEl.textContent = '16/16';
      if (progressBar) progressBar.style.width = '100%';
    }
    return;
  }

  const weekData = config.weekDates[currentWeek];
  if (!weekData) return;

  const sprintData = config.sprints[weekData.sprint];
  if (!sprintData) return;

  // Update title
  if (titleEl) {
    titleEl.textContent = `Sprint ${weekData.sprint}: ${sprintData.name} • Week ${currentWeek}`;
  }

  // Update subtitle
  if (subtitleEl) {
    subtitleEl.textContent = weekData.title;
  }

  // Update progress
  if (progressNumEl) {
    progressNumEl.textContent = `${currentWeek}/16`;
  }

  // Update progress bar
  if (progressBar) {
    const percent = (currentWeek / 16) * 100;
    progressBar.style.width = `${percent}%`;
  }
}

// ============================================
// Page Initialization
// ============================================

/**
 * Initialize a course home page
 * @param {Object} config - The course config object
 */
function initHomePage(config) {
  // Initialize collapsibles
  initCollapsibles();

  // Populate Canvas links
  populateAssignmentLinks(config);
  populateDueDates(config);

  // Always update status banner (handles pre/post semester)
  updateStatusBanner(config);

  // Update dynamic content
  const currentWeek = typeof getEffectiveCurrentWeek === 'function'
    ? getEffectiveCurrentWeek()
    : getCurrentWeekFromConfig(config);

  if (currentWeek) {
    renderDueThisWeek(config, currentWeek, 'due-this-week');
  } else {
    // Pre or post semester - show appropriate message
    const dueContainer = document.getElementById('due-this-week');
    if (dueContainer) {
      const today = new Date();
      const week1Start = new Date(config.weekDates[1].start);

      if (today < week1Start) {
        dueContainer.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm); padding: var(--space-2);">Course begins ' + formatDate(config.weekDates[1].start) + '. Check back then for assignments!</p>';
      } else {
        dueContainer.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm); padding: var(--space-2);">No assignments - course has concluded.</p>';
      }
    }
  }

  console.log('Home page initialized');
}

/**
 * Initialize a sprint page
 * @param {Object} config - The course config object
 */
function initSprintPage(config) {
  // Initialize collapsibles
  initCollapsibles();

  // Populate Canvas links
  populateAssignmentLinks(config);
  populateDueDates(config);

  // Highlight current week
  highlightCurrentWeek(config);

  console.log('Sprint page initialized');
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if we're running inside an iframe
 * @returns {boolean}
 */
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access top, we're probably in an iframe
  }
}

/**
 * Add demo banner if not in iframe (for testing outside Canvas)
 */
function addDemoBannerIfNeeded() {
  if (!isInIframe()) {
    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.innerHTML = `
      <strong>Demo Mode</strong>
      You're viewing this page directly. In Canvas, this will be embedded via iframe.
      Canvas assignment links will open in new tabs instead of navigating Canvas.
    `;

    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
  }
}

// ============================================
// Class Recording (Loom) Links
// ============================================

/**
 * Populate all Loom video links on the page from config
 * Elements should have data-loom="week-number" attribute
 * @param {Object} config - The course config object
 */
function populateLoomLinks(config) {
  const elements = document.querySelectorAll('[data-loom]');

  elements.forEach(container => {
    const weekNum = parseInt(container.getAttribute('data-loom'));
    const loomUrl = config.loomVideos ? config.loomVideos[weekNum] : null;

    const linkEl = container.querySelector('.class-recording__link');
    const noRecordingEl = container.querySelector('.class-recording__no-recording');

    if (loomUrl) {
      // Has video - show link, hide message
      container.classList.add('class-recording--has-video');
      if (linkEl) {
        linkEl.href = loomUrl;
        linkEl.target = '_blank';
        linkEl.style.display = 'inline';
      }
      if (noRecordingEl) {
        noRecordingEl.style.display = 'none';
      }
    } else {
      // No video - hide link, show message
      container.classList.remove('class-recording--has-video');
      if (linkEl) {
        linkEl.style.display = 'none';
      }
      if (noRecordingEl) {
        noRecordingEl.style.display = 'inline';
      }
    }
  });
}

/**
 * Initialize a sprint page with Loom support
 * @param {Object} config - The course config object
 */
function initSprintPageWithLoom(config) {
  // Initialize collapsibles
  initCollapsibles();

  // Populate Canvas links
  populateAssignmentLinks(config);
  populateDueDates(config);

  // Populate Loom links
  populateLoomLinks(config);

  // Highlight current week
  highlightCurrentWeek(config);

  console.log('Sprint page initialized with Loom support');
}
