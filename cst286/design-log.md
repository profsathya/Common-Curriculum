# CST 286 — design log against the shared framework

Tracks this course against the three-course framework in
`common/fall-2026-course-comparison.html` (captured 10 Aug 2026).
Statuses are Alan's read of the design record — the July locks plus the
Aug 4–5 build record — written 10 Aug 2026 for Sathya to correct.

**Done** = designed and in front of students (or sitting at Sathya's review gate) ·
**Partial** = designed with build or decisions still owed, or built without the design piece ·
**Not yet** = neither.

## The shared start

- **PARTIAL — Conversation as the opening move (teacher · peers · AI, in combinations).**
  Evidence: conversations are locked as the assessment spine — walkthrough conversations that sample a student's past evidence, scored per window (July).
  Missing: those are mid-course check-ins. The *opening* arc — the course starting in conversation, with peers and AI in the mix — has no design yet, and session design (Mon online / Wed in person) was deliberately deferred to build time.

- **NOT YET — Symbiotic Thinking, named and practiced.**
  Evidence: the definition exists — the human-led practice of pursuing wisdom in partnership with other intelligences, human or artificial.
  Missing: no course surface introduces it, and nothing designed grows it out of the conversations.

## The self-directed learning layer (on a physics topic)

- **PARTIAL — Choose something you care about, and know why.**
  Evidence: locked in July — care comes first and world-needs widens it second; students land on 1–3 pursuits; guardrail — activities must never steer students toward topics that tie to CS or career.
  Missing: the Sprint 0 build (the finding activity, evidence plan, baseline).

- **PARTIAL — Decide what "learned it" would look like.**
  Evidence: locked — three standards (mechanism · payoff · process), judged on how far the student moved from their own starting point.
  Missing: the student-facing translation and the actual assignments.

- **PARTIAL — Gather and demonstrate evidence.**
  Evidence: students define and collect their own evidence inside a scaffold; the 50/50 mirror mechanic locked 5 Aug (every assignment 100 pts; each walkthrough is worth the sum of its window's assignments).
  Missing: the build; the evidence-management tool (spec owed by Alan, stub first); open decisions — sticky losses vs 499's no-retake rule (question put 5 Aug, unanswered), what a dig installment is, the baseline instrument (waits on the measurement-framework call).

- **PARTIAL — Carry the learning somewhere new (transfer).**
  Evidence: locked — transfer is designed rather than hoped for; Sprint 3 reruns the dig on a second interest.
  Missing: the sprint build.

## The two questions

- **NOT YET.** Decided 10 Aug: plant them early — day one is too soon — so students start living with *did you tackle a problem you couldn't have on your own, with AI's help?* and *how is it better because you were involved?*, and learn their value as professionals rests on demonstrating both.
  Missing: when exactly, inside what activity, and the materials.

## The nurture-track thread (six qualities)

- **NOT YET — Every activity aligned to a named subset of the six qualities.**
  Evidence: principle decided 10–11 Aug — the qualities are woven throughout the course rather than treated as a start/end measure; each activity carries a subset chosen by its focus; Map Your Curiosity is out as a course activity; the opening Know-Yourself activity carries self-knowledge and probably self-regulation.
  Missing: the activity-by-activity mapping for this course.

- **NOT YET — Movement on those qualities watched per activity.**
  Evidence: decided 11 Aug — conversations with AI Sensei run throughout the course (the two-conversation week 1–2 / week 6–8 design is superseded; note on the 8/10 plan file).
  Missing: how each activity's conversations or artifacts record movement, and which parts of the plan file survive per conversation.

## The scaffolded introduction sequence

- **NOT YET.** The order is sketched — engage and orient → conversation + Symbiotic Thinking → the learning cycle → then the two questions — and flagged 10 Aug as needing careful thinking. Nothing is designed.

## Where the build lives today

The design record is `fall-2026-courses/cst286-plan-working.html` (working plan, 8 open decisions). The build opened 5 Aug with the mirror-mechanic lock. This folder still holds one page from before the design; the Canvas shell sits in the Canvas Plus sub-account with the theme and widgets, untouched. Working rule (Sathya, 5 Aug): 286-specific decisions stand — ask before importing a 499 meta-idea. Classes start 24 Aug.

## Log

- 2026-08-10 — file created. Framework: Sathya. Status calls and wording: Alan, for Sathya's review.
- 2026-08-11 — nurture-track section added (throughout principle; both items not yet). — Alan
- 2026-08-12 — DESIGN DOC v1: `CST286 Course Design v1 - 20260812` created in Drive
  (https://docs.google.com/document/d/1MSolKdPSz-yVZXPDAUeGCJ8SQxFcjir6-FrYn00qn4A), mirroring the
  CST349 design doc's structure at Sathya's direction; markdown source in
  `cowork/fall-2026-courses/cst286-course-design-v1.md`. Carries every 286 lock from July +
  the 8/05–8/06 build session (mirror mechanic, 4 windows one per sprint, combine-never-waive,
  process-step/milestone, D/F-only end retake, 2/4/4/4/2 arc, finding starts S1, 10%/day) and
  marks Alan's proposals (hypotheses, week placement, class time, nurture map) as unreviewed.
  Status calls in the sections above are unchanged pending Sathya's pass on the doc. — Alan
- 2026-08-12 — CORRECTION to "Where the build lives today": the 8/06 home page rebuild
  ("Get Truly Good at Something You Care About") was built and delivered into a chat while the
  desktop bridge was down, and a later checkpoint recorded it as committed. It was not.
  `home.html` still has one commit (16148bc, 12 Jun) and is entirely the superseded physics-up
  page — which `config/course-docs.json` also feeds into the CST286 course-context doc. — Alan
- 2026-08-12 — FALL HOME PAGE BUILT AND COMMITTED. `cst286/home.html` replaced (the June
  physics-up page lives in git history). Built from `cowork/fall-2026-courses/cst286-course-design-v1.md`
  against the CST349 fall shell — same stylesheet, same accordion behaviour, same tooltip
  scaffolding. Generator kept at `cowork/fall-2026-courses/mk_cst286_home.py`; edit that, not the
  HTML. Vocabulary now checkpoint / key item (Sathya 8/12, matching 349 and 499); pursuit · deep
  dive · interview · Sprint Exam student-facing. No CTI logo, per the CONTEXT decision. Sprint pages
  and item links are deliberately unbuilt and nothing links to them, so there are no dead links.
  Audits clean: balanced markup, 0 X-not-Y constructions, 0 internal shorthand ("dig", "milestone",
  "process step"), render-verified at 1100px. STATUS: at Sathya's direct-edit gate. — Alan
- 2026-08-12 — `understand-the-course-design.html` CREATED for 286, mirroring the 349 page (crumb,
  pagehead, On-this-page list, h2.sec sections). Six sections: weekly rhythm (one reflection + one
  assignment, key item vs checkpoint, the two challenge-and-evidence questions, 10%/day) · how the
  grade works (50/50, nothing submitted and forgotten, no mid-course retakes + end catch-up) · **what
  counts as going deeper** (the three standards in student language, the qualitative-is-enough /
  quantitative-encouraged-and-defended bar, delta from your own starting line — this section is
  286-specific and has no 349 equivalent) · interview check-ins (one round per sprint, everyone seen
  in wks 1–2, the scheduling rider explained as why the weekly rhythm matters, the bandwidth rule) ·
  Sprint Exams (wks 6/10/14, Monday prep checkpoint) · attendance. Home Start Here module rewritten
  to link to it (2 items, the 499/349 pattern) instead of carrying the mechanics inline.
  **Attendance is deliberately incomplete**: Mondays and the required Wednesdays are stated, and the
  rule for the remaining Wednesdays is marked as still being set — Sathya has not decided it and it
  was not invented. Flagged in the page's draft banner.
- 2026-08-12 — GENERATOR RETIRED. `mk_cst286_home.py` moved to `cowork/fall-2026-courses/_to_delete/`.
  It was a one-time build tool, and telling Sathya to "edit the generator, not the HTML" was wrong:
  he edits these pages directly in Pinegrow (see the `_pgbackup/` folders in cst349 and cst499), so a
  live generator would silently overwrite his edits on the next run. **The HTML is the source of
  truth for both 286 pages from here.** — Alan
- 2026-08-12 — HEADER TRIMMED, all three fall home pages, at Sathya's ask: the top block was
  comprehensively informative where it needed to be briefly inspiring. Test applied from
  `skills/writing-to-teach` — a reader gives you one sentence, maybe three to five lines, before
  deciding whether to continue; the backbone survives a skim; detail waits behind clicks. **Rule
  used: anything the arc cards or `understand-the-course-design.html` already say came out of the
  header.** Cuts: the "here is how the semester goes" machinery paragraph (the arc cards say it
  better, with tooltips), and the "&hellip;and that is why those conversations are half your grade"
  tail (it is on the course-design page, and it ends a first visit on grading rather than on what
  the student gets). Kept and tightened: the everyday hook, and the two things you leave with —
  the payoff beyond the grade. Lead word counts: **CST286 361 → 193, CST349 282 → 191, CST499
  183 → 160.** Sathya's own gate-round sentences in the 349 and 499 headers were preserved; those
  two edits are subtractive only. Markup balanced, render-verified. — Alan
- 2026-08-12 — HEADER RESTRUCTURED (286) + BIG PICTURE OPENS BY DEFAULT (all three). Sathya's calls:
  questions rather than declarative titles as section hooks, his opener verbatim ("Have you wondered
  how something works the way it does?"); and the big picture box stays open for the start of the
  semester, to be collapsed after Sprint 0. **The keep-list line in the accordion script now carries
  'big-picture' with a dated comment naming the one-line change to close it** — cst286, cst349 and
  cst499 (499's keep-list uses 'start-here' rather than 'how-this-works'; matched to its own ids).
  286 header now: h1 + sub, then two questions with one short paragraph each — "Have you wondered how
  something works the way it does?" (the everyday hook) and "Why physics?" (the objection actually
  sitting in the room, named out loud). New `.course-header .q` rule added for the hooks. The
  two-things-you-leave-with list and the explain-out-loud line MOVED DOWN into the Beyond-the-grade
  block, which now reads label → "What you leave with" → the two items → explain-out-loud → the
  keeps-running paragraph → when-we-meet. This also resolves the near-duplication between that list
  and the old "Depth is the practice" paragraph, which is gone. Header 193 → 171 words with two
  paragraphs lifted into the box. Markup balanced, render-verified. 349 and 499 headers NOT
  restructured — awaiting his call. — Alan


- 2026-08-13 — ASSIGNMENT STRUCTURE AND VOCABULARY CHANGED (Sathya). The pair *key item* /
  *checkpoint*, locked 8/12, is retired. Three kinds now, shared with CST349 and CST499:
  **graded assignment** (the work itself, 100 points), **Sprint Exam** (200 points), and
  **Own your progress guidance** (1–3 a week, carrying due dates and point values so a student
  can see whether they are on track, but sitting in a grade group weighted **0%**). CST286 runs
  **9 graded assignments (900) + 3 Sprint Exams (600) = 1500 submitted**, matched by **1500** in
  check-ins — **3000 total**. The rule that every assignment is worth 100 points no longer holds;
  Sprint Exams doubled. Check-ins are now described as **2–5 across the semester** rather than one
  round per sprint — the points still divide by sprint, but a sitting can cover more than one and
  each sprint's points score at whichever sitting covers them (the 8/05 combine-never-waive lock,
  finally written down where students read it). Exams are **hand-written, closed book, no notes or
  cheat sheet, questions published ahead of time**. Captured in
  `cowork/fall-2026-courses/CST286-Syllabus-Fall-2026.md` and in `fall-2026-vision.html`.
  **NOT yet applied to `home.html` or `understand-the-course-design.html`** — those carry the
  week-by-week item lists, which cannot be re-cut until Sathya says which nine items survive and
  whether the weekly reflection (locked 8/12) continues as Own your progress guidance now that it
  carries no points. Those two pages are stale as of today; read the syllabus, not them. — Alan

- **2026-08-13 (later) — home.html restructured into the weekly block (v2).** Sathya's design,
  agreed after three mock rounds in the Alan session: every week now carries three visually
  distinct sections — **🗓️ Session plan** (Mon online check-in + Wed in person; a one-sentence
  goal per day, a "+" expanding in place to details and links) · **🌱 Own your progress guidance**
  (the old checkpoints, not graded) · **🎯 Graded item** ("None." on most weeks, or the item, or
  the Sprint Exam at 200). Violet, not a warning color, marks graded work — his call after amber
  and orange both read as danger. Old key items carried over as graded at 100; **eight of the
  locked nine are placed, the ninth is TBD**; Wednesday plans without settled content say Plan
  TBD rather than inventing. The page partially un-stales today's earlier note: the weekly block
  reflects the 8/13 point structure, but which nine items survive and the weekly-reflection
  ruling are still Sathya's open calls. Vision page CF-1 and `skills/writing-to-teach` carry the
  pattern. — Alan
