---
name: writing-assignments
description: Use when writing or revising any assignment or activity page students will act on — the weekly reflection, the comprehensive, a sprint activity, a practice-dojo companion page. Triggers when a design conversation has decided an assignment and it needs its student-facing page, and when an existing assignment page is revised. Covers the Purpose–Task–Criteria–Reflection shape (adapted from the Transparent Assignment Template), the internal qualities line, and the pipeline the page lands in (CSV registry → HTML page → Canvas iframe → reconcile). Prose register belongs to writing-to-teach, goal lines to writing-learning-goals, the final trim to reviewing-course-text — this skill sits a level above those three and calls them.
---

_Status: v1 (12 August 2026). Born from the assignment-pipeline conversation of 11–12
August (Sathya + Alan); the shape adapts the Transparent Assignment Template © 2013
Mary-Ann Winkelmes (TILT Higher Ed), whose national study showed that making purpose,
task, and criteria explicit measurably improves learning. First test: the first fall
2026 assignment built through it._

# Writing assignments

An assignment page tells a student four things, in this order: why this work is worth
their time, what exactly to do, how they'll know they did it well, and what to take
from it afterward. Every assignment and activity page in the fall courses carries these
four blocks. The design conversation decides the assignment; this skill makes the page
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
   `assignments.csv` (mechanics only: id · week · module · title · kind · key-item or
   checkpoint · points · due-day · submission type · completion requirement ·
   prerequisite · qualities · html path · canvas ids, written back by the sync).
2. This skill produces the page → one HTML file in the course folder, house style,
   accessibility rules observed → publishes via the repo to GitHub Pages.
3. Canvas shows the page in an iframe (the CST499 home-page pattern, with the
   context resolver for canvas-vs-web links).
4. A reconcile pass diffs the CSV against Canvas and applies only the differences —
   modules, order, prerequisites, completion requirements, due dates — with everything
   unpublished until Sathya's explicit go. Hand-edits in Canvas surface as drift to
   report, never silently overwritten.

Due days are rule-driven, not per-row: reflections fall on Friday in all three courses;
the comprehensive falls at the week-opening class (Mon for CST286, Wed for CST349/499),
so every comprehensive owns a weekend. CST286 points follow the mirror mechanic: every
assignment 100, each walkthrough worth the sum of its window.

## Checklist (checkable by looking)

- The four blocks are present, in order: Purpose · Task · Criteria · Reflection.
- The first sentence of Purpose is the payoff, not the topic.
- Every instruction sits at its point of action; known wrong turns are named.
- Criteria distinguish done from good, show two or more examples, and end in a
  student-runnable checklist; points and their route to the walkthrough are stated.
- Reflection questions are answerable only after doing the work.
- The qualities line and evidence linkage are in the record and absent from the page.
- The CSV row exists and matches the page: points, due day by the rhythm rule,
  submission type, completion requirement.
- The page renders in both contexts (web and Canvas iframe).

---

*Provenance — Human (Sathya): the Purpose–Task–Criteria adaptation with reflection
questions, the separate-skill decision and its place above writing-to-teach, the CSV
source-of-truth + iframe pipeline, the due-day rhythm, the mirror mechanic, the
qualities-per-activity principle. Source template: Transparent Assignment Template ©
2013 Mary-Ann Winkelmes. Human + AI: the registry/page split, rule-driven due dates,
reconcile-with-drift-report. AI (Alan): this file's drafting, 12 Aug 2026, for
Sathya's edit.*
