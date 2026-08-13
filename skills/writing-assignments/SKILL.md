---
name: writing-assignments
description: Use when writing or revising any assignment or activity page students will act on — the weekly reflection, the comprehensive, a sprint activity, a practice-dojo companion page. Triggers when a design conversation has decided an assignment and it needs its student-facing page, and when an existing assignment page is revised. Covers the Purpose–Task–Criteria–Reflection shape (adapted from the Transparent Assignment Template) with its builds-on/prerequisite block, the internal qualities line, and the pipeline the page lands in (schedule.html registry → HTML page → Canvas iframe → reconcile). Prose register belongs to writing-to-teach, goal lines to writing-learning-goals, the final trim to reviewing-course-text — this skill sits a level above those three and calls them.
---

_Derived from the Fall 2026 four-layer lock record (`cowork/fall-2026-courses/CONTEXT.md`), which holds the decisions this skill assumes. This file governs how to write the thing; where it states a decision the record does not, that is drift to fix here. Last checked against the record: 13 August 2026._

_Status: v1 (12 August 2026). Born from the assignment-pipeline conversation of 11–12
August (Sathya + Alan); the shape adapts the Transparent Assignment Template © 2013
Mary-Ann Winkelmes (TILT Higher Ed), whose national study showed that making purpose,
task, and criteria explicit measurably improves learning. First test: the first fall
2026 assignment built through it._

# Writing assignments

An assignment page tells a student five things, in this order: why this work is worth
their time, what it builds on, what exactly to do, how they'll know they did it well,
and what to take from it afterward. Every assignment and activity page in the fall
courses carries these five blocks. The design conversation decides the assignment; this skill makes the page
uniform.

## Purpose — why this exists

First sentence carries the payoff, in the student's terms. Then, plainly:

- **The skills this practices** — named in student language, and honest about where
  they sit on the ladder from simple to complex (understand → apply → analyze →
  synthesize → evaluate → create). Say where the skill matters beyond this assignment:
  in the course, in the field, in working life.
- **The knowledge it builds** — the two or three pieces of content the student will
  come away knowing.

