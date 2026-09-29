---
name: building-canvas-fall-2026
description: Use when creating or updating assignment groups, modules, or assignments in the Fall 2026 Canvas shells (CST286 33930 · CST349 34789 · CST499 33649). The ordered build recipe — grade groups and weights, assignments from assignments.html rows, per-sprint type-split modules with submit requirements, the reflection-first ordering, same-pass id write-back, and the verification and publish rules. Fall-2026-specific by decision; whether other programs adopt a similar structure is deliberately left open.
---

# Building Canvas for Fall 2026 - the checks to run before each write

One screen. The build recipe, its Fall-2026-only scope and its history are in `references/rules.md` in this folder - read that once at the start of a build, then run this list before each write and on the read-back. Every line traces to a section there, named in parentheses. It covers the CST286, CST349 and CST499 shells only; `updating-canvas` stays the general skill. When a rule changes in `references/rules.md`, its test changes here in the same edit (and the other way round).

## Before the first write

- The shell's assignments, groups and modules are inventoried and each found item has a recorded ruling; nothing was overwritten, duplicated or deleted silently. (Before the first write)
- Where a Canvas object is deleted or recreated, the link consumers (home pages, course Google Docs) are swept the same day. (Before the first write)
- The grade groups match the course's `assignments.html` grade-group cards and weighted assignment groups are on; legacy imported groups stay until their cleanup ruling. (1. Grade groups)

## On every assignment

- Name, points, submission type, grade group and due date match its `assignments.html` row; the due time is 11:59 p.m. Pacific. (2. Assignments)
- A date change went into COURSES first, then to Canvas; `due_at` was not edited from a page change. (2. Assignments)
- The description is an iframe of the row's public page (width 100%, height ~1100, border 0, a title attribute) plus one fallback line linking the page in a new tab - never a rewrite of the page, except the short OYP items below. (2. Assignments; 6. Short own-your-progress activities)
- Published on creation only while the course shell is unpublished; in a live course, a new item stays unpublished until Sathya's explicit go. (2. Assignments)
- Every OYP assignment: `grading_type=pass_fail`, `omit_from_final_grade=true`, points_possible 100, online text entry; never "Not Graded". (2. Assignments - OYP assignments)

## On every short own-your-progress description (steps in a home-page `woyp` block)

- It is styled HTML content - not an iframe, not unstyled text - in the order: ownership line in a tinted left-border box, bold `Goal: …`, the lead paragraph if any, numbered steps, any coach note in a bordered grey box, then Submission Options. (6. Short own-your-progress activities)
- The heading reads `Submission Options:`, one option per bullet, a `(OR)` chip on every bullet but the last, and the closing line under the list. (6. Submission Options, never "Submit")
- Emphasis is `<strong>` or `<b>`; no `font-weight` or `letter-spacing` in a style attribute; the read-back shows the expected tags survived, compared on structure, not byte length. (6. Canvas strips font-weight; Checklist)
- Writes go one assignment at a time with a pause between, never a burst. (6. Pace the writes)

## On every module

- Two per sprint: "Sprint N · Graded items" with sequential order ON, "Sprint N · Own your progress" with it OFF. (3. Modules)
- Every item in both carries a **submit** completion requirement. (3. Modules)
- No reflection assignment exists; each sprint's Graded-items module opens with its first graded item, whose first question is the sprint reflection. (3. Modules)
- CST286 and CST349: no module carries a cross-sprint prerequisite. CST499: every graded-items module after Sprint 1 has Sprint 1 · Graded items as its only prerequisite and sits below it in module order. (3. Modules)
- Modules are hidden from the student navigation. (3. Modules)

## Before reporting done

- The Canvas id, URL and published state are in the row's cells, written in the same pass; `assignments.html` was hand-edited, not regenerated. (4. Write-back)
- Weights, due dates, submission types, completion requirements, sequential flags and prerequisites were read back through the API. (5. Verify)
- Anything student-visible was screenshotted, and embeds were checked by eye before a blank iframe is called a failure. (5. Verify)
