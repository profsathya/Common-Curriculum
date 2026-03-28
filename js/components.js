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
  const resolved = getResolvedCurrentWeek(config);
  const currentWeek = resolved.week;

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
  return getResolvedCurrentWeek(config).week;
}

/**
 * Resolve the current week, never returning null after semester starts.
 *
 * Rule 1: Never return null after the semester has started. If today falls
 *         between defined weeks (spring break, weekend gaps), return the
 *         most recent week whose start date has passed.
 * Rule 2: "Current week" = last week whose start date <= today.
 *
 * @param {Object} config - The course config object
 * @param {Date} [overrideDate] - Optional date override (for date simulator)
 * @returns {{ week: number|null, isGap: boolean, gapMessage: string|null }}
 */
function getResolvedCurrentWeek(config, overrideDate) {
  const today = overrideDate || getSimulatedDate() || new Date();
  today.setHours(12, 0, 0, 0); // Noon to avoid timezone edge cases

  const weeks = Object.entries(config.weekDates)
    .map(([num, data]) => ({
      num: parseInt(num),
      start: new Date(data.start + 'T00:00:00'),
      end: new Date(data.end + 'T23:59:59.999'),
      data
    }))
    .sort((a, b) => a.num - b.num);

  if (weeks.length === 0) return { week: null, isGap: false, gapMessage: null };

  // Before semester
  if (today < weeks[0].start) {
    return { week: null, isGap: false, gapMessage: null };
  }

  // After semester
  if (today > weeks[weeks.length - 1].end) {
    return { week: weeks[weeks.length - 1].num, isGap: false, gapMessage: null };
  }

  // Check if today is within a defined week range
  for (const w of weeks) {
    if (today >= w.start && today <= w.end) {
      return { week: w.num, isGap: false, gapMessage: null };
    }
  }

  // We're in a gap — find the most recent week whose start has passed
  let lastPassed = null;
  let nextWeek = null;
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].start <= today) {
      lastPassed = weeks[i];
    } else {
      nextWeek = weeks[i];
      break;
    }
  }

  if (!lastPassed) {
    return { week: null, isGap: false, gapMessage: null };
  }

  // Build gap message
  let gapMessage = null;
  if (nextWeek) {
    const nextStart = nextWeek.start;
    const formatted = nextStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    gapMessage = `Break \u2014 Week ${nextWeek.num} starts ${formatted}`;
  }

  return { week: lastPassed.num, isGap: true, gapMessage };
}

// ============================================
// Date Simulator
// ============================================

/**
 * Read a simulated date from the URL hash.
 * Format: #testDate=2026-03-31
 * @returns {Date|null}
 */
function getSimulatedDate() {
  var hash = window.location.hash;
  var match = hash.match(/testDate=(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1] + 'T12:00:00');
  }
  return null;
}

/**
 * Initialize the hidden date simulator overlay.
 * Toggle with Alt+Shift+D.
 */
function initDateSimulator() {
  // Create overlay element
  var overlay = document.createElement('div');
  overlay.id = 'date-simulator';
  overlay.style.cssText = 'position:fixed;bottom:12px;right:12px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:12px;color:#6b7280;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.1);display:none;font-family:system-ui,sans-serif;';

  var simDate = getSimulatedDate();
  var label = simDate
    ? 'Simulating: ' + simDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Live';

  overlay.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;">' +
      '<span style="font-weight:600;">' + label + '</span>' +
      '<input type="date" id="sim-date-input" style="font-size:12px;border:1px solid #d1d5db;border-radius:4px;padding:2px 4px;"' +
        (simDate ? ' value="' + simDate.toISOString().slice(0, 10) + '"' : '') + '>' +
      '<button id="sim-date-reset" style="font-size:11px;padding:2px 8px;border:1px solid #d1d5db;border-radius:4px;background:white;cursor:pointer;">Reset</button>' +
    '</div>';

  document.body.appendChild(overlay);

  // Wire up events
  var input = document.getElementById('sim-date-input');
  var resetBtn = document.getElementById('sim-date-reset');

  input.addEventListener('change', function() {
    if (input.value) {
      window.location.hash = 'testDate=' + input.value;
      window.location.reload();
    }
  });

  resetBtn.addEventListener('click', function() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.location.reload();
  });

  // Toggle visibility with Alt+Shift+D (no browser conflicts)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'd' || e.key === 'D') {
      if (e.altKey && e.shiftKey) {
        e.preventDefault();
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
}

