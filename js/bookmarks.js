/* ============================================================================
   Course bookmarks — student-owned annotation layer for course pages.

   What it does
     A dispenser sits in the top-right corner holding a stack of coloured
     bookmarks plus one "I'm here" progress marker. A student drags a bookmark
     onto any part of the page — a sprint, a week, a section, a session, a
     single item — and it snaps to that block. Clicking the placed bookmark
     opens a note card in the flow beneath the block (so the page makes room
     for it, the way a sticky note pushes pages apart in a real book). The tab
     itself never changes size; it shows the words of the note that fit.

   Where it stores things
     localStorage only, keyed by course + page. Nothing leaves the machine.
     No network, no cookies, no server. If storage is unavailable (private
     window, cross-origin iframe with partitioned storage) the feature
     degrades to a one-session scratchpad rather than throwing.

   How anchoring survives editing
     Bookmarks are NOT saved at pixel positions. Each one stores a semantic
     key built from the page's own structure — sprint id / week number /
     section kind / row identity (a link href where one exists, otherwise the
     row's own title text). Rearranging, restyling or re-indenting the HTML in
     Pinegrow leaves the keys intact; a bookmark stays attached to the item it
     was put on. If a keyed block genuinely disappears, its bookmark is kept
     in storage and listed as "orphaned" rather than silently deleted.

   Accessibility
     Everything is reachable without a mouse: the dispenser is a button, Enter
     enters placement mode, arrow keys walk the anchorable blocks, Enter drops
     and Escape cancels. Native <details> behaviour is untouched. Animation is
     skipped under prefers-reduced-motion. Bookmarks are hidden in print.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */

  var COLORS = [
    { id: 'amber',  label: 'Amber',  ink: '#7a4f00', bg: '#FFC53D', line: '#E0A317' },
    { id: 'rose',   label: 'Rose',   ink: '#7d2b3f', bg: '#FF8FA3', line: '#E06C82' },
    { id: 'violet', label: 'Violet', ink: '#4a2e7a', bg: '#B69CFF', line: '#8E74E0' },
    { id: 'teal',   label: 'Teal',   ink: '#0b4f4a', bg: '#5FD3C4', line: '#2FAFA0' },
    { id: 'sky',    label: 'Sky',    ink: '#0b4a6e', bg: '#7CC7F5', line: '#3FA3DC' }
  ];

  /* The progress marker is deliberately outside the palette: one per page,
     one colour nobody else uses, so "where am I" never blends into "what did
     I think about this". Deeper than the page's own check-green so it doesn't
     read as another status badge. */
  var PROGRESS = { ink: '#fff', bg: '#157F3C', line: '#0E5C2B' };

  var MAX_TAB_CHARS = 34;      /* tab is fixed width; this is the hard clip   */
  var STORAGE_PREFIX = 'cc-bookmarks:';

  /* Blocks a bookmark may attach to, widest first. Order matters: hit-testing
     walks up from the drop point and takes the first match, so the most
     specific selectors must come first. */
  var ANCHOR_SELECTORS = [
    '.wrow',                 /* one OYP / graded / session item              */
    '.item',                 /* item rows on the module-style pages          */
    'details.wday',          /* one session day (Mon / Wed / Fri)            */
    '.wsec',                 /* Session plan / Own your progress / Graded    */
    '.wk',                   /* a week                                       */
    '.goal',                 /* "By the end of this sprint you will be able" */
    '.prereq',
    '.beyond',
    '.note',
    'p.body',
    'h2.sec',
    'details.module',        /* a whole sprint                               */
    'details.bigpic'
  ];
  var ANCHOR_QUERY = ANCHOR_SELECTORS.join(',');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Inside the Canvas embed the iframe is sized to the whole page height and
     never scrolls — the OUTER page does. A position:fixed panel therefore
     pins to the bottom of a 1500px-tall viewport and is never seen again, and
     dragging across that distance is impossible because the parent can't
     scroll mid-drag. So when embedded the panel sits inline in the flow and
     placement is click-to-pick-up, click-to-drop. */
  /* Safari deletes this kind of storage on its own — ephemeral in a
     third-party frame, and capped at 7 days of no interaction as first party.
     Students on Safari get told, in the panel, before they trust it. */
  var IS_SAFARI = /^((?!chrome|android|crios|fxios|edgios|edg\/).)*safari/i
    .test(navigator.userAgent);

  var EMBEDDED = (function () {
    try { if (window.self !== window.top) return true; } catch (e) { return true; }
    return new URLSearchParams(location.search).get('context') === 'canvas';
  })();

  /* --------------------------------------------------------------- storage */

  var storeKey = (function () {
    var path = location.pathname.replace(/\/+$/, '');
    var parts = path.split('/').filter(Boolean);
    var page = parts.pop() || 'index';
    var course = parts.pop() || 'course';
    return STORAGE_PREFIX + course + ':' + page;
  })();

  var memoryFallback = null;

  function load() {
    try {
      var raw = window.localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return memoryFallback || [];
    }
  }

  function save(list) {
    memoryFallback = list;
    try {
      window.localStorage.setItem(storeKey, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  var marks = load();

  /* ------------------------------------------- which sections they left open

     The page ships with every section shut and its own script re-shuts them,
     so "closed" stays the default for a first visit. All this does is re-open
     the ones the student opened last time. It only ever ADDS opens, so a
     #hash link pointing at a section still wins. */

  var openStoreKey = storeKey.replace(STORAGE_PREFIX, 'cc-open:');
  var restoring = false;

  function loadOpen() {
    try { return JSON.parse(window.localStorage.getItem(openStoreKey) || '[]'); }
    catch (e) { return []; }
  }

  function saveOpen(list) {
    try { window.localStorage.setItem(openStoreKey, JSON.stringify(list)); } catch (e) {}
  }

  /* Same principle as a bookmark's key: describe the section in the page's own
     terms so re-editing the HTML doesn't lose the student's place. */
  function detailsKey(d) {
    if (d.id) return 'id:' + d.id;
    var sum = textOf(d.querySelector(':scope > summary'), 40).toLowerCase();
    return keyFor(d) + '|s:' + sum;
  }

  function eachDetails(fn) {
    var all = document.querySelectorAll('details');
    for (var i = 0; i < all.length; i++) {
      if (all[i].closest('.bmk-ui')) continue;
      fn(all[i]);
    }
  }

  function restoreOpen() {
    var want = loadOpen();
    if (!want.length) return;
    var set = {};
    for (var i = 0; i < want.length; i++) set[want[i]] = 1;
    restoring = true;
    /* document order = outermost first, so a nested section is reachable by
       the time we get to it */
    eachDetails(function (d) {
      if (set[detailsKey(d)]) d.setAttribute('open', '');
    });
    restoring = false;
  }

  function captureOpen() {
    if (restoring) return;
    var out = [];
    eachDetails(function (d) { if (d.open) out.push(detailsKey(d)); });
    saveOpen(out);
  }

  function uid() {
    return 'bm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  /* ------------------------------------------------------------ anchor keys */

  function textOf(el, limit) {
    if (!el) return '';
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return limit ? t.slice(0, limit) : t;
  }

  /* A bookmark's address in the page's own vocabulary, e.g.
       sprint-1|week 3|oyp|what-are-my-priorities.html
     Built from meaning, not position, so it survives edits. */
  function keyFor(el) {
    var parts = [];

    var module = el.closest('details.module[id], details.bigpic[id]');
    if (module) parts.push(module.id);

    var wk = el.closest('.wk');
    if (wk) {
      var head = textOf(wk.querySelector('.wk-head'));
      var m = head.match(/week\s*(\d+)/i);
      parts.push(m ? 'week ' + m[1] : 'wk:' + head.slice(0, 24).toLowerCase());
    }

    var sec = el.closest('.wsec');
    if (sec) {
      var kind = (sec.className.match(/wsec-(\w+)/) || [, 'sec'])[1];
      parts.push(kind);
    }

    /* The row itself. A link is the most durable identity we have — but it
       must be the SAME link in both contexts. Inside Canvas the page rewrites
       each item's href to its Canvas assignment URL, so keying on href alone
       would give an item two different keys depending on where the student
       read it, and an emailed export would not restore across them.
       `data-canvas-href` is present and untouched in both, so key on that. */
    if (el.matches('.wrow, .item')) {
      var a = el.querySelector('a[href]');
      if (a) {
        var raw = a.getAttribute('data-canvas-href') || a.getAttribute('href');
        parts.push('link:' + raw.split('/').pop().split('?')[0]);
      } else {
        parts.push('t:' + textOf(el.querySelector('.wt, .title') || el, 48).toLowerCase());
      }
    } else if (el.matches('details.wday')) {
      parts.push('day:' + textOf(el.querySelector('.wd')).toLowerCase());
    } else if (el.matches('.goal, .prereq, .beyond, .note, p.body, h2.sec')) {
      parts.push(el.tagName.toLowerCase() + '.' + (el.className || 'x').split(' ')[0] +
                 ':' + textOf(el, 40).toLowerCase());
    } else if (!module && !wk && !sec) {
      parts.push('t:' + textOf(el, 48).toLowerCase());
    }

    return parts.join('|') || 't:' + textOf(el, 60).toLowerCase();
  }

  var anchorIndex = null;   /* key -> element, rebuilt whenever the DOM shifts */

  function buildIndex() {
    anchorIndex = {};
    var all = document.querySelectorAll(ANCHOR_QUERY);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest('.bmk-ui')) continue;
      var k = keyFor(el);
      if (anchorIndex[k]) {            /* duplicate text — disambiguate       */
        var n = 2;
        while (anchorIndex[k + '#' + n]) n++;
        k = k + '#' + n;
      }
      anchorIndex[k] = el;
      el.setAttribute('data-bmk-key', k);
    }
  }

  function elementForKey(k) {
    if (!anchorIndex) buildIndex();
    return anchorIndex[k] || null;
  }

  /* ------------------------------------------------------------------ style */

  var CSS = [
    '.bmk-ui,.bmk-ui *{box-sizing:border-box;}',

    /* dispenser -------------------------------------------------------- */
    '.bmk-dispenser{position:fixed;top:14px;right:14px;z-index:900;width:198px;',
    'font-family:inherit;font-size:12px;color:#2D3B45;background:#fff;',
    'border:1px solid #C7CDD1;border-radius:8px;box-shadow:0 4px 14px rgba(45,59,69,.13);}',
    /* an eyebrow over the name, the same idiom the page already uses on its  */
    /* goal and callout blocks — puts the tool inside a practice students know */
    '.bmk-dispenser .bmk-title{display:flex;align-items:flex-start;gap:7px;padding:9px 10px 7px;}',
    '.bmk-dispenser .bmk-name{flex:1;font-size:12.5px;font-weight:700;line-height:1.25;',
    'color:#2D3B45;}',
    '.bmk-dispenser .bmk-eyebrow{display:block;font-size:9.5px;font-weight:700;letter-spacing:.6px;',
    'text-transform:uppercase;color:#6B7780;margin-bottom:1px;}',
    '.bmk-dispenser .bmk-emo{flex:0 0 auto;font-size:14px;line-height:1.5;}',
    '.bmk-collapse{flex:0 0 auto;border:0;background:none;color:#6B7780;cursor:pointer;',
    'font-size:14px;line-height:1;padding:2px 4px;border-radius:3px;}',
    '.bmk-collapse:hover{background:#F0F2F4;color:#2D3B45;}',
    '.bmk-body{padding:0 10px 10px;}',
    '.bmk-dispenser.is-min .bmk-body{display:none;}',
    '.bmk-dispenser.is-min{width:auto;}',
    '.bmk-swatches{display:flex;gap:6px;margin-bottom:9px;}',
    '.bmk-sw{width:22px;height:30px;border-radius:2px 2px 0 0;border:1px solid rgba(0,0,0,.16);',
    'cursor:grab;padding:0;touch-action:none;',
    'clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - 7px),0 100%);}',
    '.bmk-sw:hover{transform:translateY(-2px);}',
    '.bmk-sw:active{cursor:grabbing;}',
    '.bmk-sw:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',
    '.bmk-handle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;',
    'padding:9px 8px;border-radius:5px;border:1px solid rgba(0,0,0,.18);cursor:grab;',
    'font:inherit;font-size:11.5px;font-weight:700;touch-action:none;user-select:none;}',
    '.bmk-handle:active{cursor:grabbing;}',
    '.bmk-handle:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',
    '.bmk-progress-handle{margin-top:6px;}',
    '.bmk-hint{margin-top:7px;font-size:10.5px;line-height:1.35;color:#6B7780;}',
    '.bmk-local{margin-top:8px;padding:7px 8px;border-radius:4px;background:#F5F8FA;',
    'border:1px solid #E1E8ED;font-size:10.5px;line-height:1.4;color:#4A5760;}',
    '.bmk-local b{color:#2D3B45;font-weight:700;}',
    '.bmk-warn{display:block;margin-top:6px;color:#B3261E;font-size:10px;font-weight:700;',
    'line-height:1.35;cursor:help;text-decoration:underline dotted rgba(179,38,30,.5);',
    'text-underline-offset:2px;}',
    '.bmk-move{margin-top:8px;display:flex;flex-direction:column;gap:5px;}',

    /* inline layout, used inside the Canvas embed --------------------- */
    '.bmk-dispenser.is-inline{position:static;width:auto;margin:0 0 18px;box-shadow:none;}',
    '.bmk-dispenser.is-inline .bmk-body{display:flex;flex-wrap:wrap;align-items:flex-start;',
    'gap:10px 14px;}',
    '.bmk-dispenser.is-inline .bmk-swatches{margin:0;}',
    '.bmk-dispenser.is-inline .bmk-handle{width:auto;padding:7px 14px;align-self:flex-start;}',
    '.bmk-dispenser.is-inline .bmk-progress-handle{margin-top:0;}',
    '.bmk-dispenser.is-inline .bmk-hint{margin:0;flex:1 1 210px;min-width:170px;}',
    '.bmk-dispenser.is-inline .bmk-local{margin:0;flex:1 1 250px;}',
    '.bmk-dispenser.is-inline .bmk-move{margin:0;flex-direction:row;flex-wrap:wrap;}',
    '.bmk-dispenser.is-inline .bmk-xfer{padding:6px 10px;}',
    '.bmk-dispenser.is-inline .bmk-list-toggle{margin:0;width:auto;padding:6px 12px;}',
    '.bmk-dispenser.is-inline .bmk-list{flex:1 1 100%;max-height:200px;}',

    /* armed: a bookmark is in hand, waiting for a click --------------- */
    'body.bmk-arming{cursor:crosshair;}',
    'body.bmk-arming a,body.bmk-arming summary,body.bmk-arming button{cursor:crosshair;}',
    '.bmk-sw.is-armed{outline:2px solid #2D3B45;outline-offset:2px;transform:translateY(-3px);}',
    '.bmk-handle.is-armed{outline:2px solid #2D3B45;outline-offset:2px;}',
    '.bmk-armbar{margin-top:8px;padding:7px 9px;border-radius:5px;background:#FFF7E0;',
    'border:1px solid #E7CF93;font-size:11px;line-height:1.4;color:#5e4a18;}',
    '.bmk-dispenser.is-inline .bmk-armbar{margin:0;flex:1 1 100%;}',
    '.bmk-xfer{padding:6px;font:inherit;font-size:11px;font-weight:600;color:#2D3B45;',
    'background:#fff;border:1px solid #C7CDD1;border-radius:5px;cursor:pointer;}',
    '.bmk-xfer:hover{background:#F5F8FA;border-color:#9AA6AE;}',
    '.bmk-xfer:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',

    /* transfer dialog ---------------------------------------------------- */
    '.bmk-scrim{position:fixed;inset:0;z-index:1100;background:rgba(45,59,69,.42);',
    'display:flex;align-items:center;justify-content:center;padding:20px;}',
    '.bmk-modal{width:min(640px,100%);max-height:86vh;overflow:auto;background:#fff;',
    'border-radius:8px;box-shadow:0 12px 40px rgba(45,59,69,.35);padding:18px 20px;',
    'font-family:inherit;color:#2D3B45;font-size:13px;line-height:1.5;}',
    '.bmk-modal h2{margin:0 0 6px;font-size:16px;font-weight:700;}',
    '.bmk-modal p{margin:0 0 10px;font-size:12.5px;color:#4A5760;}',
    '.bmk-modal ol{margin:0 0 12px;padding-left:20px;font-size:12.5px;color:#4A5760;}',
    '.bmk-modal li{margin:3px 0;}',
    '.bmk-modal textarea{width:100%;height:210px;font-family:ui-monospace,SFMono-Regular,',
    'Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;padding:9px 10px;',
    'border:1px solid #C7CDD1;border-radius:5px;resize:vertical;color:#2D3B45;}',
    '.bmk-modal textarea:focus{outline:2px solid #0374B5;outline-offset:1px;}',
    '.bmk-modal-foot{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;}',
    '.bmk-modal-foot .grow{flex:1;}',
    '.bmk-btn{padding:8px 13px;font:inherit;font-size:12.5px;font-weight:700;border-radius:5px;',
    'cursor:pointer;border:1px solid #C7CDD1;background:#fff;color:#2D3B45;}',
    '.bmk-btn:hover{background:#F5F8FA;}',
    '.bmk-btn.primary{background:#0374B5;border-color:#0374B5;color:#fff;}',
    '.bmk-btn.primary:hover{background:#0a5a8a;}',
    '.bmk-btn:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',
    '.bmk-say{font-size:12px;color:#0B874B;font-weight:600;}',
    '.bmk-say.bad{color:#9B3B3B;}',
    '.bmk-flashmsg{margin-top:8px;padding:7px 9px;border-radius:5px;background:#F2FAF5;',
    'border:1px solid #B8E0C8;font-size:11px;line-height:1.4;color:#0b5c34;font-weight:600;}',
    '.bmk-dispenser.is-inline .bmk-flashmsg{margin:0;flex:1 1 100%;}',
    '.bmk-list-toggle{margin-top:8px;width:100%;padding:6px;font:inherit;font-size:11px;',
    'font-weight:600;color:#0374B5;background:#F3F8FB;border:1px solid #CFE3F0;',
    'border-radius:5px;cursor:pointer;}',
    '.bmk-list-toggle:hover{background:#E8F2F9;}',
    '.bmk-list{margin-top:7px;max-height:230px;overflow:auto;border-top:1px solid #E8EAEC;}',
    '.bmk-list button{display:flex;gap:6px;width:100%;text-align:left;padding:6px 2px;',
    'border:0;border-bottom:1px solid #F0F2F4;background:none;cursor:pointer;font:inherit;',
    'font-size:11px;color:#2D3B45;}',
    '.bmk-list button:hover{background:#F7FAFC;}',
    '.bmk-list .dot{flex:0 0 9px;width:9px;height:9px;border-radius:2px;margin-top:3px;}',
    '.bmk-list .tx{flex:1;min-width:0;}',
    '.bmk-list .tx b{display:block;font-weight:700;}',
    '.bmk-list .tx i{font-style:normal;color:#6B7780;}',

    /* placed bookmark tab ---------------------------------------------- */
    /* the tab: fixed size, hangs off the right edge of the block it marks,   */
    /* with a ribbon notch cut out of its tail so it reads as a bookmark      */
    '.bmk-tab{position:absolute;top:6px;right:-10px;z-index:55;display:flex;align-items:center;',
    'height:22px;width:170px;padding:0 18px 0 8px;border:0;font:inherit;font-size:11px;',
    'font-weight:700;line-height:22px;cursor:pointer;white-space:nowrap;overflow:hidden;',
    'clip-path:polygon(0 0,100% 0,calc(100% - 9px) 50%,100% 100%,0 100%);}',
    '.bmk-tab .lbl{overflow:hidden;text-overflow:ellipsis;}',
    '.bmk-tab:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',
    '.bmk-tab:hover{filter:brightness(1.04);}',
    /* on a section header the tab hangs off the bottom edge, so it never */
    /* covers the header\'s own week dates or open/close marker            */
    '.bmk-tab-summary{top:auto;bottom:-9px;right:16px;',
    'box-shadow:0 2px 3px rgba(45,59,69,.18);}',

    /* stub: a bookmark still poking out of a shut section ---------------- */
    '.bmk-stub{position:absolute;bottom:-7px;width:11px;height:16px;border-radius:1px;',
    'cursor:pointer;z-index:56;box-shadow:0 1px 2px rgba(45,59,69,.2);',
    'clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - 5px),0 100%);}',
    '.bmk-stub:hover{filter:brightness(1.06);}',
    '.bmk-stub:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',

    /* note card, in flow so the page makes room for it ------------------ */
    '.bmk-card{margin:6px 0 10px;border-left:4px solid;border-radius:0 6px 6px 0;',
    'background:#FFFDF6;border-top:1px solid #E8EAEC;border-right:1px solid #E8EAEC;',
    'border-bottom:1px solid #E8EAEC;padding:9px 11px;font-size:12.5px;}',
    '.bmk-card textarea{width:100%;min-height:56px;resize:vertical;font:inherit;',
    'font-size:12.5px;line-height:1.45;color:#2D3B45;background:#fff;border:1px solid #DDE1E4;',
    'border-radius:4px;padding:6px 7px;}',
    '.bmk-card textarea:focus{outline:2px solid #0374B5;outline-offset:1px;}',
    '.bmk-card .bmk-card-foot{display:flex;align-items:center;gap:6px;margin-top:7px;}',
    '.bmk-card .bmk-card-foot .grow{flex:1;}',
    '.bmk-card .bmk-mini{width:16px;height:16px;border-radius:3px;padding:0;cursor:pointer;',
    'border:1px solid rgba(0,0,0,.18);}',
    '.bmk-card .bmk-mini[aria-pressed="true"]{outline:2px solid #2D3B45;outline-offset:1px;}',
    '.bmk-card .bmk-del{border:0;background:none;color:#9B3B3B;font:inherit;font-size:11px;',
    'cursor:pointer;padding:3px 5px;border-radius:3px;}',
    '.bmk-card .bmk-del:hover{background:#FBEEEE;}',
    '.bmk-card .bmk-saved{font-size:10.5px;color:#6B7780;}',

    /* drag + placement feedback ----------------------------------------- */
    '.bmk-ghost{position:fixed;z-index:1000;pointer-events:none;height:22px;padding:0 9px;',
    'border-radius:3px;font:inherit;font-size:11px;font-weight:700;line-height:21px;',
    'border:1px solid;box-shadow:0 3px 10px rgba(45,59,69,.25);opacity:.95;}',
    '.bmk-target{outline:2px dashed #0374B5!important;outline-offset:2px;',
    'background:rgba(3,116,181,.05)!important;}',
    '.bmk-flash{animation:bmkflash 1.1s ease;}',
    '@keyframes bmkflash{0%{background:rgba(255,197,61,.55);}100%{background:transparent;}}',
    '.bmk-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;',
    'clip:rect(0 0 0 0);white-space:nowrap;border:0;}',

    '@media (max-width:900px){.bmk-dispenser{top:auto;bottom:10px;right:10px;}',
    '.bmk-tab{right:2px;}.bmk-tab::after{display:none;}}',
    '@media print{.bmk-ui,.bmk-tab{display:none!important;}.bmk-card{break-inside:avoid;}}',
    (reduceMotion ? '.bmk-flash{animation:none;}' : '')
  ].join('');

  function injectCSS() {
    var s = document.createElement('style');
    s.setAttribute('data-bmk', '1');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------- utilities */

  function colorOf(mark) {
    if (mark.kind === 'progress') return PROGRESS;
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i].id === mark.color) return COLORS[i];
    return COLORS[0];
  }

  function tabLabel(mark) {
    var t = (mark.text || '').replace(/\s+/g, ' ').trim();
    if (mark.kind === 'progress') return t || "I'm here";
    if (!t) return 'Note';
    return t.length > MAX_TAB_CHARS ? t.slice(0, MAX_TAB_CHARS - 1) + '…' : t;
  }

  function openAncestors(el) {
    var d = el.closest('details');
    while (d) {
      d.setAttribute('open', '');
      d = d.parentElement ? d.parentElement.closest('details') : null;
    }
  }

  /* A closed <details> keeps a layout box in Chrome (content-visibility), so
     getBoundingClientRect and offsetParent both lie about it. Walk the
     ancestry instead: content is visible only if every enclosing <details> is
     open, or the element sits inside that details' own <summary>. */
  function inClosedDetails(el) {
    var node = el;
    while (node) {
      var d = node.parentElement ? node.parentElement.closest('details') : null;
      if (!d) return false;
      if (!d.open) {
        var s = d.querySelector(':scope > summary');
        if (!(s && (node === s || s.contains(node)))) return true;
      }
      node = d;
    }
    return false;
  }

  function isVisible(el) {
    if (inClosedDetails(el)) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  }

  function announce(msg) {
    var live = document.getElementById('bmk-live');
    if (live) live.textContent = msg;
  }

  /* -------------------------------------------------------------- rendering */

  function clearRendered() {
    var old = document.querySelectorAll('.bmk-tab, .bmk-card, .bmk-stub');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }

  function renderAll() {
    clearRendered();
    buildIndex();
    var orphans = 0;

    var stubbed = [];   /* summary element -> how many stubs already on it */

    marks.forEach(function (mark) {
      var host = elementForKey(mark.key);
      if (!host) { orphans++; return; }

      /* A bookmark ON a <details> hangs from its <summary>, which stays
         visible when the section is shut — otherwise the tab would vanish
         along with the content it marks. */
      var onSummary = host.matches('details');
      var mount = onSummary ? (host.querySelector(':scope > summary') || host) : host;
      if (getComputedStyle(mount).position === 'static') mount.style.position = 'relative';

      /* If the block is inside a collapsed section the real tab is hidden with
         it, so show a stub on the closed section's own header — the way a
         bookmark still sticks out of a shut book. */
      var closed = outermostClosedDetails(mount);
      if (closed) addStub(closed, mark, stubbed);

      var c = colorOf(mark);

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'bmk-tab' + (onSummary ? ' bmk-tab-summary' : '');
      tab.dataset.bmkId = mark.id;
      tab.style.background = c.bg;
      tab.style.borderColor = c.line;
      tab.style.color = c.ink;
      tab.setAttribute('aria-expanded', mark.open ? 'true' : 'false');
      tab.setAttribute('aria-label',
        (mark.kind === 'progress' ? 'Progress marker: ' : 'Bookmark: ') + tabLabel(mark));
      tab.innerHTML = '<span class="lbl"></span>';
      tab.querySelector('.lbl').textContent = tabLabel(mark);
      mount.appendChild(tab);

      tab.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        mark.open = !mark.open;
        save(marks);
        renderAll();
        if (mark.open) {
          var ta = document.querySelector('.bmk-card[data-bmk-id="' + mark.id + '"] textarea');
          if (ta) ta.focus();
        }
      });

      if (mark.open) host.parentNode.insertBefore(buildCard(mark, c), host.nextSibling);
    });

    /* A header can carry both a tab of its own and stubs for marks buried
       under it — slide the stubs clear of the tab so they never overlap. */
    stubbed.forEach(function (entry) {
      if (!entry.el.querySelector(':scope > .bmk-tab-summary')) return;
      var st = entry.el.querySelectorAll(':scope > .bmk-stub');
      for (var i = 0; i < st.length; i++) {
        st[i].style.right = (parseInt(st[i].style.right, 10) + 190) + 'px';
      }
    });

    updateDispenser(orphans);
  }

  /* The highest closed <details> above this element — the one whose header is
     the visible edge of everything hidden underneath it. */
  function outermostClosedDetails(el) {
    var found = null, node = el;
    while (node) {
      var d = node.parentElement ? node.parentElement.closest('details') : null;
      if (!d) break;
      if (!d.open) {
        var sm = d.querySelector(':scope > summary');
        if (!(sm && (node === sm || sm.contains(node)))) found = d;
      }
      node = d;
    }
    return found;
  }

  function addStub(details, mark, stubbed) {
    var summary = details.querySelector(':scope > summary');
    if (!summary) return;
    if (getComputedStyle(summary).position === 'static') summary.style.position = 'relative';

    var entry = null;
    for (var i = 0; i < stubbed.length; i++) {
      if (stubbed[i].el === summary) { entry = stubbed[i]; break; }
    }
    if (!entry) { entry = { el: summary, n: -1 }; stubbed.push(entry); }
    var slot = ++entry.n;

    var c = colorOf(mark);
    var stub = document.createElement('span');
    stub.className = 'bmk-ui bmk-stub';
    stub.setAttribute('role', 'button');
    stub.setAttribute('tabindex', '0');
    stub.style.background = c.bg;
    /* 2026-08-20: week and day summaries carry a +/− expander at right:0 (17px
       wide). The old 16px base landed stubs exactly on it — clicks meant for
       the expander hit the stub. Clear it; module/bigpic heads keep 16px. */
    var base = summary.querySelector('.wplus') ? 44 : 16;
    stub.style.right = (base + slot * 15) + 'px';
    stub.title = (mark.kind === 'progress' ? "You are here: " : 'Bookmark: ') + tabLabel(mark) +
                 ' — click to open';
    stub.setAttribute('aria-label', stub.title);

    function reveal(e) {
      e.preventDefault();
      e.stopPropagation();
      var el = elementForKey(mark.key);
      if (!el) return;
      openAncestors(el);
      setTimeout(function () {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        el.classList.add('bmk-flash');
        setTimeout(function () { el.classList.remove('bmk-flash'); }, 1200);
      }, 40);
    }
    stub.addEventListener('click', reveal);
    stub.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') reveal(e);
    });
    summary.appendChild(stub);
  }

  function buildCard(mark, c) {
    var card = document.createElement('div');
    card.className = 'bmk-card';
    card.dataset.bmkId = mark.id;
    card.style.borderLeftColor = c.line;

    var ta = document.createElement('textarea');
    ta.value = mark.text || '';
    ta.setAttribute('aria-label', 'Your note');
    ta.placeholder = mark.kind === 'progress'
      ? 'Where you are — e.g. "stopped here Tue, pick up at the tyre-pressure bit"'
      : 'What you want to remember about this…';
    card.appendChild(ta);

    var foot = document.createElement('div');
    foot.className = 'bmk-card-foot';

    if (mark.kind !== 'progress') {
      COLORS.forEach(function (col) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bmk-mini';
        b.style.background = col.bg;
        b.style.borderColor = col.line;
        b.setAttribute('aria-label', col.label);
        b.setAttribute('aria-pressed', mark.color === col.id ? 'true' : 'false');
        b.addEventListener('click', function () {
          mark.color = col.id;
          save(marks);
          renderAll();
        });
        foot.appendChild(b);
      });
    }

    var grow = document.createElement('span');
    grow.className = 'grow';
    foot.appendChild(grow);

    var saved = document.createElement('span');
    saved.className = 'bmk-saved';
    foot.appendChild(saved);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'bmk-del';
    del.textContent = mark.kind === 'progress' ? 'Remove marker' : 'Delete';
    del.addEventListener('click', function () {
      marks = marks.filter(function (m) { return m.id !== mark.id; });
      save(marks);
      renderAll();
      announce('Bookmark deleted.');
    });
    foot.appendChild(del);
    card.appendChild(foot);

    var timer = null;
    ta.addEventListener('input', function () {
      mark.text = ta.value;
      clearTimeout(timer);
      timer = setTimeout(function () {
        var ok = save(marks);
        saved.textContent = ok ? 'Saved on this computer only'
                              : 'Not saved — this browser is blocking local storage';
        var tab = document.querySelector('.bmk-tab[data-bmk-id="' + mark.id + '"] .lbl');
        if (tab) tab.textContent = tabLabel(mark);
      }, 400);
    });

    return card;
  }

  /* ------------------------------------------------------------- dispenser */

  var dispenser, listEl, listOpen = false;

  function buildDispenser() {
    dispenser = document.createElement('div');
    dispenser.className = 'bmk-ui bmk-dispenser';
    dispenser.innerHTML =
      '<div class="bmk-title">' +
        '<span class="bmk-emo" aria-hidden="true">\uD83D\uDD16</span>' +
        '<span class="bmk-name"><span class="bmk-eyebrow">Own your progress</span>Bookmarks</span>' +
        '<button type="button" class="bmk-collapse" aria-label="Hide bookmarks panel">\u2013</button>' +
      '</div>' +
      '<div class="bmk-body">' +
        '<div class="bmk-swatches" role="group" aria-label="Bookmarks — drag one onto the page"></div>' +
        '<button type="button" class="bmk-handle bmk-progress-handle">I&rsquo;m here</button>' +
        '<div class="bmk-hint">Click a bookmark to pick it up, then click the part of the page ' +
        'you want to mark. You can also drag one straight out of the stack, or press Enter on one ' +
        'and use the arrow keys.</div>' +
        '<div class="bmk-local"><b>Saved on this computer only.</b> Your bookmarks and notes stay ' +
        'in this browser. They are not sent anywhere \u2014 not to your instructor, not to a server. ' +
        'Clearing your browser data erases them. To carry them to another computer, ' +
        'email them to yourself with the button below.' +
        (IS_SAFARI ? '<span class="bmk-warn" title="Safari clears this kind of storage by ' +
          'itself, without warning you first. The only copy that survives is one you have ' +
          'emailed to yourself. Use \u201cEmail my notes to me\u201d and keep the message \u2014 ' +
          'you can paste it back on any computer, in any browser.">' +
          (EMBEDDED
            ? 'Safari will not keep these once you quit the browser. Email yourself a copy.'
            : 'Safari erases these after 7 days without opening this page. Email yourself a copy.') +
          '</span>' : '') +
        '</div>' +
        '<button type="button" class="bmk-list-toggle"></button>' +
        '<div class="bmk-list" hidden></div>' +
        '<div class="bmk-move">' +
          '<button type="button" class="bmk-xfer bmk-out">Email my notes to me</button>' +
          '<button type="button" class="bmk-xfer bmk-in">Paste notes from another computer</button>' +
        '</div>' +
      '</div>' +
      '<div id="bmk-live" class="bmk-sr" aria-live="polite"></div>';

    if (EMBEDDED) {
      dispenser.classList.add('is-inline');
      var page = document.querySelector('.page') || document.body;
      var header = page.querySelector('.course-header');
      if (header && header.nextSibling) page.insertBefore(dispenser, header.nextSibling);
      else page.insertBefore(dispenser, page.firstChild);
    } else {
      document.body.appendChild(dispenser);
    }

    /* Each colour in the stack IS a bookmark you pull out — there is no
       separate "drag me" control to find first. */
    var sw = dispenser.querySelector('.bmk-swatches');
    COLORS.forEach(function (col) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bmk-sw';
      b.style.background = col.bg;
      b.style.borderColor = col.line;
      b.setAttribute('aria-label', 'Drag out a ' + col.label.toLowerCase() + ' bookmark');
      b.title = col.label + ' bookmark — drag onto the page';
      sw.appendChild(b);
      makeDraggable(b, 'note', col.id);
    });

    dispenser.querySelector('.bmk-collapse').addEventListener('click', function () {
      userToggled = true;
      setMin(!dispenser.classList.contains('is-min'));
    });

    /* Don't sit on top of the text. The column is 1040px wide and centred, so
       the panel only opens by itself when the window is wide enough to hold
       it in the margin. */
    fit();
    window.addEventListener('resize', fit);

    listEl = dispenser.querySelector('.bmk-list');
    dispenser.querySelector('.bmk-list-toggle').addEventListener('click', function () {
      listOpen = !listOpen;
      listEl.hidden = !listOpen;
      updateDispenser();
    });

    dispenser.querySelector('.bmk-out').addEventListener('click', openExport);
    dispenser.querySelector('.bmk-in').addEventListener('click', openImport);

    makeDraggable(dispenser.querySelector('.bmk-progress-handle'), 'progress');
    paintHandles();
  }

  var userToggled = false;

  function setMin(min) {
    dispenser.classList.toggle('is-min', min);
    var b = dispenser.querySelector('.bmk-collapse');
    b.textContent = min ? '+' : '–';
    b.setAttribute('aria-label', min ? 'Show bookmark tools' : 'Hide bookmark tools');
  }

  function fit() {
    if (userToggled || EMBEDDED) return;
    var page = document.querySelector('.page');
    var colW = page ? page.getBoundingClientRect().width : 1040;
    setMin(window.innerWidth - colW < 400);
  }

  function paintHandles() {
    var p = dispenser.querySelector('.bmk-progress-handle');
    p.style.background = PROGRESS.bg; p.style.borderColor = PROGRESS.line; p.style.color = PROGRESS.ink;
  }

  function updateDispenser(orphans) {
    if (!dispenser) return;
    var n = marks.length;
    var toggle = dispenser.querySelector('.bmk-list-toggle');
    toggle.textContent = (listOpen ? 'Hide' : 'Show') + ' my ' + n +
      (n === 1 ? ' bookmark' : ' bookmarks');
    toggle.hidden = n === 0;
    if (n === 0) { listEl.hidden = true; return; }
    if (!listOpen) return;

    listEl.innerHTML = '';
    marks.forEach(function (mark) {
      var host = elementForKey(mark.key);
      var c = colorOf(mark);
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="dot"></span><span class="tx"><b></b><i></i></span>';
      b.querySelector('.dot').style.background = c.bg;
      b.querySelector('b').textContent = tabLabel(mark);
      b.querySelector('i').textContent = host
        ? whereLabel(mark.key, host)
        : 'this part of the page has moved';
      b.addEventListener('click', function () {
        var el = elementForKey(mark.key);
        if (!el) { announce('That block is no longer on the page.'); return; }
        openAncestors(el);
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        el.classList.add('bmk-flash');
        setTimeout(function () { el.classList.remove('bmk-flash'); }, 1200);
      });
      listEl.appendChild(b);
    });
    if (orphans) {
      var note = document.createElement('div');
      note.style.cssText = 'padding:6px 2px;font-size:10.5px;color:#6B7780;';
      note.textContent = orphans + ' bookmark(s) point at content that has changed. ' +
        'They are kept, not deleted.';
      listEl.appendChild(note);
    }
  }

  function whereLabel(key, host) {
    if (host) {
      var t = textOf(host.querySelector('.wt, .title, .wk-head, .module-head .name, .wsec-head') || host, 52);
      if (t) return t;
    }
    return whereFromKey(key);
  }

  function whereFromKey(key) {
    return key.split('|').map(function (p) {
      return p.replace(/^link:/, '').replace(/^t:/, '').replace(/^day:/, '')
              .replace(/\.html$/, '').replace(/-/g, ' ');
    }).join(' · ').slice(0, 60);
  }

  /* ------------------------------------------------- carrying notes across

     The exported text is the same semantic keys the bookmarks are stored
     under, so a paste on another computer puts every note back on the exact
     item it was written against — progress marker included. Lines beginning
     `>` are a human-readable label for whoever reads the email; the parser
     ignores them. Everything before the first `@` is ignored too, so Gmail's
     quoting, signatures and "On Tue... wrote:" wrappers do no harm.        */

  var FENCE_TOP = '--- my course bookmarks · v1 ---';
  var FENCE_END = '--- end ---';

  function courseLabel() {
    var h = document.querySelector('.course-header .eyebrow');
    return h ? textOf(h) : document.title;
  }

  function serialize() {
    var out = [FENCE_TOP, courseLabel(), '', 'Paste this whole message into ' +
      '"Paste notes from another computer" on the course page.', ''];
    marks.forEach(function (m) {
      out.push('@ ' + m.key);
      out.push('> ' + (m.kind === 'progress' ? "I'm here · " : '') +
               whereLabel(m.key, elementForKey(m.key)));
      out.push('# ' + (m.kind === 'progress' ? 'progress' : m.color));
      out.push((m.text || '').replace(/\r/g, ''));
      out.push('');
    });
    out.push(FENCE_END);
    return out.join('\n');
  }

  function parse(text) {
    var lines = String(text).replace(/\r/g, '').split('\n');
    var found = [], cur = null;

    function flush() {
      if (!cur) return;
      cur.text = cur.lines.join('\n').replace(/^\n+|\n+$/g, '');
      delete cur.lines;
      found.push(cur);
      cur = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      var bare = ln.replace(/^[\s>|]*(?=@\s)/, '');   /* survive email quoting */
      if (bare.indexOf('@ ') === 0) {
        flush();
        cur = { key: bare.slice(2).trim(), kind: 'note', color: COLORS[0].id, lines: [] };
        continue;
      }
      if (!cur) continue;
      if (ln.indexOf('>') === 0) continue;              /* human-readable label */
      if (ln.indexOf('# ') === 0) {
        var v = ln.slice(2).trim().toLowerCase();
        if (v === 'progress') { cur.kind = 'progress'; cur.color = null; }
        else { cur.color = v; }
        continue;
      }
      if (ln.trim() === FENCE_END) { flush(); break; }
      cur.lines.push(ln);
    }
    flush();

    return found.filter(function (m) { return m.key; }).map(function (m) {
      return {
        id: uid(), key: m.key, kind: m.kind,
        color: m.kind === 'progress' ? null
             : (COLORS.some(function (c) { return c.id === m.color; }) ? m.color : COLORS[0].id),
        text: m.text, open: false, ts: Date.now()
      };
    });
  }

  /* Merge, never clobber: a note already on the same item in the same colour
     is updated, anything new is added, and the single progress marker is
     replaced. Notes made on THIS computer are never silently dropped. */
  function mergeIn(incoming) {
    var added = 0, updated = 0;
    incoming.forEach(function (m) {
      if (m.kind === 'progress') {
        marks = marks.filter(function (x) { return x.kind !== 'progress'; });
        marks.push(m); added++;
        return;
      }
      var hit = null;
      for (var i = 0; i < marks.length; i++) {
        if (marks[i].kind !== 'progress' && marks[i].key === m.key &&
            marks[i].color === m.color) { hit = marks[i]; break; }
      }
      if (hit) { if (hit.text !== m.text) { hit.text = m.text; updated++; } }
      else { marks.push(m); added++; }
    });
    save(marks);
    renderAll();
    return { added: added, updated: updated };
  }

  function modal(build) {
    var prevFocus = document.activeElement;
    var scrim = document.createElement('div');
    scrim.className = 'bmk-ui bmk-scrim';
    var box = document.createElement('div');
    box.className = 'bmk-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    scrim.appendChild(box);

    function close() {
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      document.removeEventListener('keydown', onKey, true);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
    scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
    document.addEventListener('keydown', onKey, true);

    build(box, close);
    document.body.appendChild(scrim);
    return close;
  }

  /* One press: copy the notes, then open a Gmail compose already carrying
     them. A compose URL cannot attach a file, but it CAN carry the whole
     thing as body text — until the URL gets too long, at which point the
     clipboard is the payload and the dialog explains the paste. */

  var URL_BUDGET = 7000;   /* conservative: Gmail truncates long compose URLs */

  function todayLabel() {
    var d = new Date();
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
  }

  function subjectLine() {
    return courseLabel() + ' \u2014 my bookmarks, ' + todayLabel();
  }

  var PREAMBLE =
    'Your notes are below. Put your own address in To and send this to yourself, or just ' +
    'save it as a draft \u2014 either way you have a copy.\n\n' +
    'To put them back on another computer: open the course page, choose "Paste notes from ' +
    'another computer", and paste this whole message in.\n\n';

  function gmailUrl(body) {
    return 'https://mail.google.com/mail/?view=cm&fs=1&tf=1' +
           '&su=' + encodeURIComponent(subjectLine()) +
           '&body=' + encodeURIComponent(body);
  }

  /* Copy without disturbing what the student is looking at. execCommand is
     tried first because the async Clipboard API needs a permission a
     cross-origin iframe (i.e. Canvas) will not have been granted. */
  function copyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {}, function () {});
      return 'async';
    }
    return ok;
  }

  function openExport() {
    if (!marks.length) {
      alert('You have not made any bookmarks on this page yet.');
      return;
    }

    var payload = serialize();
    var copied = copyText(payload);
    var full = PREAMBLE + payload;
    var fits = gmailUrl(full).length <= URL_BUDGET;

    window.open(gmailUrl(fits ? full : PREAMBLE), '_blank', 'noopener');

    /* Everything worked: say so briefly in the panel and get out of the way. */
    if (fits && copied) {
      flash('Gmail opened with your ' + marks.length +
            (marks.length === 1 ? ' bookmark' : ' bookmarks') + ' in it. Send it to yourself.');
      return;
    }

    /* Something needs the student to act — show the text and say what to do. */
    exportDialog(payload, fits, copied);
  }

  function flash(msg) {
    var el = dispenser.querySelector('.bmk-flashmsg');
    if (!el) {
      el = document.createElement('div');
      el.className = 'bmk-flashmsg';
      dispenser.querySelector('.bmk-body').appendChild(el);
    }
    el.textContent = msg;
    announce(msg);
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 9000);
  }

  function exportDialog(payload, fits, copied) {
    modal(function (box, close) {
      box.innerHTML =
        '<h2>One more step</h2>' +
        '<p>' + (!fits
          ? 'You have enough notes now that they will not fit in the link, so Gmail opened empty. ' +
            (copied ? 'Your notes are already on the clipboard \u2014 click in the message and paste.'
                    : 'Copy the text below, then paste it into the message.')
          : 'Gmail opened, but this browser would not let me copy for you. ' +
            'Select the text below, copy it, and paste it into the message.') +
        '</p>';
      var ta = document.createElement('textarea');
      ta.value = payload;
      ta.readOnly = true;
      ta.setAttribute('aria-label', 'Your bookmarks as text');
      box.appendChild(ta);

      var foot = document.createElement('div');
      foot.className = 'bmk-modal-foot';
      var say = document.createElement('span');
      say.className = 'bmk-say';

      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'bmk-btn primary';
      copy.textContent = 'Copy';
      copy.addEventListener('click', function () {
        ta.select();
        var ok = copyText(payload);
        say.className = ok ? 'bmk-say' : 'bmk-say bad';
        say.textContent = ok ? 'Copied.'
                             : 'Could not copy for you \u2014 select the text above and copy it.';
      });

      var again = document.createElement('button');
      again.type = 'button';
      again.className = 'bmk-btn';
      again.textContent = 'Open Gmail again';
      again.addEventListener('click', function () {
        window.open(gmailUrl(PREAMBLE), '_blank', 'noopener');
      });

      var shut = document.createElement('button');
      shut.type = 'button';
      shut.className = 'bmk-btn';
      shut.textContent = 'Close';
      shut.addEventListener('click', close);

      foot.appendChild(copy);
      foot.appendChild(again);
      var grow = document.createElement('span');
      grow.className = 'grow';
      foot.appendChild(grow);
      foot.appendChild(say);
      foot.appendChild(shut);
      box.appendChild(foot);
      setTimeout(function () { copy.focus(); }, 0);
    });
  }

  function openImport() {
    modal(function (box, close) {
      box.innerHTML =
        '<h2>Paste notes from another computer</h2>' +
        '<p>Paste the whole email you sent yourself. Quoted lines, signatures and the rest of the ' +
        'message are ignored. Notes you have already made here are kept — anything on the same item ' +
        'in the same colour is updated, and your progress marker moves to where the pasted one is.</p>';
      var ta = document.createElement('textarea');
      ta.placeholder = 'Paste here…';
      ta.setAttribute('aria-label', 'Paste your bookmarks text');
      box.appendChild(ta);

      var foot = document.createElement('div');
      foot.className = 'bmk-modal-foot';
      var say = document.createElement('span');
      say.className = 'bmk-say';

      var go = document.createElement('button');
      go.type = 'button'; go.className = 'bmk-btn primary'; go.textContent = 'Bring them in';
      go.addEventListener('click', function () {
        var found = parse(ta.value);
        if (!found.length) {
          say.className = 'bmk-say bad';
          say.textContent = 'Nothing recognisable in that — paste the whole message.';
          return;
        }
        var r = mergeIn(found);
        say.className = 'bmk-say';
        say.textContent = r.added + ' added, ' + r.updated + ' updated.';
        announce(say.textContent);
        setTimeout(close, 1100);
      });

      var shut = document.createElement('button');
      shut.type = 'button'; shut.className = 'bmk-btn'; shut.textContent = 'Cancel';
      shut.addEventListener('click', close);

      foot.appendChild(go);
      var grow = document.createElement('span'); grow.className = 'grow'; foot.appendChild(grow);
      foot.appendChild(say); foot.appendChild(shut);
      box.appendChild(foot);
      setTimeout(function () { ta.focus(); }, 0);
    });
  }

  /* --------------------------------------------------------- drag to place */

  function anchorFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el.closest('.bmk-ui') || el.closest('.bmk-card')) return null;
    var a = el.closest(ANCHOR_QUERY);
    return a || null;
  }

  function makeDraggable(handle, kind, colorId) {
    var ghost = null, target = null, dragging = false, moved = false, startX = 0, startY = 0;

    handle.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      moved = false;
      startX = e.clientX; startY = e.clientY;
      handle.setPointerCapture(e.pointerId);
      var c = kind === 'progress' ? PROGRESS : colorOf({ color: colorId });
      ghost = document.createElement('div');
      ghost.className = 'bmk-ui bmk-ghost';
      ghost.textContent = kind === 'progress' ? "I'm here" : 'Note';
      ghost.style.background = c.bg;
      ghost.style.borderColor = c.line;
      ghost.style.color = c.ink;
      document.body.appendChild(ghost);
      move(e);
    });

    handle.addEventListener('pointermove', function (e) { if (dragging) move(e); });

    handle.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      if (ghost) { ghost.parentNode.removeChild(ghost); ghost = null; }
      if (target) { target.classList.remove('bmk-target'); }

      /* Pressed without dragging = picked it up. Inside the Canvas embed this
         is the only workable path, because the parent page cannot scroll
         while a drag is in progress. */
      if (!moved) {
        if (target) target.classList.remove('bmk-target');
        target = null;
        if (armed && armed.handle === handle) disarm();
        else arm(kind, colorId, handle);
        return;
      }
      if (target) { place(target, kind, colorId); target = null; }
    });

    handle.addEventListener('pointercancel', function () {
      dragging = false;
      if (ghost) { ghost.parentNode.removeChild(ghost); ghost = null; }
      if (target) { target.classList.remove('bmk-target'); target = null; }
    });

    /* keyboard placement: Enter walks the anchorable blocks */
    handle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        keyboardPlace(kind, colorId);
      }
    });

    function move(e) {
      if (!moved && (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4)) {
        moved = true;
      }
      ghost.style.left = (e.clientX + 12) + 'px';
      ghost.style.top = (e.clientY - 10) + 'px';
      if (ghost) ghost.style.display = 'none';
      var a = anchorFromPoint(e.clientX, e.clientY);
      if (ghost) ghost.style.display = '';
      if (a !== target) {
        if (target) target.classList.remove('bmk-target');
        target = a;
        if (target) target.classList.add('bmk-target');
      }
    }
  }

  var armed = null;

  function armBar(text) {
    var bar = dispenser.querySelector('.bmk-armbar');
    if (!text) { if (bar) bar.parentNode.removeChild(bar); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'bmk-armbar';
      dispenser.querySelector('.bmk-body').appendChild(bar);
    }
    bar.textContent = text;
  }

  function arm(kind, colorId, handle) {
    disarm();
    armed = { kind: kind, colorId: colorId, handle: handle };
    handle.classList.add('is-armed');
    document.body.classList.add('bmk-arming');
    armBar(kind === 'progress'
      ? 'Marker in hand — click where you are up to. Escape to put it back.'
      : 'Bookmark in hand — click the part of the page you want to mark. Escape to put it back.');
    announce('Bookmark picked up. Click a block to place it, or press Escape.');
    document.addEventListener('click', onArmedClick, true);
    document.addEventListener('mousemove', onArmedMove, true);
    document.addEventListener('keydown', onArmedKey, true);
  }

  function disarm() {
    if (!armed) return;
    armed.handle.classList.remove('is-armed');
    armed = null;
    document.body.classList.remove('bmk-arming');
    armBar(null);
    var hot = document.querySelectorAll('.bmk-target');
    for (var i = 0; i < hot.length; i++) hot[i].classList.remove('bmk-target');
    document.removeEventListener('click', onArmedClick, true);
    document.removeEventListener('mousemove', onArmedMove, true);
    document.removeEventListener('keydown', onArmedKey, true);
  }

  function onArmedMove(e) {
    var a = anchorFromPoint(e.clientX, e.clientY);
    var hot = document.querySelectorAll('.bmk-target');
    for (var i = 0; i < hot.length; i++) {
      if (hot[i] !== a) hot[i].classList.remove('bmk-target');
    }
    if (a) a.classList.add('bmk-target');
  }

  function onArmedKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); disarm(); announce('Put back.'); }
  }

  /* Swallow the click entirely — while a bookmark is in hand a click must not
     follow a link or open a section, it must drop the bookmark. */
  function onArmedClick(e) {
    if (e.target.closest && e.target.closest('.bmk-ui')) return;
    var a = e.target.closest ? e.target.closest(ANCHOR_QUERY) : null;
    e.preventDefault();
    e.stopPropagation();
    var kind = armed.kind, colorId = armed.colorId;
    disarm();
    if (a) place(a, kind, colorId);
    else announce('Nothing to mark there — try a week, an item or a section.');
  }

  function place(el, kind, colorId) {
    buildIndex();
    var key = el.getAttribute('data-bmk-key') || keyFor(el);

    if (kind === 'progress') {
      marks = marks.filter(function (m) { return m.kind !== 'progress'; });
    }
    var mark = {
      id: uid(),
      key: key,
      kind: kind,
      color: kind === 'progress' ? null : colorId,
      text: '',
      open: true,
      ts: Date.now()
    };
    marks.push(mark);
    var ok = save(marks);
    renderAll();
    announce(ok ? 'Bookmark placed. Type your note.'
                : 'Bookmark placed, but this browser is blocking local storage.');
    var ta = document.querySelector('.bmk-card[data-bmk-id="' + mark.id + '"] textarea');
    if (ta) ta.focus();
  }

  function keyboardPlace(kind, colorId) {
    var all = [];
    var nodes = document.querySelectorAll(ANCHOR_QUERY);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.closest('.bmk-ui')) continue;
      if (!isVisible(n)) continue;                /* inside a closed section  */
      all.push(n);
    }
    if (!all.length) { announce('Nothing to bookmark here yet.'); return; }

    var idx = 0;
    highlight();
    announce('Placement mode. Arrow keys to choose a block, Enter to place, Escape to cancel.');
    document.addEventListener('keydown', onKey, true);

    function highlight() {
      all.forEach(function (n) { n.classList.remove('bmk-target'); });
      all[idx].classList.add('bmk-target');
      all[idx].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      announce(textOf(all[idx], 70));
    }
    function cleanup() {
      all.forEach(function (n) { n.classList.remove('bmk-target'); });
      document.removeEventListener('keydown', onKey, true);
    }
    function onKey(e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault(); idx = Math.min(all.length - 1, idx + 1); highlight();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault(); idx = Math.max(0, idx - 1); highlight();
      } else if (e.key === 'Enter') {
        e.preventDefault(); var t = all[idx]; cleanup(); place(t, kind, colorId);
      } else if (e.key === 'Escape') {
        e.preventDefault(); cleanup(); announce('Cancelled.');
      }
    }
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    injectCSS();
    buildDispenser();
    restoreOpen();
    renderAll();

    /* Opening or closing a <details> changes what is on screen; re-place tabs
       so nothing is left pointing at a collapsed block. */
    document.addEventListener('toggle', function (e) {
      if (e.target && e.target.tagName === 'DETAILS' && !e.target.closest('.bmk-ui')) {
        clearTimeout(boot._t);
        boot._t = setTimeout(function () { captureOpen(); renderAll(); }, 30);
      }
    }, true);

    window.addEventListener('storage', function (e) {
      if (e.key === storeKey) { marks = load(); renderAll(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
