#!/usr/bin/env python3
"""
review_student_page.py — the countable half of the reviewing-course-text structure gate.

Reports. Never rewrites. Which flags matter is a judgment call for a person.

    python3 review_student_page.py PAGE.html [PAGE2.html ...]
    python3 review_student_page.py --against cst499/what-are-my-priorities.html cst499/read-the-market.html

With --against, the reference page is measured first and every later page is reported beside it.
There is no pass mark and no fixed threshold: a gap is something to account for, not a violation
(Sathya, 2026-08-29 — a constant would be wrong for a page that has a new idea to teach).

The screens figure is a FLOOR, not a measurement: it estimates text height only and ignores figures,
tables, cards and spacing, so a real render is reliably higher (0.77 here vs 1.19 measured). Use it to
spot the order of magnitude; render the page when the number is going to be reported.

Standard library only.
"""

import re
import sys
import html as _html
from collections import Counter

VIEWPORT_H = 720
CHARS_PER_LINE = 105          # ~1180px content column at 13.5px
PX_PER_LINE = 21


def strip(tag_soup):
    """Text with script/style removed, entities resolved."""
    t = re.sub(r'<script\b.*?</script>', ' ', tag_soup, flags=re.S | re.I)
    t = re.sub(r'<style\b.*?</style>', ' ', t, flags=re.S | re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'[ \t]+', ' ', _html.unescape(t))


def words(s):
    return len([w for w in s.split() if w.strip()])


def first_action_offset(src):
    """Character offset of the first place a student can act."""
    pats = [r'<textarea\b', r'<input\b(?![^>]*type=["\']hidden)', r'<select\b',
            r'<button\b(?![^>]*class=["\'][^"\']*\bgt\b)']
    hits = [m.start() for pat in pats for m in re.finditer(pat, src, re.I)]
    return min(hits) if hits else None


def paragraphs(src):
    return [strip(m.group(1)).strip() for m in re.finditer(r'<p\b[^>]*>(.*?)</p>', src, re.S | re.I)]


def paragraphs_marked(src):
    """(text, inside_details) for each <p>. Paragraphs inside a collapsed section carry less weight."""
    spans = [(m.start(), m.end()) for m in re.finditer(r'<details\b.*?</details>', src, re.S | re.I)]
    out = []
    for m in re.finditer(r'<p\b[^>]*>(.*?)</p>', src, re.S | re.I):
        t = strip(m.group(1)).strip()
        if t:
            out.append((t, any(a <= m.start() < b for a, b in spans)))
    return out


def prose_runs(src):
    """Longest run of consecutive <p> with no heading/list/table/details/textarea between."""
    toks = re.findall(r'<(p|h1|h2|h3|h4|ul|ol|table|details|textarea|figure|div\s+class="(?:qa|outcomes|callout|reviewbox|dest)\b)',
                      src, re.I)
    run = best = 0
    for t in toks:
        if t.lower().startswith('p'):
            run += 1
            best = max(best, run)
        else:
            run = 0
    return best


def criteria_after_submit(src):
    low = src.lower()
    sub = low.find('>submit<')
    if sub < 0:
        sub = low.find('copy my summary')
    if sub < 0:
        return None
    for kw in ('what done and good look like', 'criteria for success', 'how this is graded',
               'review your work', 'what good looks like'):
        i = low.find(kw)
        if i > -1 and i > sub:
            return kw
    return False


TONE = [
    (r'\bhigh bar\b', 'gatekeeper: "high bar"'),
    (r'\bthere is a bar\b|\bmeeting it is your', 'gatekeeper: a bar to clear'),
    (r'not a verdict', 'anxiety then reassurance'),
    (r'the harder one\b', 'ranks a task as harder'),
    (r'\bembarrass', 'shame frame'),
    (r'tempted to be generous', 'implies self-deception'),
    (r'unsayable|reluctan', 'treats discomfort as evidence'),
    (r'comfortable (one|answer)', 'implies the student is avoiding'),
    (r'would (they|he|she|a recruiter|a contact|an employer)[^.?]{0,40}(trust|act|respond|be impressed|be spurred)',
     "speculates about someone else's reaction"),
    (r'\bmay (seem|sound|look) like\b|\byou might think\b|\bthis is not the soft\b',
     'invents an objection to rebut'),
    (r'wrong turns?\b', 'errors framed as wrong turns'),
    (r'\bfall behind\b|\bmiss out\b|\bstay valuable\b|\bthe ones who\b', 'scarcity or survival frame'),
]

