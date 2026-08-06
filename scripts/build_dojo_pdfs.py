#!/usr/bin/env python3
"""Render the Dojo library's .txt files as the PDFs students download.

The .txt is the source of truth. Run this after editing any dojo-*.txt so the
PDF on the library page never falls behind the text version:

    python3 scripts/build_dojo_pdfs.py            # rebuild all of them
    python3 scripts/build_dojo_pdfs.py dojo-core  # just one

Layout follows the original hand-made PDFs: Helvetica throughout, a blue title,
a version subtitle, blue section heads from the '== ... ==' markers, bullets
from '- ' lines, and an amber callout box around the Dojo Core's one rule.
Two things come out bold, as they did before — the numbered round titles, and
the lead-in term of a definition list ('Framer -- frames my target...').

A new module needs no code change here: drop dojo-<name>.txt into the folder
and its title and subtitle are derived from its first line.
"""
import os
import re
import sys

try:
    from reportlab.lib.colors import Color
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas as pdfcanvas
except ImportError:  # pragma: no cover
    sys.exit("reportlab is required: pip install reportlab")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOJO_DIR = os.path.join(REPO_ROOT, "common", "dojo")

PAGE_W, PAGE_H = letter
MARGIN = 64.0
CONTENT_W = PAGE_W - (2 * MARGIN)
TOP = 50.0
BOTTOM = 710.0                       # last line top before we owe a page break

TITLE_SIZE, SUBTITLE_SIZE = 22.0, 11.5
HEAD_SIZE, BODY_SIZE, CALLOUT_SIZE, FOOTER_SIZE = 13.0, 10.3, 10.8, 8.5
BODY_LEAD, CALLOUT_LEAD = 13.7, 15.0
PARA_GAP, HEAD_GAP = 3.5, 7.0

REG, BOLD = "Helvetica", "Helvetica-Bold"

BLUE = Color(0.011765, 0.454902, 0.709804)       # title
HEAD_BLUE = Color(0.039216, 0.352941, 0.541176)  # section heads
INK = Color(0.176471, 0.231373, 0.270588)        # body
MUTED = Color(0.419608, 0.466667, 0.501961)      # subtitle, footer
CALLOUT_INK = Color(0.368627, 0.290196, 0.094118)
CALLOUT_BG = Color(0.984314, 0.964706, 0.925490)
CALLOUT_BORDER = Color(0.917647, 0.858824, 0.745098)
CALLOUT_ACCENT = Color(0.780392, 0.603922, 0.180392)
RULE = Color(0.909804, 0.917647, 0.925490)

FOOTER = "Computing Talent Initiative  •  Symbiotic Thinking Dojo"

# A bullet in a definition list: a short term, then ' -- ', then its meaning.
LEAD_IN = re.compile(r"^([A-Z][A-Za-z]+(?: [A-Za-z]+){0,2}) -- (.*)$", re.S)
# A numbered round: '4. Experience, bullet by bullet (Challenger + Writer). ...'
NUMBERED = re.compile(r"^(\d+\.)\s+(.*)$", re.S)
# How many same-shaped bullets in a row before we treat them as a definition list.
DEF_LIST_MIN = 3

# Titles that differ from what the first line alone would give us.
KNOWN = {
    "dojo-core": (
        "The Dojo — Core Method",
        "How a Symbiotic Thinking Dojo works · {version} · pair with any module",
    ),
    "dojo-resume": (
        "Resume Dojo",
        "A module for the Dojo · {version} · use together with the Dojo Core",
    ),
    "dojo-search-strategy": (
        "The Dojo — Search Strategy",
        "Turn your search into a fair experiment · {version} · pair with the Dojo Core",
    ),
    "dojo-referral-case": (
        "The Dojo — Warm Referral Case",
        "Make a case worth a referral · {version} · pair with the Dojo Core",
    ),
}


# ------------------------------------------------------------------ layout

