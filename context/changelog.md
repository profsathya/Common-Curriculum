---
purpose: Reverse-chronological log of significant updates — what changed, when, by whom, why
last_updated: 2026-02-28
updated_by: claude-code
status: active
---

# Changelog

Most recent entries first. Each entry: date, who, what changed, why it matters.

---

## 2026-02-28 — [claude-code] Cross-course content review + context folder expansion

**Trigger:** Comprehensive review of CST349 and CST395 from an average student's perspective, evaluating clarity, conciseness, and consistency. Synthesized findings from multiple independent reviews.

**Context files updated:**
- `gaps-and-actions.md` — Added GAP-6 (Cognitive Overload & Finding Deliverables), GAP-7 (Flow Friction & Trust — hardcoded dates, dead-end placeholders), GAP-8 (Terminology Debt — Sprint vs Blueprint/Studio inconsistency), PIPE-6 (Automated Content QA / Due Date Consistency)
- `course-design.md` — Added "Product Experience Principles" section (Actionability First, Single Source of Truth, Minimum Viable Completeness, Format Explicitness) and "Data Architecture: CSV as Single Source of Truth" documentation
- `open-questions.md` — Added OQ-7 (Metaphor Coherence vs Migration Cost in CST395) and OQ-8 (Progressive Disclosure of Capabilities — when to introduce SDL/IS/AB)

**New context files created:**
- `terminology.md` — Canonical terms map for operational vocabulary. Defines Sprint (not Blueprint/Studio), reflection numbering conventions (S1-R1), grading component labels (per-sprint vs overall), assignment type names. Explicitly scoped to operational terms — framework/pedagogy terms are off-limits without instructor approval.
- `content-qa.md` — Definition of Done checklist for publishing any assignment or sprint page. Covers: Quick Start block requirements, date data-binding verification, dependency links, quality signals, reflection numbering, upload instruction specificity, styling consistency, and MVP brief format for incomplete pages. Linked to future PIPE-6 automation.

**Key findings driving the prioritized action plan:**
- 200+ hardcoded dates across 84 HTML files (both courses)
- 15 pages with "Under Construction" banners, including active content
- CST349 grading labels appear contradictory (per-sprint vs overall not distinguished)
- CST395 uses Sprint/Blueprint/Studio inconsistently
- Assignment pages bury deliverable details below motivational framing
- Reflection numbering collides across sprints (multiple "#1" reflections)
- Time estimates understate cognitive demand on several reflection assignments

**Action plan:** P0 (context capture — this entry), P1 (trust-breaking: dates, grading, placeholders), P2 (usability: Quick Start blocks, upload instructions, quality signals), P3 (terminology/navigation: Sprint harmonization, cross-links, reflection numbering), P4 (tone: phrasing, time estimates, HVP threading).

---

## 2026-02-24 — [claude-code] Domain Learning Plan implemented (ASSIGN-1 closed)

Built `s2-w7-domain-learning.html` (written artifact, 10 pts, 3 sections), `domain-research-reference.html` (4 problem domains with sources, myth/reality, investigation questions), and rubric. Closed ASSIGN-1 in assignment-updates.md. Added Design Principle #6 to course-design.md: specificity over generality — assignments that name the actual domains, provide real sources, and show concrete examples produce better work than generic instructions. For this population, specificity is scaffolding.

---

## 2026-02-24 — [claude-code] Week 6 slides + context folder updates

**Week 6 slides:** Replaced `cst395/sessions/week-6-class.html` with new version. 10 sections: title, 3 pattern slides (evidence vs. story, escape-hatch contingencies, projection), 12-min assumption sharpening, challenge demo, two 15-min challenge rounds, demo design with 5 beats, and weekly assignments. No instructor notes — clean student-facing version.