// ============================================
// Sprint Briefing (Zone B)
// ============================================

/**
 * Get assignment groups for Zone B rendering.
 * @param {Object} config - Course config
 * @param {number} weekNum - Current week number
 * @param {Date} [todayDate] - Optional date override
 * @returns {{ stillDue: Array, thisWeek: Array, comingUp: Array }}
 */
function getAssignmentGroups(config, weekNum, todayDate) {
  var today = todayDate || getSimulatedDate() || new Date();
  today.setHours(12, 0, 0, 0);

  var twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  var sevenDaysOut = new Date(today);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

  var weekData = config.weekDates[weekNum];
  var currentSprint = weekData ? weekData.sprint : null;

  var stillDue = [];
  var thisWeek = [];
  var comingUp = [];

  for (var key in config.assignments) {
    var a = config.assignments[key];
    if (!a.dueDate) continue;
    var due = new Date(a.dueDate + 'T23:59:59');
    var aWeek = a.week || 0;
    var aSprint = a.sprint || 0;

    // Only consider assignments in the current sprint
    if (currentSprint && aSprint !== currentSprint) continue;

    if (aWeek === weekNum) {
      thisWeek.push({ key: key, dueDate: a.dueDate, title: a.title, type: a.type, htmlFile: a.htmlFile, canvasId: a.canvasId, briefing: a.briefing });
    } else if (due < today && due > twoWeeksAgo && aWeek < weekNum) {
      stillDue.push({ key: key, dueDate: a.dueDate, title: a.title, type: a.type, htmlFile: a.htmlFile, canvasId: a.canvasId, briefing: a.briefing });
    } else if (due > today && due <= sevenDaysOut && aWeek > weekNum) {
      comingUp.push({ key: key, dueDate: a.dueDate, title: a.title, type: a.type, htmlFile: a.htmlFile, canvasId: a.canvasId, briefing: a.briefing });
    }
  }

  var sortByDate = function(a, b) { return new Date(a.dueDate) - new Date(b.dueDate); };
  stillDue.sort(sortByDate);
  thisWeek.sort(sortByDate);
  comingUp.sort(sortByDate);

  return { stillDue: stillDue, thisWeek: thisWeek, comingUp: comingUp };
}

/**
 * Render the Zone B sprint briefing for a specific week.
 * @param {Object} config - Course config
 * @param {number} weekNum - Week number to render
 * @param {string} containerId - ID of container element
 * @param {Object} [options] - Optional settings
 */
