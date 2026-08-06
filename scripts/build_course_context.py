#!/usr/bin/env python3
"""Build a plain-language context snapshot of one course folder.

Reads the course's HTML pages, strips the interactive scaffolding (tooltips,
icons, accordions), and emits a JSON payload the Apps Script endpoint writes
into one Google Doc per course.

Each doc has two tabs, and each is written independently:

  Course  the course pages
  Dojo    the Dojo Core plus every module, from career-intelligence/resources

    python3 scripts/build_course_context.py cst499 --output cst499-context.json
    python3 scripts/build_course_context.py cst499 --section dojo --dry-run

Building one section at a time is the point: editing a dojo file rewrites only
the Dojo tab in each doc, and never touches the course content.

The doc is downstream of the repo. The repo is the source of truth; each tab is
regenerated from scratch when it syncs and any edit made in it is lost.
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


def discover_pages(course_dir):
    """Every .html under the course folder, relative to it, top level first."""
    found = []
    for root, dirs, files in os.walk(course_dir):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        rel_dir = os.path.relpath(root, course_dir)
        rel_dir = "" if rel_dir == "." else rel_dir
        for name in sorted(files):
            if name.endswith(".html") and not name.startswith("."):
                found.append(os.path.join(rel_dir, name) if rel_dir else name)
    # Top-level pages first, then subfolders alphabetically.
    return sorted(found, key=lambda p: (p.count(os.sep), os.path.dirname(p), p))


def ordered_pages(course_dir, explicit_order):
    on_disk = discover_pages(course_dir)
    ordered = [f for f in explicit_order if f in on_disk]
    ordered += [f for f in on_disk if f not in ordered]
    return ordered


def is_skipped(rel_path, skip):
    """A skip entry matches a full path, a bare filename, or a folder prefix."""
    name = os.path.basename(rel_path)
    for entry in skip:
        if entry in (rel_path, name):
            return True
        if entry.endswith("/") and rel_path.startswith(entry):
            return True
    return False


# ------------------------------------------------------------------ dojo

def discover_dojo_files(dojo_dir, explicit_order):
    """Every dojo-*.txt in the resources folder, listed order first."""
    on_disk = sorted(
        name for name in os.listdir(dojo_dir)
        if name.startswith("dojo-") and name.endswith(".txt")
    )
    ordered = [f for f in explicit_order if f in on_disk]
    ordered += [f for f in on_disk if f not in ordered]
    return ordered


def convert_dojo_file(path):
    """First non-blank line becomes the heading; '== X ==' becomes a subhead.

    The dojo files already carry their own version line at the top, so the
    heading in the doc shows which version a student is looking at.
    """
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()

    heading = ""
    lines = []
    for line in raw.split("\n"):
        stripped = line.strip()
        if not heading:
            if stripped:
                heading = stripped
            continue
        if not stripped:
            continue
        section = re.match(r"^==\s*(.+?)\s*==$", stripped)
        lines.append(f"## {section.group(1)}" if section else stripped)

    return heading, "\n".join(lines)


def build_dojo_section(config):
    dojo = config.get("dojo") or {}
    dojo_dir = os.path.join(REPO_ROOT, dojo.get("source_dir", ""))
    if not os.path.isdir(dojo_dir):
        sys.exit(f"dojo folder not found: {dojo_dir}")

    pages = []
    for name in discover_dojo_files(dojo_dir, dojo.get("order", [])):
        if name in dojo.get("skip", []):
            continue
        heading, content = convert_dojo_file(os.path.join(dojo_dir, name))
        if not content.strip():
            continue
        pages.append({
            "path": f"{dojo.get('source_dir', '')}/{name}",
            "title": heading or name,
            "content": content,
        })

    return {
        "tab": config["tabs"]["dojo"],
        "heading": dojo.get("heading", "The Dojo"),
        "intro": dojo.get("intro", ""),
        "pages": pages,
        "glossary": [],
    }


# ---------------------------------------------------------------- payload

def build_course_section(course_key, config):
    course = config["courses"].get(course_key)
    course_dir = os.path.join(REPO_ROOT, course_key)
    if not os.path.isdir(course_dir):
        sys.exit(f"course folder not found: {course_dir}")

    converter = PageConverter()
    pages = []
    titles = course.get("titles", {})
    skip = course.get("skip", [])
    for rel_path in ordered_pages(course_dir, course.get("order", [])):
        if is_skipped(rel_path, skip):
            continue
        content = converter.convert(os.path.join(course_dir, rel_path))
        if not content.strip():
            continue
        name = os.path.basename(rel_path)
        title = titles.get(rel_path) or titles.get(name)
        if not title:
            stem = name[:-5].replace("-", " ").replace("_", " ").strip()
            folder = os.path.dirname(rel_path)
            title = f"{folder} · {stem}" if folder else stem
        pages.append({
            "path": f"{course_key}/{rel_path}",
            "title": title,
            "content": content,
        })

    glossary = [
        {"term": term, "definition": " ".join(parts)}
        for term, parts in converter.glossary.items()
    ]

    return {
        "tab": config["tabs"]["course"],
        "heading": course.get("doc_title", f"{course_key.upper()} — course context"),
        "intro": course.get("intro", ""),
        "pages": pages,
        "glossary": glossary,
    }


def build(course_key, config, sections=("course", "dojo")):
    course = config["courses"].get(course_key)
    if course is None:
        sys.exit(f"'{course_key}' is not in config/course-docs.json")

    built = []
    if "course" in sections:
        built.append(build_course_section(course_key, config))
    if "dojo" in sections:
        built.append(build_dojo_section(config))

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
        "sections": built,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("course", help="course folder name, e.g. cst499")
    parser.add_argument("--output", help="write the JSON payload here")
    parser.add_argument("--dry-run", action="store_true", help="print the text instead")
    parser.add_argument(
        "--section", choices=["course", "dojo", "all"], default="all",
        help="which tab to build (default: both)",
    )
    args = parser.parse_args()

    wanted = ("course", "dojo") if args.section == "all" else (args.section,)
    payload = build(args.course, load_config(), wanted)

    if args.dry_run:
        print(payload["title"])
        print(payload["generated_at_pacific"])
        for section in payload["sections"]:
            print("\n" + "#" * 70)
            print(f"TAB: {section['tab']} — {section['heading']}")
            print("#" * 70)
            for page in section["pages"]:
                print("\n" + "=" * 70)
                print(page["title"], f"({page['path']})")
                print("=" * 70)
                print(page["content"])
            if section["glossary"]:
                print("\n" + "=" * 70 + "\nGlossary\n" + "=" * 70)
                for entry in section["glossary"]:
                    print(f"\n{entry['term']}\n{entry['definition']}")
        return 0

    target = args.output or f"{args.course}-context.json"
    with open(target, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
    summary = ", ".join(
        f"{s['tab']}: {len(s['pages'])} pages / "
        f"~{sum(len(p['content'].split()) for p in s['pages'])} words"
        for s in payload["sections"]
    )
    print(f"wrote {target} — {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
