---
purpose: Canonical terms for operational vocabulary — the dictionary that prevents naming drift
last_updated: 2026-02-28
updated_by: claude-code
status: active
---

# Terminology Map

This file defines canonical operational terms used across both courses. It covers **course operations and structure** (scheduling units, assignment types, grading components). It does **not** cover pedagogical framework terms (SDL, IS, AB, UMPIRE, 3Cs, meta-habits, Symbiotic Thinking) — those are defined in `course-design.md` and should not be renamed without instructor approval.

## Course Structure

| Canonical Term | Allowed Aliases | Deprecated / Avoid | Notes |
|---|---|---|---|
| **Sprint** | (none) | Blueprint, Studio, Phase, Module | Both courses use Sprint. CST395 historically mixed in Blueprint/Studio — standardizing to Sprint. See → open-questions.md OQ-7 |
| **Sprint 1: Foundation** | S1 | "Superagency Over Self" (subtitle, not name) | CST395 subtitle; not used as standalone label |
| **Sprint 2: Mirror** | S2 | "Learning Through Others" (subtitle) | CST395 subtitle |
| **Sprint 3: Complexity** | S3 | "Navigating Ambiguity" (subtitle) | CST395 subtitle |
| **Sprint 4: Mastery** | S4 | "Full Autonomy" (subtitle) | CST395 subtitle |
| **Week** | W1–W16 | Session (when referring to calendar) | "Session" is acceptable for the in-class meeting itself |

## Assignment Types

| Canonical Term | Allowed Aliases | Deprecated / Avoid | Notes |
|---|---|---|---|
| **Productive Reflection** | Reflection | Journal, Diary | Prefix with sprint-week: "S1-R1 Productive Reflection" to disambiguate across sprints |
| **Bridge Reflection** | Bridge | Transition Reflection | Always between sprints: "S1 Bridge Reflection" |
| **Demonstration** | Demo | Presentation (in CST349), Exam | CST349 S1 demo is handwritten in-class; CST395 demos are presented |
| **Peer Conversation** | (none) | Peer Review, Peer Feedback | Distinct from Peer Evaluation (a graded assessment of partner quality) |
| **Peer Evaluation** | Partner Evaluation | (none) | Sprint-end assessment of partner/triad contribution |

## Grading Components

| Canonical Term | Scope | Notes |
|---|---|---|
| **Overall course grading** | Sprints 80% + Final Defense 10% + Participation 10% | The top-level breakdown |
| **Per-sprint grading** | Goal Setting 20% + Reflections 40% + Demo 40% | How each sprint's 20% is subdivided. Sprint 2+ adds group-averaging for reflections/check-ins |
| **Final Defense** | 10% of overall | Not "Capstone" — use Final Defense or Portfolio Defense |

## Course Identity

| Canonical Term | Context | Deprecated / Avoid |
|---|---|---|
| **CST395: AI-Native Solution Engineering** | Full course title | "AI Solutions," "Solution Engineering" (too vague) |
| **CST349: Professional Seminar** | Full course title | "Prof Sem," "Seminar" (ambiguous) |

## Config & Infrastructure

| Canonical Term | Notes |
|---|---|
| **CSV** | The single source of truth for assignment metadata. `config/{course}-assignments.csv` |
| **Config.js** | Auto-generated from CSV via `canvas-sync.js`. Never manually edited for assignment data |
| **Canvas** | LMS. Assignment IDs, submissions, grades live here |
| **Dojo** | Symbiotic Thinking Dojo (Netlify). AI sparring partner for structured thinking exercises |

---

*When adding new terms: define the canonical form, list any aliases you'll accept, and explicitly deprecate alternatives. Keep this under 100 entries.*
