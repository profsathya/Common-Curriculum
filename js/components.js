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
  var content = config.weeklyContent ? config.weeklyContent[weekNum] : null;
  var nextContent = config.weeklyContent ? config.weeklyContent[weekNum + 1] : null;

  var html = '';

  // Gap banner
  if (resolved.isGap && resolved.week === weekNum) {
    html += '<div style="padding:10px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:16px;text-align:center;">' +
      '<span style="font-size:13px;font-weight:600;color:#92400e;">\uD83C\uDF34 ' + resolved.gapMessage + '</span>' +
    '</div>';
  }

  // Looking back / looking forward cards
  var lookBack = content ? content.connection : null;
  var lookForward = nextContent ? nextContent.narrative : null;
  if (lookBack || lookForward) {
    html += '<div style="display:flex;gap:10px;margin-bottom:16px;">';
    if (lookBack) {
      html += '<div style="flex:1;padding:10px;background:#f9fafb;border-radius:8px;">' +
        '<div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px;">\u2190 Looking back</div>' +
        '<div style="font-size:13px;color:#4b5563;line-height:1.55;">' + lookBack + '</div>' +
      '</div>';
    }
    if (lookForward) {
      html += '<div style="flex:1;padding:10px;background:var(--theme-light,#f0fdfa);border-radius:8px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--theme-dark,#0d9488);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px;">Looking ahead \u2192</div>' +
        '<div style="font-size:13px;color:var(--theme-dark,#115e59);line-height:1.55;">' + lookForward + '</div>' +
      '</div>';
    }
    html += '</div>';
  }

  // Weekly question
  if (weeklyQuestion) {
    html += '<div style="padding:14px;border-radius:8px;margin-bottom:16px;background:linear-gradient(135deg,var(--theme-light,#f0fdfa),#ccfbf1);border-left:4px solid var(--theme-primary,#14b8a6);">' +
      '<div style="font-size:11px;font-weight:700;color:var(--theme-dark,#0d9488);letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;">This week\'s question</div>' +
      '<div style="font-size:15px;font-weight:500;color:#134e4a;line-height:1.5;font-style:italic;">\u201C' + weeklyQuestion + '\u201D</div>' +
    '</div>';
  }

  // Assignment groups header
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
    '<div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#374151;">What you need to do</div>' +
    '<span style="font-size:11px;color:#9ca3af;">Click any item for context</span>' +
  '</div>';

  // Still-due indicator (collapsed, amber count circle)
  if (groups.stillDue.length > 0) {
    var sdId = 'still-due-list-' + weekNum;
    html += '<div style="margin-bottom:12px;">' +
      '<button onclick="var el=document.getElementById(\'' + sdId + '\');var show=el.style.display===\'none\';el.style.display=show?\'block\':\'none\';this.querySelector(\'.sd-chev\').style.transform=show?\'rotate(180deg)\':\'rotate(0)\'" ' +
      'style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-family:inherit;transition:all 0.15s;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:10px;background:#fef3c7;font-size:11px;font-weight:700;color:#92400e;">' + groups.stillDue.length + '</span>' +
          '<span style="font-size:13px;color:#6b7280;">' + groups.stillDue.length + ' item' + (groups.stillDue.length > 1 ? 's' : '') + ' from earlier weeks still need attention</span>' +
        '</div>' +
        '<span class="sd-chev" style="font-size:12px;color:#9ca3af;transition:transform 0.2s;">\u25BE</span>' +
      '</button>' +
      '<div id="' + sdId + '" style="display:none;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">';
    groups.stillDue.forEach(function(item) {
      html += renderAssignmentRow(item, config, true);
    });
    html += '</div></div>';
  }

  // This week's assignments
  if (groups.thisWeek.length > 0) {
    html += '<div style="margin-bottom:12px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#4b5563;padding:6px 14px;">This week</div>' +
      '<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">';
    groups.thisWeek.forEach(function(item) {
      html += renderAssignmentRow(item, config);
    });
    html += '</div></div>';
  } else {
    html += '<p style="color:#6b7280;font-size:14px;padding:8px 0;">No assignments due this week.</p>';
  }

  // Coming up
  if (groups.comingUp.length > 0) {
    html += '<div style="margin-bottom:12px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--theme-dark,#0d9488);padding:6px 14px;">Coming up next</div>' +
      '<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">';
    groups.comingUp.forEach(function(item) {
      html += renderAssignmentRow(item, config);
    });
    html += '</div></div>';
  }

  // Session info card
  var loomUrl = config.loomVideos ? config.loomVideos[weekNum] : null;
  html += '<div style="padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">' +
    '<div>' +
      '<div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.04em;">In-class session</div>' +
      '<div style="font-size:14px;font-weight:500;color:#374151;margin-top:2px;">' + (weekData.title || 'Week ' + weekNum) + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;">' +
    (loomUrl ? '<a href="' + loomUrl + '" target="_blank" style="font-size:12px;color:var(--theme-dark,#0d9488);font-weight:600;text-decoration:none;">Recording \u2192</a>' : '') +
    '</div>' +
  '</div>';

  // Why This block
  if (content && content.narrative) {
    html += '<div style="padding:12px;border-radius:8px;border:1px solid var(--theme-light,#ccfbf1);background:white;">' +
      '<div style="display:flex;align-items:flex-start;gap:12px;">' +
        '<div style="width:48px;height:48px;border-radius:8px;background:var(--theme-light,#ccfbf1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">\uD83C\uDFA5</div>' +
        '<div>' +
          '<div style="font-size:12px;font-weight:700;color:var(--theme-dark,#0d9488);margin-bottom:4px;">Why this week matters</div>' +
          '<div style="font-size:13px;color:#4b5563;line-height:1.55;font-style:italic;">' + content.narrative + '</div>' +
          '<div style="margin-top:6px;font-size:12px;color:var(--theme-dark,#0d9488);">\u2014 Prof. Sathya</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  container.innerHTML = html;
}