def wrap_runs(canvas, runs, size, first_width, cont_width):
    """Wrap a list of (text, font) runs into lines of (text, font) pieces."""
    tokens = [(w, font) for text, font in runs for w in text.split(" ") if w]
    lines, line, width, limit = [], [], 0.0, first_width
    for word, font in tokens:
        piece = canvas.stringWidth(word, font, size)
        space = canvas.stringWidth(" ", font, size) if line else 0
        if line and width + space + piece > limit:
            lines.append(line)
            line, width, limit = [], 0.0, cont_width
            space = 0
        if space:
            line.append((" ", font))
            width += space
        line.append((word, font))
        width += piece
    if line:
        lines.append(line)
    return lines or [[("", REG)]]


def merge(line):
    """Join neighbouring pieces that share a font, so we draw fewer strings."""
    out = []
    for text, font in line:
        if out and out[-1][1] == font:
            out[-1][0] += text
        else:
            out.append([text, font])
    return out


# ------------------------------------------------------------------- parse

def parse(path):
    """First non-blank line is the header; the rest becomes typed blocks."""
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()

    header, blocks = "", []
    for line in raw.split("\n"):
        stripped = line.strip()
        if not header:
            if stripped:
                header = stripped
            continue
        if not stripped:
            continue
        section = re.match(r"^==\s*(.+?)\s*==$", stripped)
        if section:
            blocks.append(["head", section.group(1)])
        elif stripped.startswith("- "):
            blocks.append(["bullet", stripped[2:]])
        elif stripped.upper().startswith("THE ONE RULE:"):
            blocks.append(["callout", "The one rule:" + stripped[len("THE ONE RULE:"):]])
        else:
            blocks.append(["body", stripped])

    mark_definition_lists(blocks)
    return header, blocks


def mark_definition_lists(blocks):
    """Bold a bullet's lead-in only inside a run of same-shaped bullets.

    'Framer -- frames my target' sits in a list of six like it, so the term is
    a definition and reads bold. 'Truth only -- you surface real evidence' is
    one instruction among differently-shaped ones, so it stays plain.
    """
    start = 0
    while start < len(blocks):
        if blocks[start][0] != "bullet" or not LEAD_IN.match(blocks[start][1]):
            start += 1
            continue
        end = start
        while (end < len(blocks) and blocks[end][0] == "bullet"
               and LEAD_IN.match(blocks[end][1])):
            end += 1
        if end - start >= DEF_LIST_MIN:
            for i in range(start, end):
                blocks[i][0] = "defbullet"
        start = max(end, start + 1)


def titles_for(stem, header):
    version_match = re.search(r"v\d+(?:\.\d+)*", header)
    version = version_match.group(0) if version_match else ""
    if stem in KNOWN:
        title, subtitle = KNOWN[stem]
    else:
        # e.g. "INTERVIEW DOJO - module (v1.0.0, ...)" -> "Interview Dojo"
        name = header.split(" - ")[0].split("(")[0].strip()
        title = " ".join(w.capitalize() for w in name.split())
        subtitle = "A module for the Dojo · {version} · use together with the Dojo Core"
    return title, subtitle.format(version=version)


# ------------------------------------------------------------------ render

