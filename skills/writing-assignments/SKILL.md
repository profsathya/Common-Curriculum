---
name: writing-assignments
description: Use when writing or revising any assignment or activity page students will act on, whatever the course calls that kind of work. Triggers when a design conversation has decided an assignment and it needs its student-facing page, and when an existing assignment page is revised. Covers the Purpose–Task–Criteria–Reflection shape (adapted from the Transparent Assignment Template) with its builds-on/prerequisite block, the internal qualities line, and the pipeline the page lands in (assignments.html → HTML page → Canvas iframe → reconcile). Prose register belongs to writing-to-teach, goal lines to writing-learning-goals, the final trim to reviewing-course-text — this skill sits a level above those three and calls them.
---

_Derived from the Fall 2026 four-layer lock record (`cowork/fall-2026-courses/CONTEXT.md`), which holds the decisions this skill assumes. This file governs how to write the thing; where it states a decision the record does not, that is drift to fix here. Last checked against the record: 13 August 2026 (assignment kinds and point values re-checked that day)._

_Status: v4 (29 August 2026) — "name the known wrong turns" replaced by preventing likely errors with a positive test, a structured field or a paired example; it had been turning instructions into warnings and coach notes into error lists. v3 (15 August 2026) — the file the pipeline centers on is `assignments.html` (renamed from
`schedule.html` 14 Aug; call it plain assignments.html, not "the registry"); pipeline hardened from the
first live Canvas build (CST499 week 1, 15 Aug): shell inventory before first write, ids written back in
the same pass, links live in one place, the iframe/description pattern, the new-tab rule, and the
publish-on-creation policy. v2 (13 August 2026) — the assignment-kind labels and the per-kind point values were removed and handed back to each course's design record, after three renamings in eight days. v1 (12 August 2026). Born from the assignment-pipeline conversation of 11–12
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

This block is the student-language mirror of the machinery: the prerequisite field in
`assignments.html` and the Canvas module requirement name the same prior work the page names —
one link, three views. It is also what makes the course feel cumulative on every page:
each assignment visibly extends an evolving piece of work rather than starting fresh.

## Task — what to do

Steps in the order the student should take them, each instruction at its point of
action. **Prevent likely errors with a positive test, a structured field, or a paired
example** — "quote the phrase and give the count" prevents paraphrasing without warning
about it; two columns prevent a one-sided answer without naming the mistake. State a common
mistake outright only when it is consequential, likely, and cannot be prevented more
directly. (Revised 2026-08-29: the earlier "name the known wrong turns" turned instructions
into warnings and produced coach notes written as errors rather than as criteria.) If a step needs a tool, link it in the step. The reader gets one
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
you about how you work. These feed the course's own reflection rhythm. After grades come back, the
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
   `assignments.html` (mechanics only: id · week · module · title · kind · points ·
   due-day · submission type · completion requirement · prerequisite · qualities ·
   html path and its public page URL · the Canvas assignment URL, id and published
   state — written back **in the same pass that creates them in Canvas**, so the file
   never lags the shell). Canvas URLs are hand-maintained in exactly ONE place — this
   file; home pages and the course Google Docs derive from it or are diffed against
   it. The 15 Aug dead-link incident was a home page carrying its own copies of
   Canvas URLs that outlived the objects they pointed at. When Canvas objects are
   deleted or recreated, sweep the link consumers the same day — module-item URLs die
   with their modules.

   **The kinds themselves are course design, not this skill (Sathya, 13 Aug 2026).**
   `kind` is a field this skill fills in from whatever the course has decided to call
   its categories, and what each is worth. Naming them here means every renaming
   downstream — and there have been three — has to come back and edit this file.
   Read the course's own design record for the current set.

   **assignments.html is a web page, not a CSV (Sathya, 13 Aug 2026; named
   `assignments.html` 14 Aug — it holds assignments only, no session dates).** Both hold
   the same fields; the page is the one he can actually review — sprints group into
   expandable sections, so the semester reads at a glance and opens where he wants
   detail. A record this wide is unreadable as a spreadsheet, which is why the earlier
   `assignments.csv` plan was dropped. `config/cst349-assignments.csv` and `config/cst395-assignments.csv`
   are spring artifacts of the retired pipeline, not inputs to this one.
