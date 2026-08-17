---
name: building-canvas-fall-2026
description: Use when creating or updating assignment groups, modules, or assignments in the Fall 2026 Canvas shells (CST286 33930 · CST349 34789 · CST499 33649). The ordered build recipe — grade groups and weights, assignments from assignments.html rows, per-sprint type-split modules with submit requirements, the reflection gate, same-pass id write-back, and the verification and publish rules. Fall-2026-specific by decision; whether other programs adopt a similar structure is deliberately left open.
---

_Scope (Sathya, 15 August 2026): this is the build process for the three Fall 2026 CSUMB courses
only. It lives here rather than in the team repo's `updating-canvas` on his call — it is not (yet) a
CTI-wide pattern, and nothing in it is a rule for other programs. `updating-canvas` (Career
Intelligence, June 2026) remains the general Canvas-build skill; where the two differ — most visibly
module architecture — this file wins for these three courses and only these._

_Derived from the lock record (`cowork/fall-2026-courses/CONTEXT.md`; the Canvas gating model locked
15 Aug 2026) and the first live build (CST499 week 1, 15 Aug 2026). The design decisions this recipe
implements are stated there, not here — this file is only the how. Last checked: 15 August 2026._

# Building Canvas for the Fall 2026 courses

The course's `assignments.html` is the source of truth; Canvas is the display. The
`writing-assignments` skill governs the page and the pipeline around it; this file is the
Canvas-side recipe: what to create, in what order, with what settings.

## Before the first write

Inventory the shell — assignments, groups, modules. Course copies arrive carrying semester imports
and old drafts (the CST499 shell held ~20 spring items and four stale drafts on 15 Aug). Surface
what is there and get a ruling; never silently overwrite, duplicate, or delete. When Canvas objects
are deleted or recreated, their module-item URLs die with them — sweep the link consumers
(home pages, course Google Docs) the same day.

## 1. Grade groups — once per course

Create the course's grade-group set exactly as its `assignments.html` grade-group cards state
(CST499: Own your progress guidance 0% · Graded items 40% · Mid-term 10% · Interviews 50% —
the groups mirror the syllabus grade table rows; CST286/349 carry their own four-group sets per
their syllabi), then turn on weighted assignment groups. Legacy groups from an import
stay until their cleanup ruling — unpublished items never touch grades.

## 2. Assignments — one per assignments.html row

Name, points, submission type, grade group and due date all come from the row (due time is
11:59 p.m. Pacific, per the syllabi). The description is an iframe of the row's public page
(width 100%, height ~1100, border 0, a title attribute) plus one fallback line linking the page in
a new tab — never a rewrite of the page's content. **Publish policy: publish-on-creation while the
course shell is unpublished; once the course is live, new items stay unpublished until Sathya's
explicit go.**

## 3. Modules — per sprint, split by type

- Two modules per sprint: **"Sprint N · Graded items"** with *students must move through
  requirements in sequential order* ON, and **"Sprint N · Own your progress"** with sequencing OFF.
- Every item in both carries a **submit** completion requirement — satisfied even by a late
  submission. Skipping an Own-your-progress item never blocks the next one.
- The sprint-opening **reflection is its own one-item module** (so it can serve as a prerequisite —
  Canvas prerequisites reference modules, not items), and the next sprint's modules list that
  reflection module as their ONLY prerequisite. Never "complete the previous sprint": module
  prerequisites have no OR condition, and the reflection is the gate by design. *(Open as of 15 Aug:
  the reflection assignments themselves are not yet created, and their kind and points are
  undecided.)*
- Modules stay hidden from the student navigation — they are gating machinery; the course home page
  carries navigation. Requirements still gate direct links.

## 4. Write-back — same pass, never later

Canvas id, URL and published state go into the generator's data block
(`cowork/fall-2026-courses/mk_assignments.py`), the course's `assignments.html` is regenerated and
committed in the same working pass. The file never lags the shell.

## 5. Verify

Read everything back through the API after writing — weights, due dates, submission types,
completion requirements, sequential flags, prerequisites — before reporting done. Screenshot
anything student-visible. Cross-origin iframes can render blank in automated screenshots; verify
embeds by eye before diagnosing a failure.

## Checklist (checkable by looking)

- The shell was inventoried before the first write; rulings on found content are recorded.
- Groups match the course's grade-group cards and weighted grading is on.
- Every assignment's name, points, due date, submission type and group match its row; the
  description is the iframe plus the fallback link.
- Graded-items modules are sequential, Own-your-progress modules are not; every item requires
  submit; each sprint's modules are gated only by the previous sprint's reflection module.
- Canvas ids, URLs and published state are written back and committed in the same pass.
- Everything was read back via the API; embeds checked by eye.

---

*Provenance — Human (Sathya): the gating model and its Fall-2026-only scope, the publish policy,
the everything-100 points call, the iframe-embed and new-tab decisions, the keep-it-out-of-Athena
placement. Human + AI: the type-split module architecture and reflection-as-gate, worked out in
conversation 15 Aug 2026 from Canvas's module-scoped sequencing and OR-less prerequisites.
AI (Alan): this file's drafting, 15 Aug 2026, from the first CST499 build, for Sathya's edit.*
