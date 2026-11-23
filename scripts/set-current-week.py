#!/usr/bin/env python3
"""Mark the current week and sprint on each course home page (table layout, Oct 2026 redesign).

Reads cst286/home.html, cst349/home.html and cst499/home.html and, for the target week:

1. "When we meet" table: every row of that week (the <tr class="wk"> row whose
   <th>Week N<span>Mon D</span> heading is the latest Monday on or before the target Monday,
   plus the rows under it up to the next week row) gets the class "cur"; every other row loses it.
   If the table has no row for the target week (it starts later, or the term is over), no row is marked.
   A small CSS block (marked /* current-week */) is added once before </style> so the week
   is highlighted and labelled "this week".
2. Sprints: each <details class="sprint ..."> is set from its "Mon D – Mon D" range:
   ended before the target week -> "past"; the latest sprint that has started by the end of the
   target week -> "current" + open; not started yet -> plain "sprint". If every sprint has
   ended, the last one stays current.

Target Monday = the Monday of the week that contains (now + 1 day), in America/Los_Angeles —
so a Sunday-night run marks the week that starts the next morning.

Usage: set-current-week.py [--dry-run] [--date YYYY-MM-DD]
"""
import re, sys, os, datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES = ["cst286", "cst349", "cst499"]
MONTHS = {m: i for i, m in enumerate(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], 1)}
CSS_MARK = "/* current-week */"
CSS = (CSS_MARK + "\n.sched tr.cur th,.sched tr.cur:not(.evt) td{background:#F6F7F8}"
       "\n.sched tr.wk.cur th{box-shadow:inset 3px 0 0 var(--blue)}"
       "\n.sched tr.wk.cur th::after{content:\"this week\";display:block;margin-top:2px;font-size:11px;"
       "font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--blue)}\n")

def target_monday(args):
    if "--date" in args:
        d = datetime.date.fromisoformat(args[args.index("--date") + 1]) + datetime.timedelta(days=1)
    else:
        d = (datetime.datetime.now(ZoneInfo("America/Los_Angeles")) + datetime.timedelta(days=1)).date()
    return d - datetime.timedelta(days=d.weekday())

def mkdate(mon, day, year):
    m = MONTHS[mon]
    return datetime.date(year if m >= 8 else year + 1, m, int(day))

def set_classes(tag, add, remove):
    """Rewrite the class="..." attribute inside one start tag; add a class attribute if missing."""
    m = re.search(r'class="([^"]*)"', tag)
    cls = m.group(1).split() if m else []
    cls = [c for c in cls if c not in remove]
    for c in add:
        if c not in cls:
            cls.append(c)
    val = " ".join(cls)
    if m:
        return tag[:m.start()] + (f'class="{val}"' if val else "") + tag[m.end():] if val else re.sub(r'\s*class="[^"]*"', "", tag)
    return tag if not val else tag[:3] + f' class="{val}"' + tag[3:]

def mark_week(html, tm, year):
    tb = re.search(r'(<table class="sched">.*?<tbody>)(.*?)(</tbody>)', html, re.S)
    if not tb:
        return html, "schedule table not found"
    body = tb.group(2)
    rows = list(re.finditer(r'<tr\b[^>]*>', body))
    weeks = []  # (row index, week no, monday)
    for i, r in enumerate(rows):
        if re.search(r'class="[^"]*\bwk\b', r.group(0)):
            hm = re.match(r'\s*<th scope="row"[^>]*>Week (\d+)<span>([A-Z][a-z]{2}) (\d{1,2})</span>', body[r.end():])
            if not hm:
                return html, f"week row {i} heading not parsed"
            weeks.append((i, int(hm.group(1)), mkdate(hm.group(2), hm.group(3), year)))
    if not weeks:
        return html, "no week rows found"
    on_or_before = [w for w in weeks if w[2] <= tm]
    last = max(w[2] for w in weeks)
    if on_or_before and tm <= last:
        wi, n, d = max(on_or_before, key=lambda w: w[2])
        nxt = [w[0] for w in weeks if w[0] > wi]
        end = nxt[0] if nxt else len(rows)
        label = f"Week {n} ({d})"
    else:  # table starts later or term is over: highlight nothing
        wi = end = -1
        label = "Week none (no table row for this week)"
    out, pos = [], 0
    for i, r in enumerate(rows):
        out.append(body[pos:r.start()])
        tag = r.group(0)
        out.append(set_classes(tag, ["cur"], []) if wi <= i < end else set_classes(tag, [], ["cur"]))
        pos = r.end()
    out.append(body[pos:])
    html = html[:tb.start(2)] + "".join(out) + html[tb.end(2):]
    return html, label

def mark_sprints(html, tm, year):
    wk_end = tm + datetime.timedelta(days=6)
    sps = list(re.finditer(r'<details class="sprint\b[^"]*"[^>]*>', html))
    if not sps:
        return html, "no sprints found"
    info = []
    for s in sps:
        wm = re.search(r'<div class="when"><b>([A-Z][a-z]{2}) (\d{1,2})(?:\s*(?:&ndash;|–|-)\s*([A-Z][a-z]{2}) (\d{1,2}))?</b>', html[s.end(): s.end() + 600])
        if not wm:
            return html, f"sprint date not parsed near offset {s.start()}"
        start = mkdate(wm.group(1), wm.group(2), year)
        end = mkdate(wm.group(3), wm.group(4), year) if wm.group(3) else start + datetime.timedelta(days=6)
        info.append((s, start, end))
    started = [k for k, (_, st, _) in enumerate(info) if st <= wk_end]
    cur = started[-1] if started else None
    out, pos, labels = [], 0, []
    for k, (s, st, en) in enumerate(info):
        if k == cur:
            state = "current"
        elif st > wk_end:
            state = "future"
        else:
            state = "past"
        tag = set_classes(s.group(0), [] if state == "future" else [state], ["past", "current"])
        tag = re.sub(r'\s+open\b(?==|\s|>)', "", tag)
        if state == "current":
            tag = tag[:-1] + " open>"
        out.append(html[pos:s.start()]); out.append(tag); pos = s.end()
        labels.append(state[0].upper())
    out.append(html[pos:])
    return "".join(out), f"sprint {cur} current ({''.join(labels)})"

def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args
    tm = target_monday(args)
    year = tm.year if tm.month >= 8 else tm.year - 1
    failed = False
    for c in COURSES:
        p = os.path.join(ROOT, c, "home.html")
        html = open(p, encoding="utf-8").read()
        new, wmsg = mark_week(html, tm, year)
        if new is html and not wmsg.startswith("Week"):
            print(f"{c}: FAILED {wmsg}; unchanged"); failed = True; continue
        new, smsg = mark_sprints(new, tm, year)
        if not smsg.startswith("sprint"):
            print(f"{c}: FAILED {smsg}; unchanged"); failed = True; continue
        if CSS_MARK not in new:
            if new.count("</style>") != 1:
                print(f"{c}: FAILED expected one </style>; unchanged"); failed = True; continue
            new = new.replace("</style>", CSS + "</style>")
        changed = new != html
        print(f"{c}: target Monday {tm} -> {wmsg}, {smsg}{'' if changed else ' [already set]'}{' [dry run]' if dry else ''}")
        if changed and not dry:
            open(p, "w", encoding="utf-8").write(new)
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