HIDDEN = [(r'SYSTEM\s*=|systemInstructions|system:\s*["\']', 'embedded system prompt'),
          ('COACH', 'coach notes'),
          (r'STRONG:|WRONG TURNS', 'coach notes written as pass/fail')]


def report(path, ref=None):
    src = open(path, encoding='utf-8').read()
    body = src[src.find('<body'):] if '<body' in src else src
    off = first_action_offset(body)
    if off is None:
        pre_words, screens = words(strip(body)), None
    else:
        pre_words = words(strip(body[:off]))
        screens = round(((pre_words / (CHARS_PER_LINE / 6.0)) * PX_PER_LINE) / VIEWPORT_H, 2)

    print(f'\n=== {path}')
    line = f'  words before first action : {pre_words}'
    if ref is not None:
        d = pre_words - ref
        line += f'   (reference {ref}, {d:+d})'
    print(line)
    if screens is not None:
        print(f'  estimated screens to it   : ~{screens}  (estimate — render to confirm)')
    else:
        print('  no response field or action found on the page')

    ps = paragraphs_marked(body)
    longest = max((words(t) for t, _ in ps), default=0)
    over = [(t, opt) for t, opt in ps if words(t) > 65]
    main_over = [t for t, opt in over if not opt]
    print(f'  paragraphs                : {len(ps)}, longest {longest} words, {len(over)} over 65 '
          f'({len(main_over)} in the main flow, {len(over) - len(main_over)} inside collapsed sections)')
    for t, opt in over[:4]:
        where = 'collapsed' if opt else 'MAIN FLOW'
        print(f'      · {words(t)}w [{where}] — {t[:64]}...')
    print(f'  longest unbroken prose run: {prose_runs(body)} paragraphs')

    c = criteria_after_submit(body)
    print(f'  criteria before submit    : ' +
          ('no reference points found' if c is None else
           ('YES' if c is False else f'NO — "{c}" appears after the submit control')))

    flags = [(lbl, len(re.findall(pat, body, re.I))) for pat, lbl in TONE
             if re.search(pat, body, re.I)]
    print(f'  tone flags                : {len(flags)}')
    for lbl, n in flags:
        print(f'      · {lbl} ({n})')

    hid = [lbl for pat, lbl in HIDDEN if re.search(pat, src)]
    print(f'  hidden student-facing text: {", ".join(hid) if hid else "none detected"}'
          + ('   ← review these against the same rules' if hid else ''))
    return pre_words


def cross_page(paths):
    """30+ word passages repeated across sibling pages."""
    seen, dupes = {}, Counter()
    for p in paths:
        t = strip(open(p, encoding='utf-8').read())
        ws = t.split()
        for i in range(0, max(0, len(ws) - 30), 10):
            key = ' '.join(ws[i:i + 30]).lower()
            if key in seen and seen[key] != p:
                dupes[key] += 1
            seen.setdefault(key, p)
    if dupes:
        print(f'\n=== repeated across sibling pages: {len(dupes)} passage(s) of 30+ words')
        for k, _ in dupes.most_common(5):
            print(f'      · {k[:90]}...')
    elif len(paths) > 1:
        print('\n=== repeated across sibling pages: none of 30+ words')


def main(argv):
    ref_val, args = None, argv[1:]
    if args and args[0] == '--against':
        ref_val = report(args[1])
        args = args[2:]
    if not args:
        print(__doc__)
        return 1
    for p in args:
        report(p, ref_val)
    cross_page(args)
    print('\nThis script reports. Which flags matter is a judgment call — see the structure gate '
          'in reviewing-course-text/SKILL.md.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
