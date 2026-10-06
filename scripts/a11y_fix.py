#!/usr/bin/env python3
"""Accessibility pass, 2026-10-06, for cst286/ and cst349/ course pages.
Usage: a11y_fix.py <repo-root> [--dry]
Idempotent: a page that already carries the marker style block is skipped."""
import re, sys, glob, os, html

ROOT = sys.argv[1]
DRY = '--dry' in sys.argv
MARK = 'id="a11y-pass-1"'

COLORS = [  # (css variable, old hex, new hex)
    ('--teal', '0d9488', '#0F766E'),
    ('--muted', '6b7780', '#5C6873'),
    ('--check', '0b874b', '#0A7340'),
    ('--blaze', 'c2551f', '#B04A18'),
    ('--warn', '8a6d1c', '#6F5612'),
]

CSS_BASE = """
/* Accessibility pass 2026-10-06. Keep this block last in <head>. */
p a:not([class]), li a:not([class]), dd a:not([class]), td a:not([class]), .links a, .feedback-note a, .skipnote a, .crumb a, .honesty a, .derived a, .vlinks a { text-decoration: underline; text-underline-offset: 2px; }
.gl.a11y-esc > .bub { display: none !important; }
.a11y-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.starter { margin: 4px 0 6px; font-size: 13px; line-height: 1.45; font-style: italic; color: var(--muted, #5C6873); }
.copybtn { min-height: 24px; }
code { overflow-wrap: anywhere; }
@media print {
  .bub { display: block !important; position: static !important; width: auto !important; max-width: none !important; margin: 4px 0 6px 12px !important; padding: 2px 0 2px 10px !important; border: 0 !important; border-left: 2px solid #999 !important; border-radius: 0 !important; box-shadow: none !important; background: none !important; }
}
"""
CSS_MOTION = """@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
"""
CSS_TOC = "li > a[href^=\"#\"] { display: inline-block; padding: 4px 0; }\n"
CSS_SIXQ = ".watchlbl input[type=checkbox], .qcard input[type=checkbox] { width: 16px; height: 16px; }\na.yt { display: inline-block; padding: 4px 0; }\n"
CSS_REGISTRY = ".tally { white-space: normal; }\n.st { white-space: normal; }\n.page { overflow-x: auto; }\n"

JS_ESC = """
  // Escape closes an open glossary bubble (hover or focus); it comes back on the next hover or focus.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.gl:hover, .gl:focus-within').forEach(function (g) {
      g.classList.add('a11y-esc');
      function clear() { g.classList.remove('a11y-esc'); g.removeEventListener('mouseleave', clear); g.removeEventListener('focusout', clear); }
      g.addEventListener('mouseleave', clear); g.addEventListener('focusout', clear);
    });
  });"""
JS_LIVE = """
  // A button that changes its own label after a click (Copy -> Copied) is announced to screen readers.
  var live = document.createElement('div');
  live.className = 'a11y-live'; live.setAttribute('role', 'status');
  (document.querySelector('[role="main"], main') || document.body).appendChild(live);
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    var before = b.textContent;
    setTimeout(function () { if (b.textContent !== before) { live.textContent = ''; live.textContent = b.textContent; } }, 400);
  }, true);"""


def bump_fonts(css, floor=12):
    def px(m):
        return m.group(1) + '%dpx' % floor if float(m.group(2)) < floor else m.group(0)
    def rem(m):
        return m.group(1) + '.75rem' if float(m.group(2)) < .75 else m.group(0)
    css = re.sub(r'(font-size:\s*)(\d*\.?\d+)px', px, css)
    css = re.sub(r'(font-size:\s*)(\d*\.?\d+)rem', rem, css)
    return css


