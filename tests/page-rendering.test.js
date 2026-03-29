/**
 * Page Rendering Tests
 *
 * Validates that components.js and config files load without errors,
 * all rendering functions exist and produce HTML output, and sprint
 * page initialization logic runs correctly for all sprint/course
 * combinations.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function createBrowserContext() {
  var elements = {};
  return vm.createContext({
    window: { location: { pathname: '/cst395/sprint-1.html', hash: '' }, self: {}, top: {} },
    document: {
      getElementById: function(id) {
        if (!elements[id]) elements[id] = { style: {}, innerHTML: '', id: id };
        return elements[id];
      },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      createElement: function(tag) { return { style: {}, innerHTML: '', tagName: tag }; },
      addEventListener: function() {},
      body: { insertBefore: function() {}, firstChild: null }
    },
    history: { replaceState: function() {} },
    console: console,
    Date: Date,
    parseInt: parseInt,
    parseFloat: parseFloat,
    setTimeout: setTimeout,
    isNaN: isNaN,
    Math: Math,
    JSON: JSON,
    Object: Object,
    Array: Array,
    RegExp: RegExp,
    Error: Error,
    Buffer: Buffer,
    _elements: elements
  });
}

function loadScripts(ctx, configFile) {
  var configCode = fs.readFileSync(path.join(ROOT, configFile), 'utf-8');
  var componentsCode = fs.readFileSync(path.join(ROOT, 'js/components.js'), 'utf-8');
  vm.runInContext(configCode, ctx);
  vm.runInContext(componentsCode, ctx);
  return ctx;
}

// ============================================
// Syntax validation
// ============================================

describe('JavaScript file syntax', function() {
  var jsFiles = [
    'js/components.js',
    'config/cst395-config.js',
    'config/cst349-config.js'
  ];

  jsFiles.forEach(function(file) {
    it(file + ' parses without syntax errors', function() {
      var code = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      assert.doesNotThrow(function() {
        new Function(code);
      }, 'Syntax error in ' + file);
    });
  });
});

// ============================================
// Function existence
// ============================================

describe('Rendering functions exist', function() {
  var ctx = createBrowserContext();
  loadScripts(ctx, 'config/cst395-config.js');

  var requiredFunctions = [
    'getResolvedCurrentWeek',
    'getSimulatedDate',
    'initDateSimulator',
    'getAssignmentGroups',
    'renderSprintBriefing',
    'renderAssignmentRow',
    'renderJourneyPills',
    'renderWeekNavigation',
    'renderStickyWeekCounter',
    'addNavigationIfNeeded',
    'addDemoBannerIfNeeded',
    'formatDate',
    'initCollapsibles',
    'populateDueDates',
    'highlightCurrentWeek',
    'getCurrentWeekFromConfig',
    'isInIframe'
  ];

  requiredFunctions.forEach(function(fn) {
    it(fn + '() exists and is a function', function() {
      var type = vm.runInContext('typeof ' + fn, ctx);
      assert.equal(type, 'function', fn + ' should be a function');
    });
  });
});

// ============================================
// Week resolution
// ============================================

describe('Week resolution for both configs', function() {
  ['config/cst395-config.js', 'config/cst349-config.js'].forEach(function(configFile) {
    var courseName = configFile.includes('395') ? 'CST395' : 'CST349';

    it(courseName + ' resolves a valid week for mid-semester dates', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);

      var configVar = courseName === 'CST395' ? 'CST395_CONFIG' : 'CST349_CONFIG';
      var result = vm.runInContext(
        'getResolvedCurrentWeek(' + configVar + ', new Date("2026-02-15T12:00:00"))',
        ctx
      );
      assert.ok(result.week !== null, 'Should resolve to a week number');
      assert.ok(result.week >= 1 && result.week <= 16, 'Week should be 1-16, got ' + result.week);
    });

    it(courseName + ' returns null before semester', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);

      var configVar = courseName === 'CST395' ? 'CST395_CONFIG' : 'CST349_CONFIG';
      var result = vm.runInContext(
        'getResolvedCurrentWeek(' + configVar + ', new Date("2025-12-01T12:00:00"))',
        ctx
      );
      assert.equal(result.week, null);
    });
  });
});

// ============================================
// Rendering output
// ============================================

describe('Rendering functions produce HTML', function() {
  ['config/cst395-config.js', 'config/cst349-config.js'].forEach(function(configFile) {
    var courseName = configFile.includes('395') ? 'CST395' : 'CST349';
    var configVar = courseName === 'CST395' ? 'CST395_CONFIG' : 'CST349_CONFIG';

    it(courseName + ' renderJourneyPills produces content', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);
      vm.runInContext('renderJourneyPills(' + configVar + ', 2, "journey-pills", 1)', ctx);
      var html = ctx._elements['journey-pills'].innerHTML;
      assert.ok(html.length > 50, 'Should produce substantial HTML, got ' + html.length + ' chars');
      assert.ok(html.includes('Sprint'), 'Should contain sprint text');
    });

    it(courseName + ' renderStickyWeekCounter produces content', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);
      vm.runInContext('renderStickyWeekCounter(' + configVar + ', 5, "sticky-counter")', ctx);
      var el = ctx._elements['sticky-counter'];
      assert.ok(el.innerHTML.length > 20, 'Should produce HTML');
      assert.ok(el.innerHTML.includes('Week 5'), 'Should show week number');
    });

    it(courseName + ' renderWeekNavigation produces content', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);
      vm.runInContext('renderWeekNavigation(' + configVar + ', 5, 2, "week-nav")', ctx);
      var html = ctx._elements['week-nav'].innerHTML;
      assert.ok(html.length > 50, 'Should produce HTML');
      assert.ok(html.includes('Week'), 'Should contain week text');
    });

    it(courseName + ' renderSprintBriefing produces content for each sprint', function() {
      var ctx = createBrowserContext();
      loadScripts(ctx, configFile);

      // Test one week per sprint
      [1, 5, 9, 13].forEach(function(week) {
        vm.runInContext(
          'renderSprintBriefing(' + configVar + ', ' + week + ', "zone-b")',
          ctx
        );
        var html = ctx._elements['zone-b'].innerHTML;
        assert.ok(html.length > 10, 'Week ' + week + ' should produce content, got ' + html.length + ' chars');
      });
    });
  });
});

// ============================================
// Sprint page initialization simulation
// ============================================

describe('Sprint page initialization', function() {
  var pages = [
    { course: 'CST395', config: 'config/cst395-config.js', configVar: 'CST395_CONFIG', sprints: [1, 2, 3, 4] },
    { course: 'CST349', config: 'config/cst349-config.js', configVar: 'CST349_CONFIG', sprints: [1, 2, 3, 4] }
  ];

  pages.forEach(function(p) {
    p.sprints.forEach(function(sprintNum) {
      it(p.course + ' Sprint ' + sprintNum + ' initializes without errors', function() {
        var ctx = createBrowserContext();
        loadScripts(ctx, p.config);

        assert.doesNotThrow(function() {
          vm.runInContext(`
            var SPRINT_NUM = ${sprintNum};
            var CONFIG = ${p.configVar};
            var resolved = getResolvedCurrentWeek(CONFIG, new Date("2026-03-01T12:00:00"));
            var currentWeek = resolved.week || 1;
            var weekData = CONFIG.weekDates[currentWeek];
            var currentSprint = weekData ? weekData.sprint : 1;

            var sprintWeeks = [];
            for (var w in CONFIG.weekDates) {
              if (CONFIG.weekDates[w].sprint === SPRINT_NUM) sprintWeeks.push(parseInt(w));
            }
            sprintWeeks.sort(function(a, b) { return a - b; });

            var displayWeek;
            if (currentSprint === SPRINT_NUM) displayWeek = currentWeek;
            else if (currentSprint > SPRINT_NUM) displayWeek = sprintWeeks[sprintWeeks.length - 1];
            else displayWeek = sprintWeeks[0];

            renderStickyWeekCounter(CONFIG, displayWeek, 'sticky-counter');
            renderJourneyPills(CONFIG, currentSprint, 'journey-pills', SPRINT_NUM);
            renderWeekNavigation(CONFIG, displayWeek, SPRINT_NUM, 'week-nav');
            renderSprintBriefing(CONFIG, displayWeek, 'zone-b');
          `, ctx);
        }, p.course + ' Sprint ' + sprintNum + ' should initialize without errors');

        // Verify content was rendered
        assert.ok(ctx._elements['journey-pills'].innerHTML.length > 20,
          'Journey pills should have content');
        assert.ok(ctx._elements['zone-b'].innerHTML.length > 10,
          'Zone B should have content');
      });
    });
  });
});

// ============================================
// Sprint HTML file validation
// ============================================

describe('Sprint HTML files have required elements', function() {
  var files = [
    'cst395/sprint-1.html', 'cst395/sprint-2.html', 'cst395/sprint-3.html', 'cst395/sprint-4.html',
    'cst349/sprint-1.html', 'cst349/sprint-2.html', 'cst349/sprint-3.html', 'cst349/sprint-4.html'
  ];

  files.forEach(function(file) {
    it(file + ' has all required container divs and script calls', function() {
      var html = fs.readFileSync(path.join(ROOT, file), 'utf-8');

      assert.ok(html.includes('id="sticky-counter"'), 'Missing sticky-counter div');
      assert.ok(html.includes('id="journey-pills"'), 'Missing journey-pills div');
      assert.ok(html.includes('id="zone-b"'), 'Missing zone-b div');
      assert.ok(html.includes('id="week-nav"'), 'Missing week-nav div');
      assert.ok(html.includes('components.js'), 'Missing components.js script');
      assert.ok(html.includes('renderWeek('), 'Missing renderWeek function');
      assert.ok(html.includes('renderStickyWeekCounter'), 'Missing renderStickyWeekCounter call');
      assert.ok(html.includes('renderJourneyPills'), 'Missing renderJourneyPills call');
      assert.ok(html.includes('initDateSimulator'), 'Missing initDateSimulator call');
      assert.ok(html.includes('SPRINT_NUM'), 'Missing SPRINT_NUM variable');
    });
  });

  var homeFiles = ['cst395/home.html', 'cst349/home.html'];
  homeFiles.forEach(function(file) {
    it(file + ' does not auto-redirect', function() {
      var html = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      assert.ok(!html.includes('window.location.replace'), 'Should not auto-redirect');
    });
  });
});
