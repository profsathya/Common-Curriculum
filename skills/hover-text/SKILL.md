---
name: hover-text
description: Use when adding or revising hover text (glossary bubbles) on any student-facing course page — a home page, assignment page, design page, or sprint page; when a draft introduces a coined or course-specific term (Sprint Exam, baseline, Goal Plan, Symbiotic Thinking); and after any page rebuild, to verify the existing bubble layer survived. Covers when a term earns a bubble, the why-first register, placement, the exact markup and CSS, and the two-reader rule (student + AI Dojo).
---

# Hover text - the checks to run before a bubble goes live

One screen. The rules, the incidents they came from and the version history are in `references/rules.md` in this folder - read that once at the start of a hover-text pass, then run this list on the page. Every line traces to a section there, named in parentheses. Remember the two readers: the student skimming, and the AI Dojo reading every line. When a rule changes in `references/rules.md`, its test changes here in the same edit (and the other way round).

## Before editing

- The file was re-read from disk just before the edit, and its current `class="gl"` count noted. (After any rebuild)

## On every bubble

- The term passes at least one test: acted on where it appears with its explanation on another page; a course-specific meaning a dictionary gets wrong; a coined structure the page repeats weekly. (When a term earns a bubble)
- It is not on a term whose row already explains it in place, not a third bubbled instance of a term on the page, and not on content planted for a live session. (When a term earns a bubble)
- The first row carries the why or the payoff; bare mechanics ("one to three ungraded activities per week") ride on the page chrome instead. (The register)
- Each row is a declarative statement an AI coach could act on. (Hover text)
- A bold title, then two or three labeled rows, each label italic and from the established set, one to three sentences a row. (Format)
- One bubble per block, at the moment of action; in a week block, prefer the session row over the 🎯 row below it. (Placement)
- No bubble button sits inside an `<a>`; on a linked title the bubble goes on a nearby plain-text mention. (Placement)
- The markup matches the copy-exact pattern: `span.gl` > `button.gt` + `span.bub[role=tooltip]` holding `b.bt` and `span.br` rows. (Markup and CSS)
- The term's container is in the page's `position:relative` list; focused in a browser, the bubble opens next to the term, not at the page's top-left corner. (Markup and CSS, 1. Anchoring)
- Inside a colored section head, the page carries `.wsec-head .gt{border-bottom-color:currentColor;}`. (Markup and CSS, 2. Colored heads)

## Before it is published

- Tag balance is clean, and a screenshot shows one bubble opened by keyboard focus. (Checklist)
- After any rebuild, the `class="gl"` count matches the previous version, and the count is recorded in the design log entry for the change. (After any rebuild; Checklist)