function renderSprintBriefing(config, weekNum, containerId, options) {
  options = options || {};
  var container = document.getElementById(containerId);
  if (!container) return;

  var weekData = config.weekDates[weekNum];
  if (!weekData) {
    container.innerHTML = '<p style="color:#6b7280;padding:16px;">No data for this week.</p>';
    return;
  }

  var resolved = getResolvedCurrentWeek(config);
  var groups = getAssignmentGroups(config, weekNum);
  var weeklyQuestion = config.weeklyQuestions ? config.weeklyQuestions[weekNum] : null;
  var sprintData = config.sprints[weekData.sprint];

  var html = '';

  // Gap banner
  if (resolved.isGap && resolved.week === weekNum) {
    html += '<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:#92400e;">' +
      resolved.gapMessage +
    '</div>';
  }

  // Weekly question
  if (weeklyQuestion) {
    html += '<div style="background:var(--theme-light,#f0fdfa);border-left:3px solid var(--theme-primary,#14b8a6);border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:16px;">' +
      '<p style="font-size:12px;font-weight:600;color:var(--theme-dark,#0d9488);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px 0;">This Week\'s Question</p>' +
      '<p style="font-size:15px;color:#1e293b;margin:0;font-style:italic;line-height:1.5;">' + weeklyQuestion + '</p>' +
    '</div>';
  }

  // Still-due indicator (collapsed)
  if (groups.stillDue.length > 0) {
    html += '<div style="margin-bottom:12px;">' +
      '<button onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\';this.querySelector(\'span\').textContent=this.nextElementSibling.style.display===\'none\'?\'+\':\'\u2212\'" ' +
      'style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:13px;color:#6b7280;font-family:inherit;">' +
        groups.stillDue.length + ' item' + (groups.stillDue.length > 1 ? 's' : '') + ' from earlier weeks still need attention' +
        '<span style="font-size:16px;color:#9ca3af;">+</span>' +
      '</button>' +
      '<div style="display:none;padding:8px 0;">';
    groups.stillDue.forEach(function(item) {
      html += renderAssignmentRow(item, config);
    });
    html += '</div></div>';
  }

  // This week's assignments
  if (groups.thisWeek.length > 0) {
    html += '<div style="margin-bottom:16px;">' +
      '<h3 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 8px 0;">This Week</h3>';
    groups.thisWeek.forEach(function(item) {
      html += renderAssignmentRow(item, config);
    });
    html += '</div>';
  } else {
    html += '<p style="color:#6b7280;font-size:14px;padding:8px 0;">No assignments due this week.</p>';
  }

  // Coming up
  if (groups.comingUp.length > 0) {
    html += '<div style="margin-bottom:16px;">' +
      '<h3 style="font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px 0;">Coming Up</h3>';
    groups.comingUp.forEach(function(item) {
      html += renderAssignmentRow(item, config, true);
    });
    html += '</div>';
  }

  // Session link (if loom video or session slides exist)
  var loomUrl = config.loomVideos ? config.loomVideos[weekNum] : null;
  if (loomUrl) {
    html += '<div style="margin-top:16px;padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">' +
      '<a href="' + loomUrl + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;color:var(--theme-dark,#0d9488);font-weight:600;font-size:14px;text-decoration:none;">' +
        'Watch Class Recording \u2192' +
      '</a>' +
    '</div>';
  }

  container.innerHTML = html;
}

/**
 * Render a single assignment row with expandable briefing.
 */
function renderAssignmentRow(item, config, dimmed) {
  var displayTitle = item.title.replace(/^S\d+:\s*/, '');
  var url = item.htmlFile || (config.canvasBaseUrl + '/assignments/' + item.canvasId);
  var dotColors = { assignment: '#3b82f6', reflection: '#a855f7', quiz: '#14b8a6', dojo: '#14b8a6', bridge: '#f59e0b', peer: '#22c55e' };
  var dotColor = dotColors[item.type] || '#6b7280';
  var opacity = dimmed ? 'opacity:0.7;' : '';
  var briefingId = 'briefing-' + item.key;

  var html = '<div style="' + opacity + 'margin-bottom:4px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;cursor:pointer;transition:background 0.15s;" ' +
    'onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'transparent\'"' +
    (item.briefing ? ' onclick="var b=document.getElementById(\'' + briefingId + '\');b.style.display=b.style.display===\'none\'?\'block\':\'none\'"' : '') + '>' +
      '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></span>' +
        '<a href="' + url + '" target="_blank" style="color:#1e293b;text-decoration:none;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" onclick="event.stopPropagation()">' + displayTitle + '</a>' +
      '</div>' +
      '<span style="font-size:12px;color:#9ca3af;flex-shrink:0;margin-left:12px;">' + formatDate(item.dueDate) + '</span>' +
    '</div>';

  if (item.briefing) {
    html += '<div id="' + briefingId + '" style="display:none;padding:4px 12px 10px 28px;font-size:13px;color:#64748b;line-height:1.5;">' +
      item.briefing +
    '</div>';
  }

  html += '</div>';
  return html;
}

// ============================================
// Journey Pills
// ============================================

/**
 * Render 4 sprint pills showing progression.
 * @param {Object} config - Course config
 * @param {number} currentSprint - Current sprint number
 * @param {string} containerId - ID of container
 */
function renderJourneyPills(config, currentSprint, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div style="display:flex;gap:6px;margin-bottom:16px;">';

  for (var i = 1; i <= 4; i++) {
    var sprint = config.sprints[i];
    if (!sprint) continue;

    var isCurrent = i === currentSprint;
    var isPast = i < currentSprint;
    var isFuture = i > currentSprint;

    var bg, color, border, cursor;
    if (isCurrent) {
      bg = 'var(--theme-primary, #14b8a6)';
      color = 'white';
      border = 'none';
      cursor = 'default';
    } else if (isPast) {
      bg = 'var(--theme-light, #f0fdfa)';
      color = 'var(--theme-dark, #0d9488)';
      border = '1px solid var(--theme-primary, #14b8a6)';
      cursor = 'pointer';
    } else {
      bg = '#f9fafb';
      color = '#9ca3af';
      border = '1px solid #e5e7eb';
      cursor = 'default';
    }

    var pillId = 'sprint-pill-' + i;
    var summaryId = 'sprint-summary-' + i;

    html += '<button id="' + pillId + '" ' +
      'style="flex:1;padding:8px 4px;border-radius:8px;font-size:12px;font-weight:600;background:' + bg + ';color:' + color + ';border:' + border + ';cursor:' + cursor + ';font-family:inherit;transition:all 0.2s;" ' +
      (isPast ? 'onclick="toggleSprintSummary(' + i + ')"' : '') +
      '>' +
      'S' + i + ': ' + sprint.name +
    '</button>';
  }

  html += '</div>';

  // Summary panels (hidden by default)
  for (var j = 1; j <= 4; j++) {
    var summaries = config.sprintSummaries ? config.sprintSummaries[j] : null;
    if (summaries && j < currentSprint) {
      html += '<div id="sprint-summary-' + j + '" style="display:none;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:12px;">' +
        '<p style="font-size:14px;color:#374151;margin:0 0 8px 0;line-height:1.5;">' + summaries.summary + '</p>' +
        '<p style="font-size:12px;color:#6b7280;margin:0;"><strong>Capabilities:</strong> ' + summaries.capabilities + '</p>' +
      '</div>';
    }
  }

  container.innerHTML = html;
}

function toggleSprintSummary(sprintNum) {
  var el = document.getElementById('sprint-summary-' + sprintNum);
  if (!el) return;
  // Close other summaries
  for (var i = 1; i <= 4; i++) {
    if (i !== sprintNum) {
      var other = document.getElementById('sprint-summary-' + i);
      if (other) other.style.display = 'none';
    }
  }
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ============================================
// Week Navigation
// ============================================

/**
 * Render prev/next week arrows constrained to the current sprint.
 * @param {Object} config - Course config
 * @param {number} currentWeek - Current week number
 * @param {number} sprintNum - Sprint number
 * @param {string} containerId - ID of container
 * @param {Function} onNavigate - Callback when week changes: onNavigate(newWeekNum)
 */
function renderWeekNavigation(config, currentWeek, sprintNum, containerId, onNavigate) {
  var container = document.getElementById(containerId);
  if (!container) return;

  // Find week range for this sprint
  var sprintWeeks = [];
  for (var num in config.weekDates) {
    if (config.weekDates[num].sprint === sprintNum) {
      sprintWeeks.push(parseInt(num));
    }
  }
  sprintWeeks.sort(function(a, b) { return a - b; });

  var weekData = config.weekDates[currentWeek];
  var weekTitle = weekData ? weekData.title : 'Week ' + currentWeek;
  var minWeek = sprintWeeks[0] || currentWeek;
  var maxWeek = sprintWeeks[sprintWeeks.length - 1] || currentWeek;

  var prevDisabled = currentWeek <= minWeek;
  var nextDisabled = currentWeek >= maxWeek;

  var btnStyle = 'padding:6px 12px;border-radius:6px;font-size:14px;font-family:inherit;cursor:pointer;border:1px solid #e5e7eb;background:white;color:#374151;';
  var disabledStyle = 'opacity:0.3;cursor:default;';

  container.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<button id="week-nav-prev" style="' + btnStyle + (prevDisabled ? disabledStyle : '') + '"' +
        (prevDisabled ? ' disabled' : '') + '>\u2190 Prev</button>' +
      '<div style="text-align:center;">' +
        '<span style="font-size:13px;font-weight:600;color:#374151;">Week ' + currentWeek + '</span>' +
        '<span style="font-size:12px;color:#9ca3af;display:block;">' + weekTitle + '</span>' +
      '</div>' +
      '<button id="week-nav-next" style="' + btnStyle + (nextDisabled ? disabledStyle : '') + '"' +
        (nextDisabled ? ' disabled' : '') + '>Next \u2192</button>' +
    '</div>';

  // Wire up navigation
  if (onNavigate) {
    var prevBtn = document.getElementById('week-nav-prev');
    var nextBtn = document.getElementById('week-nav-next');
    if (prevBtn && !prevDisabled) {
      prevBtn.addEventListener('click', function() { onNavigate(currentWeek - 1); });
    }
    if (nextBtn && !nextDisabled) {
      nextBtn.addEventListener('click', function() { onNavigate(currentWeek + 1); });
    }
  }
}

// ============================================
// Sticky Week Counter
// ============================================

/**
 * Render a minimal sticky progress bar at the top of the page.
 * @param {Object} config - Course config
 * @param {number} weekNum - Current week number
 * @param {string} containerId - ID of container
 */
function renderStickyWeekCounter(config, weekNum, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var weekData = config.weekDates[weekNum];
  var sprintNum = weekData ? weekData.sprint : 1;
  var sprintData = config.sprints[sprintNum];
  var sprintName = sprintData ? sprintData.name : 'Sprint ' + sprintNum;
  var progress = (weekNum / 16) * 100;

  container.style.cssText = 'position:sticky;top:0;z-index:10;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb;padding:8px 16px 0;margin:-16px -16px 16px -16px;';

  container.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:6px;">' +
      '<span style="font-weight:600;color:#374151;">Week ' + weekNum + ' of 16</span>' +
      '<span style="color:#6b7280;">Sprint ' + sprintNum + ': ' + sprintName + '</span>' +
    '</div>' +
    '<div style="height:4px;background:#e5e7eb;border-radius:2px;overflow:hidden;">' +
      '<div style="height:100%;width:' + progress + '%;background:var(--theme-primary,#14b8a6);border-radius:2px;transition:width 0.3s;"></div>' +
    '</div>';
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

  // Add time component to ensure local timezone parsing
  const start = new Date(weekData.start + 'T00:00:00');
  const end = new Date(weekData.end + 'T23:59:59.999');

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

  // Parse dates with time component to ensure local timezone interpretation
  // (Date-only strings like "2026-02-07" are parsed as UTC midnight,
  // which can cause off-by-one errors in local time)
  const start = new Date(weekData.start + 'T00:00:00');
  const end = new Date(weekData.end + 'T23:59:59.999');

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
  const currentWeek = getResolvedCurrentWeek(config).week;

  const titleEl = document.getElementById('status-title');
  const subtitleEl = document.getElementById('status-subtitle');
  const progressNumEl = document.getElementById('status-progress-num');
  const progressBar = document.getElementById('status-progress-bar');

  // Handle pre-semester or post-semester state
  if (!currentWeek) {
    const today = new Date();
    // Add time component to ensure local timezone parsing
    const week1Start = new Date(config.weekDates[1].start + 'T00:00:00');
    const week16End = new Date(config.weekDates[16].end + 'T23:59:59.999');

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

  // Populate due dates (Canvas links are baked in at build time)
  populateDueDates(config);

  // Always update status banner (handles pre/post semester)
  updateStatusBanner(config);

  // Update dynamic content
  const currentWeek = getResolvedCurrentWeek(config).week;

  if (currentWeek) {
    renderDueThisWeek(config, currentWeek, 'due-this-week');
  } else {
    // Pre or post semester - show appropriate message
    const dueContainer = document.getElementById('due-this-week');
    if (dueContainer) {
      const today = new Date();
      // Add time component to ensure local timezone parsing
      const week1Start = new Date(config.weekDates[1].start + 'T00:00:00');

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

  // Populate due dates (Canvas links are baked in at build time)
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
 * Render the weekly homepage content in 3 zones.
 * Zone 1: "This Week" — narrative + connection (always visible)
 * Zone 2: "Why This Matters" — employer connection + portfolio link (collapsed by default)
 *
 * @param {Object} config - Course config with weeklyContent
 * @param {number} weekNum - Current week number
 * @param {string} containerId - ID of the container element for Zone 1 narrative
 * @param {string} connectionContainerId - ID for Zone 2
 */
function renderHomepageContent(config, weekNum, containerId, connectionContainerId) {
  const content = config.weeklyContent && config.weeklyContent[weekNum];
  if (!content) return;

  // Zone 1: Update narrative and insight
  const narrativeEl = document.getElementById(containerId);
  if (narrativeEl) {
    narrativeEl.innerHTML = `
      <p class="zone1__narrative">${content.narrative}</p>
      <p class="zone1__connection">${content.connection}</p>
    `;
  }

  const insightEl = document.getElementById('weekly-insight-text');
  if (insightEl) {
    insightEl.textContent = content.insight;
  }

  // Zone 2: Why This Matters (collapsed)
  const zone2 = document.getElementById(connectionContainerId);
  if (zone2 && content.employerLink) {
    let sourceHtml = '';
    if (content.employerLink.source) {
      sourceHtml = `
        <div class="zone2__source">
          <span class="zone2__source-label">\u{1F4CA} From the research:</span>
          <p class="zone2__source-title">${content.employerLink.source.title}</p>
          <p class="zone2__source-finding">"${content.employerLink.source.finding}"</p>
        </div>
      `;
    }

    zone2.innerHTML = `
      <button class="zone2__header" data-collapse-toggle="zone2-content" aria-expanded="false">
        <div class="zone2__header-left">
          <span class="zone2__icon">\u{1F4A1}</span>
          <span class="zone2__title">Why This Matters \u2014 For Your Career</span>
        </div>
        <span class="zone2__toggle">+</span>
      </button>
      <div class="zone2__content" id="zone2-content">
        <p class="zone2__employer-text">${content.employerLink.text}</p>
        ${sourceHtml}
        <p class="zone2__portfolio">${content.portfolioConnection}</p>
      </div>
    `;
    zone2.style.display = 'block';

    // Initialize collapse behavior
    const header = zone2.querySelector('.zone2__header');
    if (header) {
      header.addEventListener('click', function() {
        var contentEl = document.getElementById('zone2-content');
        if (!contentEl) return;
        var isExpanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !isExpanded);
        contentEl.classList.toggle('is-expanded');
        var toggle = header.querySelector('.zone2__toggle');
        if (toggle) toggle.textContent = isExpanded ? '+' : '\u2212';
      });
    }
  }
}

/**
 * Initialize a sprint page with Loom support
 * @param {Object} config - The course config object
 */
function initSprintPageWithLoom(config) {
  // Initialize collapsibles
  initCollapsibles();

  // Populate due dates and Loom links (Canvas links are baked in at build time)
  populateDueDates(config);

  // Populate Loom links
  populateLoomLinks(config);

  // Highlight current week
  highlightCurrentWeek(config);

  console.log('Sprint page initialized with Loom support');
}
