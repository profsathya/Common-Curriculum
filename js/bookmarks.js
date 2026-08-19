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
     I think about this". */
  var PROGRESS = { ink: '#fff', bg: '#C2262E', line: '#8E1219' };

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

    /* The row itself. A link href is the most durable identity we have; the
       item's own title is the fallback. */
    if (el.matches('.wrow, .item')) {
      var a = el.querySelector('a[href]');
      if (a) {
        parts.push('link:' + a.getAttribute('href').split('/').pop().split('?')[0]);
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
    '.bmk-dispenser{position:fixed;top:14px;right:14px;z-index:900;width:172px;',
    'font-family:inherit;font-size:12px;color:#2D3B45;background:#fff;',
    'border:1px solid #C7CDD1;border-radius:8px;box-shadow:0 4px 14px rgba(45,59,69,.13);}',
    '.bmk-dispenser .bmk-title{display:flex;align-items:center;gap:6px;padding:8px 10px 6px;',
    'font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#6B7780;}',
    '.bmk-dispenser .bmk-title span{flex:1;}',
    '.bmk-collapse{border:0;background:none;color:#6B7780;cursor:pointer;font-size:14px;',
    'line-height:1;padding:2px 4px;border-radius:3px;}',
    '.bmk-collapse:hover{background:#F0F2F4;color:#2D3B45;}',
    '.bmk-body{padding:0 10px 10px;}',
    '.bmk-dispenser.is-min .bmk-body{display:none;}',
    '.bmk-dispenser.is-min{width:auto;}',
    '.bmk-swatches{display:flex;gap:5px;margin-bottom:8px;}',
    '.bmk-sw{width:20px;height:20px;border-radius:4px;border:1px solid rgba(0,0,0,.18);',
    'cursor:pointer;padding:0;}',
    '.bmk-sw[aria-pressed="true"]{outline:2px solid #2D3B45;outline-offset:1px;}',
    '.bmk-handle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;',
    'padding:9px 8px;border-radius:5px;border:1px solid rgba(0,0,0,.18);cursor:grab;',
    'font:inherit;font-size:11.5px;font-weight:700;touch-action:none;user-select:none;}',
    '.bmk-handle:active{cursor:grabbing;}',
    '.bmk-handle:focus-visible{outline:2px solid #0374B5;outline-offset:2px;}',
    '.bmk-progress-handle{margin-top:6px;}',
    '.bmk-hint{margin-top:7px;font-size:10.5px;line-height:1.35;color:#6B7780;}',
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
    var old = document.querySelectorAll('.bmk-tab, .bmk-card');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }

  function renderAll() {
    clearRendered();
    buildIndex();
    var orphans = 0;

    marks.forEach(function (mark) {
      var host = elementForKey(mark.key);
      if (!host) { orphans++; return; }
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

      var c = colorOf(mark);

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'bmk-tab';
      tab.dataset.bmkId = mark.id;
      tab.style.background = c.bg;
      tab.style.borderColor = c.line;
      tab.style.color = c.ink;
      tab.setAttribute('aria-expanded', mark.open ? 'true' : 'false');
      tab.setAttribute('aria-label',
        (mark.kind === 'progress' ? 'Progress marker: ' : 'Bookmark: ') + tabLabel(mark));
      tab.innerHTML = '<span class="lbl"></span>';
      tab.querySelector('.lbl').textContent = tabLabel(mark);
      host.appendChild(tab);

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

    updateDispenser(orphans);
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
        saved.textContent = ok ? 'Saved on this computer' : 'Not saved — storage is blocked here';
        var tab = document.querySelector('.bmk-tab[data-bmk-id="' + mark.id + '"] .lbl');
        if (tab) tab.textContent = tabLabel(mark);
      }, 400);
    });

    return card;
  }

  /* ------------------------------------------------------------- dispenser */

  var dispenser, listEl, listOpen = false, selectedColor = COLORS[0].id;

  function buildDispenser() {
    dispenser = document.createElement('div');
    dispenser.className = 'bmk-ui bmk-dispenser';
    dispenser.innerHTML =
      '<div class="bmk-title"><span>Bookmarks</span>' +
      '<button type="button" class="bmk-collapse" aria-label="Hide bookmark tools">–</button></div>' +
      '<div class="bmk-body">' +
        '<div class="bmk-swatches" role="group" aria-label="Bookmark colour"></div>' +
        '<button type="button" class="bmk-handle bmk-note-handle">Drag onto the page</button>' +
        '<button type="button" class="bmk-handle bmk-progress-handle">I&rsquo;m here</button>' +
        '<div class="bmk-hint">Drag a bookmark onto any block, or press Enter on it and use the arrow keys.</div>' +
        '<button type="button" class="bmk-list-toggle"></button>' +
        '<div class="bmk-list" hidden></div>' +
      '</div>' +
      '<div id="bmk-live" class="bmk-sr" aria-live="polite"></div>';
    document.body.appendChild(dispenser);

    var sw = dispenser.querySelector('.bmk-swatches');
    COLORS.forEach(function (col) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bmk-sw';
      b.style.background = col.bg;
      b.setAttribute('aria-label', col.label + ' bookmark');
      b.setAttribute('aria-pressed', col.id === selectedColor ? 'true' : 'false');
      b.addEventListener('click', function () {
        selectedColor = col.id;
        paintHandles();
      });
      sw.appendChild(b);
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

    makeDraggable(dispenser.querySelector('.bmk-note-handle'), 'note');
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
    if (userToggled) return;
    var page = document.querySelector('.page');
    var colW = page ? page.getBoundingClientRect().width : 1040;
    setMin(window.innerWidth - colW < 400);
  }

  function paintHandles() {
    var c = colorOf({ kind: 'note', color: selectedColor });
    var h = dispenser.querySelector('.bmk-note-handle');
    h.style.background = c.bg; h.style.borderColor = c.line; h.style.color = c.ink;
    var p = dispenser.querySelector('.bmk-progress-handle');
    p.style.background = PROGRESS.bg; p.style.borderColor = PROGRESS.line; p.style.color = PROGRESS.ink;
    var sws = dispenser.querySelectorAll('.bmk-sw');
    for (var i = 0; i < sws.length; i++) {
      sws[i].setAttribute('aria-pressed', COLORS[i].id === selectedColor ? 'true' : 'false');
    }
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
        ? whereLabel(mark.key)
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

  function whereLabel(key) {
    return key.split('|').map(function (p) {
      return p.replace(/^link:/, '').replace(/^t:/, '').replace(/^day:/, '')
              .replace(/\.html$/, '').replace(/-/g, ' ');
    }).join(' · ').slice(0, 60);
  }

  /* --------------------------------------------------------- drag to place */

  function anchorFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el.closest('.bmk-ui') || el.closest('.bmk-card')) return null;
    var a = el.closest(ANCHOR_QUERY);
    return a || null;
  }

  function makeDraggable(handle, kind) {
    var ghost = null, target = null, dragging = false;

    handle.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      var c = kind === 'progress' ? PROGRESS : colorOf({ color: selectedColor });
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
      if (target) {
        target.classList.remove('bmk-target');
        place(target, kind);
        target = null;
      }
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
        keyboardPlace(kind);
      }
    });

    function move(e) {
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

  function place(el, kind) {
    buildIndex();
    var key = el.getAttribute('data-bmk-key') || keyFor(el);

    if (kind === 'progress') {
      marks = marks.filter(function (m) { return m.kind !== 'progress'; });
    }
    var mark = {
      id: uid(),
      key: key,
      kind: kind,
      color: kind === 'progress' ? null : selectedColor,
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

  function keyboardPlace(kind) {
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
        e.preventDefault(); var t = all[idx]; cleanup(); place(t, kind);
      } else if (e.key === 'Escape') {
        e.preventDefault(); cleanup(); announce('Cancelled.');
      }
    }
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    injectCSS();
    buildDispenser();
    renderAll();

    /* Opening or closing a <details> changes what is on screen; re-place tabs
       so nothing is left pointing at a collapsed block. */
    document.addEventListener('toggle', function (e) {
      if (e.target && e.target.tagName === 'DETAILS' && !e.target.closest('.bmk-ui')) {
        clearTimeout(boot._t);
        boot._t = setTimeout(renderAll, 30);
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