/**
 * Render a single assignment row with expandable briefing.
 */
function renderAssignmentRow(item, config, isPastDue) {
  var displayTitle = item.title.replace(/^S\d+:\s*/, '');
  var url = item.htmlFile || (config.canvasBaseUrl + '/assignments/' + item.canvasId);
  var typeIcons = { assignment: '\uD83D\uDCCB', reflection: '\uD83E\uDE9E', quiz: '\uD83D\uDCDD', dojo: '\uD83E\uDD4B', peer: '\uD83D\uDC65', 'ai-discussion': '\uD83D\uDCAC', bridge: '\uD83C\uDF09', 'handwritten-reflection': '\uD83E\uDE9E' };
  var typeColors = { assignment: '#3b82f6', reflection: '#a855f7', quiz: '#14b8a6', dojo: '#14b8a6', peer: '#22c55e', 'ai-discussion': '#14b8a6', bridge: '#f59e0b', 'handwritten-reflection': '#a855f7' };
  var icon = typeIcons[item.type] || '\uD83D\uDCCB';
  var tc = typeColors[item.type] || '#6b7280';
  var briefingId = 'briefing-' + item.key;
  var chevId = 'chev-' + item.key;

  var html = '<div style="border-bottom:1px solid #f3f4f6;">';

  // Row button
  html += '<div style="width:100%;display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:' + (item.briefing ? 'pointer' : 'default') + ';transition:background 0.15s;" ' +
    'onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'transparent\'"' +
    (item.briefing ? ' onclick="var b=document.getElementById(\'' + briefingId + '\');var show=b.style.display===\'none\';b.style.display=show?\'block\':\'none\';document.getElementById(\'' + chevId + '\').style.transform=show?\'rotate(180deg)\':\'rotate(0)\'"' : '') + '>' +
      '<span style="font-size:15px;flex-shrink:0;">' + icon + '</span>' +
      '<a href="' + url + '" target="_blank" onclick="event.stopPropagation()" style="flex:1;font-size:14px;font-weight:500;color:' + (isPastDue ? '#6b7280' : '#1f2937') + ';text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + displayTitle + '</a>' +
      '<span style="font-size:12px;color:' + (isPastDue ? '#ef4444' : '#9ca3af') + ';white-space:nowrap;margin-right:8px;font-weight:' + (isPastDue ? '600' : '400') + ';">' + formatDate(item.dueDate) + '</span>' +
      '<span style="font-size:11px;color:' + tc + ';font-weight:600;background:' + tc + '15;padding:2px 8px;border-radius:4px;white-space:nowrap;">' + (item.type || 'assignment') + '</span>' +
      (item.briefing ? '<span id="' + chevId + '" style="font-size:14px;color:#9ca3af;transition:transform 0.2s;flex-shrink:0;">\u25BE</span>' : '') +
  '</div>';

  // Expandable briefing
  if (item.briefing) {
    html += '<div id="' + briefingId + '" style="display:none;padding:0 14px 14px 39px;border-left:3px solid ' + tc + ';margin-left:14px;">' +
      '<div style="font-weight:600;font-size:11px;color:' + tc + ';letter-spacing:0.04em;text-transform:uppercase;margin-bottom:4px;">How this connects</div>' +
      '<div style="font-size:13px;line-height:1.65;color:#4b5563;">' + item.briefing + '</div>' +
      '<div style="margin-top:8px;"><a href="' + url + '" target="_blank" style="font-size:11px;color:var(--theme-dark,#0d9488);font-weight:600;text-decoration:underline;text-decoration-style:dotted;">Open full assignment \u2192</a></div>' +
    '</div>';
  }

  html += '</div>';
  return html;
}