**New context files:**
- `design-uncertainty.md` — Input/output uncertainty framing: 3 student groups (~15% deep, ~25% working-through-it, ~60% surface compliance), why each needs different interventions, implications for optional work and in-class diagnostics.
- `sprint2-findings.md` — AI-discussion rubric inflation (4.3 vs 2.1 avg), honest quality picture (student-authored avg 2.11, worse than Sprint 1's 2.38), per-student patterns, 3 assumption audit gaps (evidence≠inference, escape-hatch contingencies, projection), Dojo conversation richness vs. deliverable gap.
- `pipeline-updates.md` — PIPE-7 through PIPE-10: rubric rework, remaining flat 3/3 scores, filename-as-text bug, deeper insight extraction.
- `assignment-updates.md` — ASSIGN-1 (domain learning plan) and ASSIGN-2 (student-owned demo format with 5 beats, Demo Day logistics for Week 8).
- `session-design.md` — Reusable session design principles: opening structure, feedback-from-submissions pattern, preparation scaffolding, challenge session structure, reliability framing.

---

## 2026-02-24 — [claude-code] Fixed loadActivityConfig() path resolution (Bug 1)

`loadActivityConfig()` failed to find Sprint 2+ activity configs because it searched for exact assignment keys (e.g. `s2-orientation.json`) but activity files use week-prefixed names (e.g. `s2-w5-orientation.json`). Now scans the activity directory and matches by stripping the `s{N}-w{N}-` prefix. Fixes ~130 flat 3/3 scores across both courses.

## 2026-02-24 — [claude-code] Dashboard 3-zone homepage redesign

Replaced flat overview (charts + giant student grid) with 3-zone layout: (1) Sprint Status — current sprint progress, submission rate, analysis coverage, avg quality with distribution bar; (2) Alerts & Flags — consecutive missing submissions, quality drops, data quality warnings including Bug 1 signature detection; (3) Sprint Comparison — side-by-side metrics table with color-coded deltas. Full student grid accessible via toggle button. Applied to both main and anonymized dashboards.

## 2026-02-23 — [sathya] Context folder created

Created shared context system for cross-chat and cross-collaborator continuity. Files: course-design.md, evidence.md, gaps-and-actions.md, pipeline.md, open-questions.md, changelog.md, README.md, index.html. Populated with findings from Sprint 1-2 analysis sessions.

## 2026-02-23 — [sathya] Anonymized export prompt submitted

Claude Code prompt for automatic PII-stripped output as part of `--action=full`. Outputs to `{dataDir}/anonymous/{course}/`. Enables sharing analysis data for AI-assisted review without exposing student names.

## 2026-02-23 — [sathya] Stage 3 pipeline fix submitted

Claude Code prompt for conversation JSON extraction. Fixes: Dojo/ChatGPT JSONs stored as raw text → extracted readable conversation with [Student]/[AI] prefixes. New `conversation` contentType. 15K char limit (up from 5K). Staleness warning added.

## 2026-02-23 — [sathya] Identified three core learning gaps from manual Sprint 2 analysis

Manually analyzed raw student uploads (Discovery Doc, Goal Setting Part II, Assumption Audit) that the automated pipeline couldn't process. Confirmed three gaps: (1) describing vs. analyzing, (2) partner work reproducing shallow patterns, (3) no quality reference point. Established student quality tiers. Identified "recognition + moves + persistence stance" principle for Sprint 3 design. See → evidence.md.

## 2026-02-23 — [sathya] Discovered CST395 Sprint 2 data was stale

Download data was from Feb 17; assignments due Feb 20-22. Analysis showed phantom zeros. CST395 re-download needed. CST349 data was fresh. Root cause: ran `--action=analyze` without `--action=download` for CST395.

## 2026-02-22 — [sathya] Stage 2 custom rubrics prompt submitted

Claude Code prompt for per-assignment-type analysis rubrics and Sonnet upgrade. Depends on Stage 3 being implemented first (needs real conversation data to analyze).

## 2026-02-22 — [sathya] Sprint 2 analysis tracker created

Excel spreadsheet tracking changes in progress, issues found, and update log. Covers both courses. Later superseded by this context folder for ongoing tracking.

## 2026-02-22 — [sathya] Initial data analysis session

Analyzed analysis.json for both courses. Identified quality distributions, Dojo engagement patterns, submission format issues (60% unanalyzable), and bimodal engagement. Established baseline understanding of where students are.
