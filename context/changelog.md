---
purpose: Reverse-chronological log of significant updates — what changed, when, by whom, why
last_updated: 2026-02-23
updated_by: sathya
status: active
---

# Changelog

Most recent entries first. Each entry: date, who, what changed, why it matters.

---

## 2026-02-23 — [claude] Stage 4: Anonymized export implemented

Implemented automatic PII-stripped export as part of `--action=full` and `--action=dashboard`. New functions: `buildNameReplacementMap`, `replaceNamesInText`, `anonymizeAnalysis`, `anonymizeSubmissions`, `generateAnonymizedExport`. Outputs analysis.json, dashboard.html, and submissions/ to `{dataDir}/anonymous/{course}/`. Dashboard shows anonymous IDs (CST395-XX) instead of names. Name replacement uses word boundaries and length thresholds (>=4 chars for standalone names) to avoid false positives. Does NOT copy id-mapping.json. See → pipeline.md Stage 4.

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