// ============================================
// Journey Pills
// ============================================

/**
 * Render 4 sprint pills showing progression (multi-line, matching prototype).
 * Clicking any pill except the current page's sprint navigates to that sprint page.
 * @param {Object} config - Course config
 * @param {number} currentSprint - The sprint that is currently active (by date)
 * @param {string} containerId - ID of container
 * @param {number} [pageSprint] - The sprint this page represents (defaults to currentSprint)
 */
function renderJourneyPills(config, currentSprint, containerId, pageSprint) {
  var container = document.getElementById(containerId);
  if (!container) return;

  if (pageSprint === undefined) pageSprint = currentSprint;

  var html = '<div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--theme-dark,#0d9488);margin-bottom:8px;">Your journey</div>';
  html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';

  for (var i = 1; i <= 4; i++) {
    var sprint = config.sprints[i];
    if (!sprint) continue;

    var isCurrent = i === currentSprint;
    var isPast = i < currentSprint;
    var isThisPage = i === pageSprint;

    var bg, textColor, subColor, border;
    if (isCurrent) {
      bg = 'var(--theme-primary, #14b8a6)';
      textColor = 'white';
      subColor = 'rgba(255,255,255,0.85)';
      border = '1.5px solid var(--theme-dark, #0d9488)';
    } else if (isPast) {
      bg = 'var(--theme-light, #f0fdfa)';
      textColor = 'var(--theme-dark, #115e59)';
      subColor = 'var(--theme-dark, #0d9488)';
      border = '1.5px solid var(--theme-primary, #5eead4)';
    } else {
      bg = '#f9fafb';
      textColor = '#9ca3af';
      subColor = '#9ca3af';
      border = '1.5px solid #e5e7eb';
    }

    var stakeholder = sprint.stakeholder || '';
    var statusLabel = isPast ? '\u2713 Sprint ' + i : (isCurrent ? '\u2605 Sprint ' + i : 'Sprint ' + i);
    var navigable = !isThisPage;

    html += '<' + (navigable ? 'a href="sprint-' + i + '.html"' : 'div') + ' ' +
      'style="flex:1;padding:10px 8px;background:' + bg + ';border:' + border + ';border-radius:10px;cursor:' + (navigable ? 'pointer' : 'default') + ';text-align:center;font-family:inherit;transition:all 0.15s;text-decoration:none;display:block;" ' +
      '>' +
        '<div style="font-size:11px;font-weight:700;color:' + subColor + ';letter-spacing:0.04em;text-transform:uppercase;">' + statusLabel + '</div>' +
        '<div style="font-size:14px;font-weight:600;color:' + textColor + ';margin-top:2px;">' + sprint.name + '</div>' +
        '<div style="font-size:11px;color:' + subColor + ';margin-top:2px;">' + stakeholder + '</div>' +
    '</' + (navigable ? 'a' : 'div') + '>';
  }

  html += '</div>';
  container.innerHTML = html;
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
  var prevWeek = currentWeek - 1;
  var nextWeek = currentWeek + 1;

  var prevDisabled = currentWeek <= minWeek;
  var nextDisabled = currentWeek >= maxWeek;

  // Format date range
  var dateRange = '';
  if (weekData) {
    var s = new Date(weekData.start + 'T12:00:00');
    var e = new Date(weekData.end + 'T12:00:00');
    var fmt = function(d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    dateRange = fmt(s) + ' \u2013 ' + fmt(e);
  }

  var btnBase = 'padding:6px 12px;border-radius:6px;font-size:14px;font-weight:600;font-family:inherit;border:1px solid;transition:all 0.15s;';
  var btnActive = btnBase + 'cursor:pointer;background:white;border-color:var(--theme-primary,#5eead4);color:var(--theme-dark,#0d9488);';
  var btnDis = btnBase + 'cursor:default;background:#f9fafb;border-color:#e5e7eb;color:#d1d5db;';

  // Cross-sprint links
  var prevSprintLink = '';
  var nextSprintLink = '';
  if (prevDisabled && sprintNum > 1) {
    var ps = config.sprints[sprintNum - 1];
    if (ps) prevSprintLink = '<div style="text-align:left;margin-top:4px;"><a href="sprint-' + (sprintNum - 1) + '.html" style="font-size:12px;color:#9ca3af;text-decoration:none;">\u2190 Sprint ' + (sprintNum - 1) + ': ' + ps.name + '</a></div>';
  }
  if (nextDisabled && sprintNum < 4) {
    var ns = config.sprints[sprintNum + 1];
    if (ns) nextSprintLink = '<div style="text-align:right;margin-top:4px;"><a href="sprint-' + (sprintNum + 1) + '.html" style="font-size:12px;color:#9ca3af;text-decoration:none;">Sprint ' + (sprintNum + 1) + ': ' + ns.name + ' \u2192</a></div>';
  }

  container.innerHTML =
    '<div style="padding:10px 16px;background:linear-gradient(135deg,var(--theme-light,#f0fdfa),white);border:1px solid var(--theme-light,#ccfbf1);border-radius:12px;margin-bottom:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<button id="week-nav-prev" style="' + (prevDisabled ? btnDis : btnActive) + '"' +
          (prevDisabled ? ' disabled' : '') + '>\u2190 Week ' + prevWeek + '</button>' +
        '<div style="text-align:center;">' +
          '<div style="font-size:16px;font-weight:700;color:#1f2937;">Week ' + currentWeek + ': ' + weekTitle + '</div>' +
          '<div style="font-size:12px;color:#9ca3af;margin-top:2px;">' + dateRange + '</div>' +
        '</div>' +
        '<button id="week-nav-next" style="' + (nextDisabled ? btnDis : btnActive) + '"' +
          (nextDisabled ? ' disabled' : '') + '>Week ' + nextWeek + ' \u2192</button>' +
      '</div>' +
      (prevSprintLink || nextSprintLink ? '<div style="display:flex;justify-content:space-between;">' + prevSprintLink + nextSprintLink + '</div>' : '') +
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
 * Add navigation bar when not in iframe (public site).
 * Replaces the old demo banner with a compact course navigation.
 */
function addNavigationIfNeeded() {
  if (isInIframe()) return;

  var path = window.location.pathname;
  var currentPage = path.split('/').pop() || 'home.html';
  var isCst395 = path.includes('cst395');
  var isCst349 = path.includes('cst349');

  var courseName, themeColor, links;
  if (isCst395) {
    courseName = 'CST395: AI-Native Solution Engineering';
    themeColor = '#0d9488';
    links = [
      { label: 'Home', href: 'home.html' },
      { label: 'S1', href: 'sprint-1.html' },
      { label: 'S2', href: 'sprint-2.html' },
      { label: 'S3', href: 'sprint-3.html' },
      { label: 'S4', href: 'sprint-4.html' },
      { label: 'Overview', href: 'overview.html' },
      { label: 'Capabilities', href: 'capabilities.html' },
      { label: 'Concepts', href: 'concepts.html' }
    ];
  } else if (isCst349) {
    courseName = 'CST349: Professional Seminar';
    themeColor = '#2563eb';
    links = [
      { label: 'Home', href: 'home.html' },
      { label: 'S1', href: 'sprint-1.html' },
      { label: 'S2', href: 'sprint-2.html' },
      { label: 'S3', href: 'sprint-3.html' },
      { label: 'S4', href: 'sprint-4.html' },
      { label: 'Overview', href: 'overview.html' },
      { label: 'SDL Dimensions', href: 'sdl-dimensions.html' },
      { label: 'Portfolio', href: 'portfolio.html' }
    ];
  } else {
    return; // Unknown course, skip nav
  }

  var nav = document.createElement('div');
  nav.style.cssText = 'position:sticky;top:0;z-index:11;background:rgba(255,255,255,0.97);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb;padding:0 16px;font-family:system-ui,sans-serif;';

  var linksHtml = links.map(function(l) {
    var isCurrent = currentPage === l.href;
    return '<a href="' + l.href + '" style="color:' + (isCurrent ? themeColor : '#4b5563') + ';text-decoration:none;font-size:13px;font-weight:' + (isCurrent ? '700' : '400') + ';transition:color 0.15s;" onmouseover="this.style.color=\'' + themeColor + '\'" onmouseout="this.style.color=\'' + (isCurrent ? themeColor : '#4b5563') + '\'">' + l.label + '</a>';
  }).join('<span style="color:#d1d5db;margin:0 4px;">\u00B7</span>');

  nav.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;height:40px;max-width:760px;margin:0 auto;">' +
      '<span style="font-size:13px;font-weight:700;color:' + themeColor + ';">' + courseName + '</span>' +
      '<div>' + linksHtml + '</div>' +
    '</div>' +
    '<div style="max-width:760px;margin:0 auto;padding-bottom:6px;">' +
      '<span style="font-size:11px;color:#9ca3af;">Viewing outside Canvas \u2014 some links may behave differently</span>' +
    '</div>';

  document.body.insertBefore(nav, document.body.firstChild);
}

// Backward compatibility alias
function addDemoBannerIfNeeded() {
  addNavigationIfNeeded();
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
