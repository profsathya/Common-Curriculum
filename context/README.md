---
purpose: Onboarding guide for teammates joining the Common-Curriculum project
last_updated: 2026-02-28
updated_by: claude-code
---

# Context Folder — Onboarding Guide

## What This Is

This folder is the **shared memory** for the Common-Curriculum project. It captures design decisions, evidence from student data, active issues, and open questions across two courses (CST395 and CST349) so that anyone — human or AI — can quickly understand the current state and contribute effectively.

## How to Get Started

### 1. Read the files in this order

1. **`index.html`** — Open in browser for visual navigation. This is the fastest way to orient yourself.
2. **`course-design.md`** — Understand the course structure, frameworks, and sprint progression.
3. **`evidence.md`** — What we know from student data analysis (anonymized).
4. **`gaps-and-actions.md`** — What we're working on and why.
5. **`open-questions.md`** — Unresolved design tensions where your input matters.

You don't need to read `pipeline.md` unless you're working on the analysis scripts, or `changelog.md` unless you're catching up after time away.

### 2. Set up your environment

You need access to two repos:

- **Common-Curriculum** (this repo) — Course pages, scripts, context folder. You should have been added as a collaborator.
- **Common-Curriculum-Data** — Student submission data and analysis output. Contains an `anonymous/` subfolder with PII-stripped data safe for AI analysis.

To work with the analysis pipeline:
```bash
git clone [Common-Curriculum repo URL]
git clone [Common-Curriculum-Data repo URL]
# Ensure both are siblings in the same parent directory
```

The analysis script lives at `scripts/submission-analyzer.js` in Common-Curriculum. See `pipeline.md` for details.

### 3. Working with AI assistants (Claude, ChatGPT, etc.)

When starting a new AI chat session about this project:

- Upload or reference the **context folder** files — they're designed to give an AI the full project state.
- For student data analysis, use files from **Common-Curriculum-Data/anonymous/** only. Never share files from the non-anonymous course directories.
- **POLICY: No student names in any analysis, discussion, or AI conversation.** Use Canvas anonymous IDs only (e.g., CST395-07, CST349-23).

If you're using Claude Code:
- Point it at the Common-Curriculum repo
- It can read and update context files as part of its workflow
- After significant work, ask it to update `changelog.md` and any relevant context files

### 4. How to update context files

After you do meaningful work (design decisions, data analysis, implementing changes):

1. **Update the relevant file(s)** — Add findings to `evidence.md`, update status in `gaps-and-actions.md`, add your thinking to `open-questions.md`.
2. **Add a changelog entry** — Top of `changelog.md`, reverse-chronological. Include: date, your name, what changed, why.
3. **Update `last_updated` in frontmatter** — Each file has YAML frontmatter with `last_updated` and `updated_by`.
4. **Commit and push** — Standard git workflow.

Keep entries concise. The goal is "enough for someone else to pick up where you left off," not comprehensive documentation.

### 5. When to have a face-to-face instead

Check `open-questions.md` regularly. If you see a question where you disagree with the current direction or have a fundamentally different perspective, **flag it in the file** (add your name and a brief note) and schedule a conversation. Some design tensions are better resolved in 10 minutes of dialogue than 10 rounds of async text.

## File Purposes (Quick Reference)

| File | What it captures | Who updates it |
|---|---|---|
| `course-design.md` | Course structure, frameworks, sprint design, grading, product experience principles | Anyone making design changes |
| `evidence.md` | Anonymized findings from student data | Anyone running analysis |
| `gaps-and-actions.md` | Active problems, interventions, status | Anyone working on fixes |
| `pipeline.md` | Technical infrastructure, scripts, known issues | Anyone touching the code |
| `open-questions.md` | Unresolved design tensions | Anyone with questions or opinions |
| `terminology.md` | Canonical operational terms, allowed aliases, deprecated names | Anyone noticing naming drift |
| `content-qa.md` | Definition of Done checklist for publishing pages | Anyone creating or revising content |
| `changelog.md` | What changed, when, by whom, why | Everyone, every session |

## Ground Rules

- **No student names anywhere.** Canvas anonymous IDs only.
- **Update context when you finish working**, not "later."
- **Keep files under ~500 lines.** If a file is growing past that, split or summarize.
- **Conclusions over raw data.** Context files capture what we concluded and why, not every data point. Raw data lives in Common-Curriculum-Data.
- **Disagree openly.** Add your perspective to `open-questions.md` rather than silently overriding someone else's decision.
