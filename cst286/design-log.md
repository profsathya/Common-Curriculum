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

