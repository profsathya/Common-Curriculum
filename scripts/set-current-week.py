#!/usr/bin/env python3
"""Point the "Current week" button on each course home page at the right week.

Reads cst286/home.html, cst349/home.html and cst499/home.html, finds every
<details class="wk" id="wk-N"> with its heading date ("Week N — … · Sep 7") and the
<details ... id="sprint-M"> it sits inside, picks the latest week whose Monday is on or
before the target Monday, and rewrites the three values on the pointer:
  href="#wk-N"  data-sprint="sprint-M"  data-week="wk-N"  and the label "Current week: Week N".

Target Monday = the Monday of the week that contains (now + 1 day), in America/Los_Angeles —
so a Sunday-night run points at the week that starts the next morning.

Usage: set-current-week.py [--dry-run] [--date YYYY-MM-DD]
"""
import re, sys, os, datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES = ["cst286", "cst349", "cst499"]
MONTHS = {m: i for i, m in enumerate(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], 1)}

def target_monday(args):
    if "--date" in args:
        d = datetime.date.fromisoformat(args[args.index("--date") + 1]) + datetime.timedelta(days=1)
    else:
        d = (datetime.datetime.now(ZoneInfo("America/Los_Angeles")) + datetime.timedelta(days=1)).date()
    return d - datetime.timedelta(days=d.weekday())

def weeks_in(html, year):
    """[(week_no, monday_date, sprint_id)] from the page structure."""
    out = []
    for m in re.finditer(r'<details class="wk" id="wk-(\d+)">', html):
        n = int(m.group(1))
        head = html[m.end(): m.end() + 1500]
        dm = re.search(r'<span class="gd">&middot; ([A-Z][a-z]{2}) (\d{1,2})', head)
        if not dm:
            continue
        mon, day = MONTHS[dm.group(1)], int(dm.group(2))
        y = year if mon >= 8 else year + 1
        # nearest enclosing sprint: last id="sprint-M" before this week
        sp = re.findall(r'id="(sprint-\d+)"', html[: m.start()])
        out.append((n, datetime.date(y, mon, day), sp[-1] if sp else None))
    return out

def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args
    tm = target_monday(args)
    year = tm.year if tm.month >= 8 else tm.year - 1
    for c in COURSES:
        p = os.path.join(ROOT, c, "home.html")
        html = open(p, encoding="utf-8").read()
        wks = [w for w in weeks_in(html, year) if w[1] <= tm]
        if not wks:
            print(f"{c}: no week on or before {tm}; unchanged"); continue
        n, d, sp = max(wks, key=lambda w: w[1])
        pat = re.compile(r'(<div class="curweek">\s*<a href=")#wk-\d+(" data-sprint=")sprint-\d+(" data-week=")wk-\d+("[^>]*>(?:<span class="cw-dot"[^>]*></span>)?Current week: Week )\d+')
        if not pat.search(html):
            print(f"{c}: pointer markup not found; unchanged"); continue
        new = pat.sub(lambda mm: f'{mm.group(1)}#wk-{n}{mm.group(2)}{sp}{mm.group(3)}wk-{n}{mm.group(4)}{n}', html, count=1)
        changed = new != html
        print(f"{c}: target Monday {tm} -> Week {n} ({d}, {sp}){'' if changed else ' [already set]'}{' [dry run]' if dry else ''}")
        if changed and not dry:
            open(p, "w", encoding="utf-8").write(new)

if __name__ == "__main__":
    main()