def fix(path):
    s = open(path, encoding='utf-8').read()
    if MARK in s:
        return None
    o = s
    name = os.path.basename(path)
    notes = []

    # 1 colours
    for var, old, new in COLORS:
        s, n = re.subn(r'(%s\s*:\s*)#%s\b' % (re.escape(var), old), r'\g<1>' + new, s, flags=re.I)
        if n: notes.append('%s x%d' % (var, n))
    s = re.sub(r'(\bcolor\s*:\s*)#6b7780\b', r'\g<1>#5C6873', s, flags=re.I)
    s = re.sub(r'(\bcolor\s*:\s*)#0b874b\b', r'\g<1>#0A7340', s, flags=re.I)

    # 5 small text: floor of 12px inside style blocks and style attributes
    FL = 11 if name == 'assignments.html' else 12
    s2 = re.sub(r'(<style[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + bump_fonts(m.group(2), FL) + m.group(3), s, flags=re.S)
    s2 = re.sub(r'(style=")([^"]*)(")', lambda m: m.group(1) + bump_fonts(m.group(2), FL) + m.group(3), s2)
    if s2 != s: notes.append('font floor')
    s = s2

    # 3 main landmark
    if '<main' not in s and 'role="main"' not in s:
        b = s.find('<body')
        m = re.compile(r'<div class="(page|wrap)"').search(s, b)
        if m:
            s = s[:m.end()] + ' role="main"' + s[m.end():]
            notes.append('main')
        else:
            notes.append('!! no main container')

    # 3 a footer inside the main region is not a page-level landmark
    fm = re.search(r'<footer class="page-footer"(?![^>]*role=)', s)
    if fm and 'role="main"' in s:
        tail = re.sub(r'<script.*?</script>|<template.*?</template>|<!--.*?-->', '', s[fm.end():], flags=re.S)
        tail = tail[tail.find('</footer>'):]
        if '</div>' in tail:
            s = s[:fm.end()] + ' role="none"' + s[fm.end():]
            notes.append('footer')

    # 3 heading levels: h4 used directly under h2
    if '<h4' in s and '<h3' not in s:
        s, n = re.subn(r'<h4(?![^>]*aria-level)', '<h4 aria-level="3"', s)
        notes.append('h4 level x%d' % n)

    # 3 decorative icons on the home pages
    if name == 'home.html':
        def svg(m):
            t = m.group(0)
            if 'aria-' in t or 'role=' in t: return t
            return t[:-1] + ' aria-hidden="true" focusable="false">'
        s, n = re.subn(r'<svg\b[^>]*>', svg, s)
        notes.append('svg checked x%d' % n)

    # 3 tables
    for cls, label in [('grid', 'Market findings and my evidence'), ('snap', 'Market snapshot')]:
        s = s.replace('<table class="%s">' % cls, '<table class="%s" aria-label="%s">' % (cls, label))
    if name == 'assignments.html':
        labels = iter(['Due-date convention', 'Build status key'])
        s = re.sub(r'<table>', lambda m: '<table aria-label="%s">' % next(labels, 'Table'), s)

    # 4 glossary bubbles: tie each bubble to its trigger
    cnt = [0]
    def gl(m):
        cnt[0] += 1
        battrs, inner, gap, bub_attrs = m.group(1), m.group(2), m.group(3), m.group(4)
        idm = re.search(r'\bid="([^"]+)"', bub_attrs)
        bid = idm.group(1) if idm else 'gl-bub-%d' % cnt[0]
        if not idm: bub_attrs += ' id="%s"' % bid
        if 'aria-describedby' not in battrs: battrs += ' aria-describedby="%s"' % bid
        return '<button type="button" class="gt"%s>%s</button>%s<span class="bub"%s>' % (battrs, inner, gap, bub_attrs)
    s = re.sub(r'<button type="button" class="gt"([^>]*)>((?:(?!</button>).)*)</button>(\s*)<span class="bub"([^>]*)>', gl, s, flags=re.S)
    has_gl = cnt[0] > 0
    if has_gl: notes.append('bubbles x%d' % cnt[0])

    # 6 copy status line announces itself
    s, n = re.subn(r'(<\w+\b(?![^>]*role=)(?![^>]*aria-live)[^>]*\bid="copy-status")', r'\1 role="status" aria-live="polite"', s)
    if n: notes.append('copy-status')
    needs_live = bool(re.search(r"(tasksBtn|btn)\.textContent\s*=\s*(ok \? )?'Copied", s)) and 'live.textContent' not in s

    # 6 answer scaffolds move from the placeholder to a line above the box
    if name != 'six-questions-people-who-hire.html':
        k = [0]
        def ta(m):
            tag = m.group(0)
            pm = re.search(r'\splaceholder="([^"]*)"', tag)
            if not pm or len(html.unescape(pm.group(1))) < 40 or 'aria-describedby' in tag: return tag
            k[0] += 1
            idm = re.search(r'\bid="([^"]+)"', tag)
            hid = (idm.group(1) if idm else 'a11y-box-%d' % k[0]) + '-starter'
            tag = tag.replace(pm.group(0), '').rstrip('>').rstrip() + ' aria-describedby="%s">' % hid
            return '<p class="starter" id="%s">%s</p>\n%s' % (hid, pm.group(1), tag)
        s = re.sub(r'<textarea\b[^>]*>', ta, s)
        if k[0]: notes.append('starters x%d' % k[0])

    # captions on by default for YouTube embeds
    s2 = s.replace("?autoplay=1&rel=0&enablejsapi=1'", "?autoplay=1&rel=0&enablejsapi=1&cc_load_policy=1'")
    s2 = re.sub(r'(youtube(?:-nocookie)?\.com/embed/[\w-]+\?(?:(?!cc_load_policy)[^"\'])*?)(["\'])', lambda m: m.group(1) + ('&amp;' if '&amp;' in m.group(1) or '&' not in m.group(1) else '&') + 'cc_load_policy=1' + m.group(2) if 'cc_load_policy' not in m.group(1) else m.group(0), s2)
    if s2 != s: notes.append('captions')
    s = s2

    # inject style and script
    css = CSS_BASE
    if 'prefers-reduced-motion' not in o: css += CSS_MOTION
    if name == 'understand-the-course-design.html': css += CSS_TOC
    if name == 'six-questions-people-who-hire.html': css += CSS_SIXQ
    if name == 'assignments.html': css += CSS_REGISTRY
    if s.count('</head>') != 1 or s.count('</body>') != 1:
        return ['!! head/body count', s.count('</head>'), s.count('</body>')]
    s = s.replace('</head>', '<style %s>%s</style>\n</head>' % (MARK, css))
    js = (JS_ESC if has_gl else '') + (JS_LIVE if needs_live else '')
    if js:
        s = s.replace('</body>', '<script id="a11y-pass-1-js">\n(function () {%s\n})();\n</script>\n</body>' % js)
        notes.append('js:' + ('esc ' if has_gl else '') + ('live' if needs_live else ''))
    if not DRY:
        open(path, 'w', encoding='utf-8').write(s)
    return notes


bj = os.path.join(ROOT, 'js', 'bookmarks.js')
if os.path.exists(bj):
    t = open(bj, encoding='utf-8').read(); t2 = bump_fonts(t)
    if t2 != t:
        if not DRY: open(bj, 'w', encoding='utf-8').write(t2)
        print('js/bookmarks.js'.ljust(58), 'font floor')
files = sorted(glob.glob(os.path.join(ROOT, 'cst286', '*.html')) + glob.glob(os.path.join(ROOT, 'cst349', '*.html')) + [os.path.join(ROOT, 'cst286', 'glowscript', 'sim.html')])
for f in files:
    r = fix(f)
    print(os.path.relpath(f, ROOT).ljust(58), 'skipped (already done)' if r is None else ', '.join(map(str, r)))