2. This skill produces the page → one HTML file in the course folder, house style,
   accessibility rules observed → publishes via the repo to GitHub Pages.
3. **The Canvas assignment name carries its kind as a prefix — `OYP: `, `GI: ` or
   `Exam: `** (Sathya, 23 Aug 2026; `Exam: ` settled 29 Aug 2026), so a student scanning
   the assignments list, the gradebook or a to-do notification sees at a glance whether
   an item is graded. **Exams take their own prefix rather than riding under `GI: `**
   because they carry different points or a different grade category — a student
   should not have to open the item to find that out. The prefix is a
   Canvas-side display convention only: `assignments.html` keeps the plain title and
   shows the kind as its own column, and the course pages link by id, so nothing
   breaks. Apply it whenever an item is created in Canvas or renamed there.
4. Canvas shows the page in an iframe. The assignment description is an iframe of the
   public page (width 100%, height ~1100, border 0, a title attribute) plus one
   fallback line linking the page in a new tab (settled 15 Aug 2026, both CST499
   week-1 assignments). On course pages, activity links open a NEW TAB in both
   contexts — the context resolver sets `_blank`, never `_top` (the `_top` still in the
   286/349 home-page scripts is the deviation to fix when their links go live).
5. A reconcile pass diffs `assignments.html` against Canvas and applies only the
   differences — modules, order, prerequisites, completion requirements, due dates.
   **Before the FIRST write into any Canvas shell, inventory what is already there**
   (semester imports, old drafts) and get a ruling — the CST499 shell held ~20 spring
   items and four stale drafts on 15 Aug. Hand-edits in Canvas surface as drift to
   report, never silently overwritten. **Publish policy (Sathya, 15 Aug 2026):
   publish-on-creation while the course shell is unpublished; once the course is live,
   new items stay unpublished until his explicit go.** After any Canvas write, read the
   result back through the API before reporting it done.
6. Whenever `assignments.html` or an assignment page changes, the two links — the
   Canvas assignment URL and the public HTML page URL — reach each course's Google Doc
   through the Common-Curriculum Apps Script sync (`apps-script/CourseDocSync.gs`,
   driven by GitHub Actions and `config/course-docs.json`), so the AI Dojo can point a
   student straight at the right assignment on either surface (Sathya, 15 Aug 2026 —
   keep this step; the doc is downstream of the repo, and edits made in a synced tab
   are lost on the next sync).

Due days are rule-driven, not per-row: the course's design record sets the rhythm —
which kind of work falls on which day, and why — and this skill applies it rather than
restating it. The same goes for what each kind is worth. Both changed on 13 Aug 2026;
neither is written down here again.

## Checklist (checkable by looking)

- The five blocks are present, in order: Purpose · What you're building on · Task · Criteria · Reflection.
- The first sentence of Purpose is the payoff, not the topic.
- Every instruction sits at its point of action; likely errors are prevented by a positive
  test, a structured field, or a paired example rather than by a warning.
- Criteria distinguish done from good, show two or more examples, and end in a
  student-runnable checklist; points and their route to the walkthrough are stated.
- Reflection questions are answerable only after doing the work.
- The qualities line and evidence linkage are in the record and absent from the page.
- The `assignments.html` row exists and matches the page: kind and points as the course
  design defines them, due day by the rhythm rule, submission type, completion
  requirement — and the builds-on block, the row's prerequisite, and the Canvas
  requirement all name the same prior work. If the assignment exists in Canvas, the
  row carries its id, URL and published state.
- The page renders in both contexts (web and Canvas iframe).
- The course Google Doc carries this assignment's current Canvas link and page link
  (via the Apps Script sync).

---

*Provenance — Human (Sathya): the Purpose–Task–Criteria adaptation with reflection
questions, the separate-skill decision and its place above writing-to-teach, the
registry-as-source-of-truth + iframe pipeline and the 13 Aug call that the registry is
`schedule.html` rather than a CSV, the due-day rhythm, the mirror mechanic, the
qualities-per-activity principle. Source template: Transparent Assignment Template ©
2013 Mary-Ann Winkelmes. Human + AI: the registry/page split, rule-driven due dates,
reconcile-with-drift-report. AI (Alan): this file's drafting, 12 Aug 2026, for
Sathya's edit.*
