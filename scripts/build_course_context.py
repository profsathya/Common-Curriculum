#!/usr/bin/env python3
"""Build a plain-language context snapshot of one course folder.

Reads the course's HTML pages, strips the interactive scaffolding (tooltips,
icons, accordions), and emits a JSON payload the Apps Script endpoint turns
into a single Google Doc — one doc per course.

    python3 scripts/build_course_context.py cst499 --output cst499-context.json
    python3 scripts/build_course_context.py cst499 --dry-run

The doc is downstream of the repo. The HTML is the source of truth; the doc is
regenerated from scratch on every push and any edit made in it is lost.
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:  # pragma: no cover
    sys.exit("beautifulsoup4 is required: pip install beautifulsoup4")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(REPO_ROOT, "config", "course-docs.json")
PACIFIC = timezone(timedelta(hours=-7))


# --------------------------------------------------------------- helpers

def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


class PageConverter:
    """Turns one course page into headings + paragraphs, collecting glossary."""

    def __init__(self):
        self.glossary = {}

    def inline(self, node):
        out = []
        for child in node.children:
            if isinstance(child, NavigableString):
                out.append(str(child))
            elif isinstance(child, Tag):
                if child.name in ("svg", "script", "style"):
                    continue
                classes = child.get("class") or []
                if "gl" in classes:
                    out.append(self._glossary_term(child))
                elif "bub" in classes or "gt" in classes:
                    continue
                elif child.name in ("b", "strong", "i", "em", "a"):
                    out.append(self.inline(child))
                elif child.name == "br":
                    out.append(" ")
                else:
                    out.append(self.inline(child))
        return clean("".join(out))

    def _glossary_term(self, span):
        trigger = span.find("button", class_="gt")
        bubble = span.find("span", class_="bub")
        label = span.find("b", class_="bt")
        term = clean(label.get_text()) if label else None
        if bubble is not None and term and term not in self.glossary:
            parts = []
            for row in bubble.find_all("span", class_="br"):
                lead = row.find("i")
                prefix = clean(lead.get_text()) if lead else ""
                if lead is not None:
                    lead.extract()
                body = clean(row.get_text())
                parts.append(f"{prefix} {body}".strip())
            self.glossary[term] = parts
        return clean(trigger.get_text()) if trigger else (term or "")

    def _list(self, container):
        lines = []
        for li in container.find_all("li", recursive=False):
            text = self.inline(li)
            if text:
                lines.append(f"- {text}")
        return lines


    BLOCKS = ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6",
              "div", "section", "article", "td", "th"]
    HEADING_PREFIX = {"h1": "# ", "h2": "## ", "h3": "### ",
                      "h4": "### ", "h5": "### ", "h6": "### "}

    def _leaf_blocks(self, soup):
        """Text of every block element that contains no nested block element."""
        root = soup.body or soup
        lines, seen = [], set()
        for node in root.find_all(self.BLOCKS):
            if node.find(self.BLOCKS):
                continue  # not a leaf; its children carry the text
            text = self.inline(node)
            if not text or text in seen:
                continue
            seen.add(text)
            if node.name == "li":
                lines.append(f"- {text}")
            else:
                lines.append(self.HEADING_PREFIX.get(node.name, "") + text)
        return lines

    def convert(self, path):
        with open(path, encoding="utf-8") as fh:
            soup = BeautifulSoup(fh.read(), "html.parser")
        for tag in soup(["script", "style", "svg", "footer"]):
            tag.decompose()

        lines = []

        header = soup.find("div", class_="course-header") or soup.find("div", class_="pagehead")
        if header:
            h1 = header.find("h1")
            if h1:
                lines.append(f"# {clean(h1.get_text())}")
            for key in ("eyebrow", "sub"):
                node = header.find("div", class_=key)
                if node:
                    lines.append(self.inline(node))
            body_col = header.find("div", class_="sub")
            body_col = body_col.parent if body_col else header
            for node in body_col.find_all(["div", "ol", "ul"], recursive=False):
                classes = node.get("class") or []
                if "lead" in classes:
                    lines.append(self.inline(node))
                elif "lead-list" in classes:
                    lines.extend(self._list(node))

        bigpic = soup.find("details", class_="bigpic")
        if bigpic:
            lines.append("## The big picture")
            cap = bigpic.find("p", class_="arc-caption")
            if cap:
                lines.append(self.inline(cap))
            for card in bigpic.find_all("a", class_="arc-card"):
                bits = [
                    self.inline(card.find("div", class_="s") or card),
                    self.inline(card.find("div", class_="nm") or card),
                    self.inline(card.find("div", class_="th") or card),
                    self.inline(card.find("div", class_="who") or card),
                ]
                lines.append("- " + " | ".join(b for b in bits if b))
            beyond = bigpic.find("div", class_="beyond")
            if beyond:
                blabel = beyond.find("div", class_="label")
                lines.append(f"### {self.inline(blabel)}" if blabel else "### Beyond the grade")
                hd = beyond.find("div", class_="hd")
                if hd:
                    lines.append(self.inline(hd))
                for node in beyond.find_all(["p", "ul"], recursive=False):
                    if node.name == "ul":
                        lines.extend(self._list(node))
                    else:
                        lines.append(self.inline(node))

        for module in soup.find_all("details", class_="module"):
            head = module.find("div", class_="module-head")
            name = head.find("span", class_="name") if head else None
            tag = head.find("span", class_="tag") if head else None
            heading = clean(name.get_text()) if name else "Section"
            if tag:
                heading += " — " + clean(tag.get_text())
            lines.append(f"## {heading}")

            goal = module.find("div", class_="goal")
            if goal:
                label = goal.find("div", class_="label")
                if label:
                    lines.append(self.inline(label))
                text = goal.find("div", class_="text")
                if text:
                    ul = text.find("ul")
                    lines.extend(self._list(ul) if ul else [self.inline(text)])

            prereq = module.find("div", class_="prereq")
            if prereq:
                lines.append(self.inline(prereq))

            items = module.find("div", class_="items")
            if not items:
                continue
            for node in items.find_all("div", class_=["group-label", "item", "note"], recursive=False):
                classes = node.get("class") or []
                if "group-label" in classes:
                    lines.append(f"### {self.inline(node)}")
                elif "note" in classes:
                    lines.append(f"Note — {self.inline(node)}")
                else:
                    body = node.find("div", class_="body")
                    if not body:
                        continue
                    title = body.find("div", class_="title")
                    meta = body.find("div", class_="meta")
                    marks = []
                    if title:
                        for badge in title.find_all("span", class_="badge"):
                            marks.append(clean(badge.get_text()))
                            badge.extract()
                    heading = self.inline(title) if title else ""
                    if marks:
                        heading += " (" + " · ".join(marks) + ")"
                    lines.append(f"**{heading}**")
                    if meta:
                        lines.append(self.inline(meta))

        # Pages without the module/accordion structure (problem-spaces, the
        # sprint pages) are built from leaf block elements in document order,
        # which catches the card layouts the structured pass does not know.
        if len(lines) < 6:
            lines = self._leaf_blocks(soup)

        return "\n".join(l for l in lines if l)


# --------------------------------------------------------------- payload

def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as fh:
        return json.load(fh)


def ordered_pages(course_dir, explicit_order):
    on_disk = sorted(f for f in os.listdir(course_dir) if f.endswith(".html"))
    ordered = [f for f in explicit_order if f in on_disk]
    ordered += [f for f in on_disk if f not in ordered]
    return ordered


def build(course_key, config):
    course = config["courses"].get(course_key)
    if course is None:
        sys.exit(f"'{course_key}' is not in config/course-docs.json")

    course_dir = os.path.join(REPO_ROOT, course_key)
    if not os.path.isdir(course_dir):
        sys.exit(f"course folder not found: {course_dir}")

    converter = PageConverter()
    pages = []
    for filename in ordered_pages(course_dir, course.get("order", [])):
        if filename in set(course.get("skip", [])):
            continue
        content = converter.convert(os.path.join(course_dir, filename))
        if not content.strip():
            continue
        pages.append({
            "path": f"{course_key}/{filename}",
            "title": course.get("titles", {}).get(filename, filename.replace(".html", "")),
            "content": content,
        })

    glossary = [
        {"term": term, "definition": " ".join(parts)}
        for term, parts in converter.glossary.items()
    ]

    return {
        "course": course_key,
        "title": course.get("doc_title", f"{course_key.upper()} — course context"),
        "generated_at_pacific": datetime.now(PACIFIC).isoformat(timespec="seconds"),
        "metadata": {
            "repository": os.environ.get("GITHUB_REPOSITORY", ""),
            "commit_sha": os.environ.get("GITHUB_SHA", ""),
            "run_url": (
                f"{os.environ.get('GITHUB_SERVER_URL', '')}/"
                f"{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/"
                f"{os.environ.get('GITHUB_RUN_ID', '')}"
                if os.environ.get("GITHUB_RUN_ID") else ""
            ),
        },
        "intro": course.get("intro", ""),
        "pages": pages,
        "glossary": glossary,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("course", help="course folder name, e.g. cst499")
    parser.add_argument("--output", help="write the JSON payload here")
    parser.add_argument("--dry-run", action="store_true", help="print the text instead")
    args = parser.parse_args()

    payload = build(args.course, load_config())

    if args.dry_run:
        print(payload["title"])
        print(payload["generated_at_pacific"])
        for page in payload["pages"]:
            print("\n" + "=" * 70)
            print(page["title"], f"({page['path']})")
            print("=" * 70)
            print(page["content"])
        if payload["glossary"]:
            print("\n" + "=" * 70 + "\nGlossary\n" + "=" * 70)
            for entry in payload["glossary"]:
                print(f"\n{entry['term']}\n{entry['definition']}")
        return 0

    target = args.output or f"{args.course}-context.json"
    with open(target, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
    words = sum(len(p["content"].split()) for p in payload["pages"])
    print(f"wrote {target}: {len(payload['pages'])} pages, "
          f"{len(payload['glossary'])} glossary terms, ~{words} words")
    return 0


if __name__ == "__main__":
    sys.exit(main())
