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
 * Links should have data-assignment="assignment-key" attribute
 * @param {Object} config - The course config object (CST395_CONFIG or CST349_CONFIG)
 */
function populateAssignmentLinks(config) {
  const links = document.querySelectorAll('[data-assignment]');

  links.forEach(link => {
    const key = link.getAttribute('data-assignment');
    const assignment = config.assignments[key];

    if (!assignment) {
      console.warn(`Assignment not found in config: ${key}`);
      return;
    }

    // Build Canvas URL
    const url = `${config.canvasBaseUrl}/assignments/${assignment.canvasId}`;
    link.href = url;

    // Open in parent frame (Canvas) not iframe
    link.target = '_parent';

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
            <a href="${url}" target="_parent">${item.title}</a>
          </span>
        </div>
        <span class="due-item__date">${formatDate(item.dueDate)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Update status banner with current position
 * @param {Object} config - The course config object
 */
function updateStatusBanner(config) {
  const currentWeek = typeof getEffectiveCurrentWeek === 'function'
    ? getEffectiveCurrentWeek()
    : getCurrentWeekFromConfig(config);

  if (!currentWeek) return;

  const weekData = config.weekDates[currentWeek];
  if (!weekData) return;

  const sprintData = config.sprints[weekData.sprint];
  if (!sprintData) return;

  // Update title
  const titleEl = document.getElementById('status-title');
  if (titleEl) {
    titleEl.textContent = `Sprint ${weekData.sprint}: ${sprintData.name} • Week ${currentWeek}`;
  }

  // Update subtitle
  const subtitleEl = document.getElementById('status-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = weekData.title;
  }

  // Update progress
  const progressNumEl = document.getElementById('status-progress-num');
  if (progressNumEl) {
    progressNumEl.textContent = `${currentWeek}/16`;
  }

  // Update progress bar
  const progressBar = document.getElementById('status-progress-bar');
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

  // Update dynamic content
  const currentWeek = typeof getEffectiveCurrentWeek === 'function'
    ? getEffectiveCurrentWeek()
    : getCurrentWeekFromConfig(config);

  if (currentWeek) {
    updateStatusBanner(config);
    renderDueThisWeek(config, currentWeek, 'due-this-week');
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