When an assignment deliberately withholds the how — the struggle is the point — the
purpose says so in so many words ("the purpose here is for you to feel stuck and invent
your own approach; that experience is the skill"). Confusion a student was warned about
reads as design; confusion they weren't reads as not belonging.

## What you're building on — the prerequisite block

Its own short block, placed right before Task — the moment the student needs the prior
work is the moment they start this one. Three lines, concrete:

- **The prior activity this stands on**, named, with the artifact in hand: "bring your
  evidence inventory from Sprint 0," never "recall previous material."
- **The knowledge or skill assumed**, in one plain sentence, so the student can
  self-check before starting.
- **Where to go back** if it's shaky — a link to the earlier page, framed as a
  refresher rather than a remediation.

This block is the student-language mirror of the machinery: the schedule's prerequisite
column and the Canvas module requirement name the same prior work the page names —
one link, three views. It is also what makes the course feel cumulative on every page:
each assignment visibly extends an evolving piece of work rather than starting fresh.

## Task — what to do

Steps in the order the student should take them, each instruction at its point of
action. Name the known wrong turns ("a common mistake here is…") instead of letting
students find them. If a step needs a tool, link it in the step. The reader gets one
sentence before deciding whether to keep reading — the backbone must survive a skim,
with depth behind expandables (writing-to-teach governs every sentence).

## Criteria for success — what done and good look like

- **Done vs. good.** State what completing the task looks like, and separately what
  strong work looks like — the difference is where the walkthrough conversation will
  spend its time. Movement counts more than altitude: strong means further than where
  the student started.
- **Examples, plural.** Show at least two real examples of what the characteristics
  look like in practice — more than one, so no single model becomes the thing to copy.
- **A checklist the student can run.** Short, checkable-by-looking; the same list works
  for self-check and for peer feedback.
- **Grading, in the open.** The points, what earns them, and how this feeds the
  walkthrough (which will sample this work). No hidden rubric.

## Reflection — learn and grow from it

Two or three questions at the end of the page, written to be answered after the work:
what changed in your understanding, what would you do differently, what does this tell
you about how you work. These feed the Friday reflection. After grades come back, the
reflection is where a student adjusts strategy — ask for that explicitly when the
assignment is one they'll build on.

## The internal lines (never on the student page)

Each assignment's record — not its page — carries:

- **Qualities** — the named nurture-track subset this activity carries (chosen by its
  focus at this point in the course), and one line on what movement would look like.
- **Evidence linkage** — which of the course's evidence standards the walkthrough
  samples from this work.

## The pipeline this page lands in

The repo is the source of truth; Canvas is the display.

1. The design conversation decides the assignment → one row in the course's
   `schedule.html` (mechanics only: id · week · module · title · kind · key-item or
   checkpoint · points · due-day · submission type · completion requirement ·
   prerequisite · qualities · html path and its public page URL · the Canvas
   assignment URL and ids, written back by the sync).

   **The registry is a web page, not a CSV (Sathya, 13 Aug 2026).** Both hold the same
   fields; the page is the one he can actually review — sprints group into expandable
   sections, so the semester reads at a glance and opens where he wants detail. A registry
   this wide is unreadable as a spreadsheet, which is why the earlier `assignments.csv`
   plan was dropped. `config/cst349-assignments.csv` and `config/cst395-assignments.csv`
   are spring artifacts of the retired pipeline, not inputs to this one.
2. This skill produces the page → one HTML file in the course folder, house style,
   accessibility rules observed → publishes via the repo to GitHub Pages.
3. Canvas shows the page in an iframe (the CST499 home-page pattern, with the
   context resolver for canvas-vs-web links).
4. A reconcile pass diffs the schedule against Canvas and applies only the differences —
   modules, order, prerequisites, completion requirements, due dates — with everything
   unpublished until Sathya's explicit go. Hand-edits in Canvas surface as drift to
   report, never silently overwritten.
5. Whenever the schedule or an assignment page changes, the two links — the Canvas
   assignment URL and the public HTML page URL — get copied into the dojo's Google
   Doc, so the dojo can point a student straight at the right assignment on either
   surface. (Open: which doc exactly, and whether the copy is scripted or a manual
   step in the update routine.)

Due days are rule-driven, not per-row: reflections fall on Friday in all three courses;
the comprehensive falls at the week-opening class (Mon for CST286, Wed for CST349/499),
so every comprehensive owns a weekend. CST286 points follow the mirror mechanic: every
assignment 100, each walkthrough worth the sum of its window.

## Checklist (checkable by looking)

- The five blocks are present, in order: Purpose · What you're building on · Task · Criteria · Reflection.
- The first sentence of Purpose is the payoff, not the topic.
- Every instruction sits at its point of action; known wrong turns are named.
- Criteria distinguish done from good, show two or more examples, and end in a
  student-runnable checklist; points and their route to the walkthrough are stated.
- Reflection questions are answerable only after doing the work.
- The qualities line and evidence linkage are in the record and absent from the page.
- The `schedule.html` row exists and matches the page: points, due day by the rhythm rule,
  submission type, completion requirement — and the builds-on block, the schedule's
  prerequisite, and the Canvas requirement all name the same prior work.
- The page renders in both contexts (web and Canvas iframe).
- The dojo Google Doc carries this assignment's current Canvas link and page link.

---

*Provenance — Human (Sathya): the Purpose–Task–Criteria adaptation with reflection
questions, the separate-skill decision and its place above writing-to-teach, the
registry-as-source-of-truth + iframe pipeline and the 13 Aug call that the registry is
`schedule.html` rather than a CSV, the due-day rhythm, the mirror mechanic, the
qualities-per-activity principle. Source template: Transparent Assignment Template ©
2013 Mary-Ann Winkelmes. Human + AI: the registry/page split, rule-driven due dates,
reconcile-with-drift-report. AI (Alan): this file's drafting, 12 Aug 2026, for
Sathya's edit.*