class Renderer:
    def __init__(self, canvas):
        self.c = canvas
        self.y = TOP
        self.pages = 1

    def _footer(self):
        self.c.setStrokeColor(RULE)
        self.c.setLineWidth(0.6)
        self.c.line(MARGIN - 0.4, PAGE_H - 722.4, PAGE_W - MARGIN + 0.4, PAGE_H - 722.4)
        self.c.setFont(REG, FOOTER_SIZE)
        self.c.setFillColor(MUTED)
        self.c.drawString(MARGIN, PAGE_H - 738, FOOTER)

    def _break(self, needed):
        if self.y + needed > BOTTOM:
            self._footer()
            self.c.showPage()
            self.pages += 1
            self.y = TOP

    def draw(self, lines, size, lead, color, first_x, cont_x=None):
        cont_x = first_x if cont_x is None else cont_x
        for i, line in enumerate(lines):
            self._break(lead)
            x = first_x if i == 0 else cont_x
            self.c.setFillColor(color)
            for text, font in merge(line):
                self.c.setFont(font, size)
                self.c.drawString(x, PAGE_H - self.y - size, text)
                x += self.c.stringWidth(text, font, size)
            self.y += lead

    def header(self, title, subtitle):
        self.draw([[(title, BOLD)]], TITLE_SIZE, 25, BLUE, MARGIN)
        self.draw([[(subtitle, REG)]], SUBTITLE_SIZE, 26, MUTED, MARGIN)

    def callout(self, text):
        left, right = MARGIN + 8, PAGE_W - MARGIN - 8
        lines = wrap_runs(self.c, [(text, REG)], CALLOUT_SIZE,
                          right - left - 24, right - left - 24)
        height = len(lines) * CALLOUT_LEAD + 22
        self._break(height)
        top = PAGE_H - self.y
        self.c.setFillColor(CALLOUT_BG)
        self.c.setStrokeColor(CALLOUT_BORDER)
        self.c.setLineWidth(1)
        self.c.rect(left, top - height, right - left, height, stroke=1, fill=1)
        self.c.setStrokeColor(CALLOUT_ACCENT)
        self.c.setLineWidth(3)
        self.c.line(left, top - height, left, top)
        self.y += 12
        self.draw(lines, CALLOUT_SIZE, CALLOUT_LEAD, CALLOUT_INK, left + 12)
        self.y += 10

    def head(self, text):
        self._break(HEAD_SIZE + 30)
        self.y += HEAD_GAP
        self.draw([[(text, BOLD)]], HEAD_SIZE, HEAD_SIZE + 5, HEAD_BLUE, MARGIN)

    def body(self, text):
        runs = [(text, REG)]
        numbered = NUMBERED.match(text)
        if numbered:
            number, rest = numbered.groups()
            head, sep, tail = rest.partition(". ")
            # A round title that contains ' -- ' is a sentence, not a label.
            if sep and " -- " not in head:
                runs = [(number + " ", BOLD), (head + ".", BOLD), (" " + tail, REG)]
            else:
                runs = [(number + " ", BOLD), (rest, REG)]
        self.draw(wrap_runs(self.c, runs, BODY_SIZE, CONTENT_W, CONTENT_W),
                  BODY_SIZE, BODY_LEAD, INK, MARGIN)
        self.y += PARA_GAP

    def _bullet(self, text, bold_lead):
        glyph_x, first_x, cont_x = MARGIN + 15, MARGIN + 26, MARGIN + 15
        runs = [(text, REG)]
        if bold_lead:
            match = LEAD_IN.match(text)
            runs = [(match.group(1), BOLD), (" -- " + match.group(2), REG)]
        lines = wrap_runs(self.c, runs, BODY_SIZE,
                          PAGE_W - MARGIN - first_x, PAGE_W - MARGIN - cont_x)
        self._break(BODY_LEAD)
        self.c.setFont(REG, BODY_SIZE)
        self.c.setFillColor(INK)
        self.c.drawString(glyph_x, PAGE_H - self.y - BODY_SIZE, "•")
        self.draw(lines, BODY_SIZE, BODY_LEAD, INK, first_x, cont_x)

    def bullet(self, text):
        self._bullet(text, bold_lead=False)

    def defbullet(self, text):
        self._bullet(text, bold_lead=True)


def render(txt_path, pdf_path):
    header, blocks = parse(txt_path)
    stem = os.path.basename(txt_path)[:-4]
    title, subtitle = titles_for(stem, header)

    c = pdfcanvas.Canvas(pdf_path, pagesize=letter)
    c.setTitle(title)
    c.setAuthor("Computing Talent Initiative")
    c.setSubject("Symbiotic Thinking Dojo")

    r = Renderer(c)
    r.header(title, subtitle)
    for kind, text in blocks:
        getattr(r, kind)(text)
    r._footer()
    c.save()
    return r.pages


def main():
    wanted = [a[:-4] if a.endswith(".txt") else a for a in sys.argv[1:]]
    names = sorted(f[:-4] for f in os.listdir(DOJO_DIR)
                   if f.startswith("dojo-") and f.endswith(".txt"))
    if wanted:
        names = [n for n in names if n in wanted]
        if not names:
            sys.exit(f"no matching dojo .txt in {DOJO_DIR}")

    for name in names:
        pages = render(os.path.join(DOJO_DIR, f"{name}.txt"),
                       os.path.join(DOJO_DIR, f"{name}.pdf"))
        print(f"{name}.pdf — {pages} page(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
