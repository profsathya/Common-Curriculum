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

- **2026-08-13 (correction) — interview sign-up rows removed from the weekly block.** Sathya's
  catch on the first build: Session plan carries only the fixed session days (Mon + Wed here).
  The week-1 "Slot" row for the first interview is gone; interview sign-ups are not part of the
  weekly block. Same correction in cst349 (week 1) and cst499 (all interview/defense rows,
  including one that had mis-rendered as a second Wed row in week 1). — Alan

- **2026-08-14 — "How this course is different" added to `understand-the-course-design.html` (v2).**
  Sathya's spec, agreed in chat before the build. First section on the page: AI as a partner, used
  openly · process over output, with the pre-AI/AI-age contrast as the why (testing, challenging,
  exercising motivation / metacognition / mindset; metacognition carries a glossary bubble) · less
  weight on the grade, pointing at the home page's 🌱 Own your progress guidance as the ungraded
  surface · a closing line tying the section to the machinery the page already explains.
  Known and left for the vocabulary sweep: the same page's older checkpoint paragraph still says
  checkpoints are credited on submission. — Alan

- **2026-08-14 (later) — weekly-rhythm ruling applied: vocabulary sweep (design page v3) + hover
  explainers (home v3).** His ruling, same day: **"one reflection and one comprehensive assignment"
  is gone.** The weekly message to students is now **1–3 Own your progress guidance activities and
  at most one graded item per week**; the reflection floats — some weeks it sits in Own your
  progress guidance, some weeks it is the graded item. Design page: rhythm section rewritten to
  that message, key item / checkpoint terms removed, late rule now on graded items, grade section's
  "each week's assignment and reflection" → "each graded item", exam-prep line now names an Own your progress activity. Home page: CSS-only
  hover/tap/keyboard bubbles on every weekly block's 🌱 and 🎯 titles (what it is / how it counts).
  Remaining key-item/checkpoint strings are dead CSS selectors only. — Alan

- **2026-08-15 — three more "How this course is different" points added (design page v4).** Sathya's spec, verbatim
  intent: (1) transcripts — you will be asked, at times, to submit transcripts of your AI
  conversations to demonstrate process (attached to the process-over-output paragraph; grade
  paragraph now opens "Another way you will see this"); (2) Canvas organized for comprehensive
  learning, not transactions — "not easy to find what to do next" named as deliberate productive
  friction, with the self-questions (where am I, can I remember or look it up, what next, where are
  the details) developing independence + metacognition for the age of AI; (3) content practices
  reading and writing at every turn, supported by listening and talking with peers and instructors
  — all exercising critical thinking, communication, collaboration, named as what **Symbiotic
  Thinking** develops. Symbiotic Thinking gets a glossary bubble with the canonical definition
  (human-led practice of pursuing wisdom in partnership with other intelligences, human or
  artificial) — this is the term's FIRST student-facing surface — the framework item "Symbiotic Thinking, named and practiced" moves from Not yet toward Partial (introduced, not yet practiced by design). — Alan

- **2026-08-16 — hover-text layer applied to home.html (approved list, pass 1).** Restored 🌱/🎯 on all 16 weeks; Mondays retitled "Online check-in and Deep work session" with a two-sided bubble; Sprint Exam (3), mechanism (2), model, baseline, AI Dojo added. All
  bubbles in the why-first register (rule confirmed by Sathya today); 🌱/🎯 title bubbles restored
  with the inspirational Own-your-progress text. Two mechanics fixed page-wide: the weekly-block
  containers joined the position:relative anchor list (pre-existing bubbles in weekly rows were
  rendering at the page corner), and registry-linked titles keep their links — bubbles sit on
  adjacent plain text. class="gl" count now 66. New skill: `skills/hover-text/SKILL.md`
  carries the register, placement, markup, and after-rebuild survival check. — Alan

- **2026-08-18 — sprint modules marked Work in progress (parity with CST499).** All five sprint
  module heads now carry the amber `.wip` chip ("Work in progress", title: "This sprint is still
  being built — activities and dates may change."), inserted after the `.name` span and before
  `.tag`, exactly as on `cst499/home.html`. The `.module-head .wip` rule was added to the inline
  stylesheet next to `.module-head .tag`. Start Here is deliberately unmarked. — Alan

- **2026-08-20 — weeks collapse, closed by default.** Sathya's call. Every week block is now a
  `<details class="wk" id="wk-N">` with the one-line week head as its summary (+/− marker,
  keyboard-focusable); a sprint reads as one-line week heads until the student opens one. The
  existing `js/bookmarks.js` open-state store (`cc-open:` in localStorage) already tracks all
  `<details>` generically, so week-level memory came free — verified live: closed on first visit,
  student's opens restored on reload, `#wk-N` links open the week and its sprint. Strict parse
  clean. — Alan

## 2026-08-14 — Week 1 Monday session plan lands on the home page

The Monday Aug 24 row in Week 1's Session plan moved off "Plan TBD" and now carries the real
plan plus a link to the slides.

- Goal line: "Online — meet the class, and get set up."
- Body: Zoom session, opening with Human Bingo (short breakout rounds), then a short look at what
  the course is for, then setting up the CST286 AI Dojo, closing in small groups pulled a few at a
  time into the main room. Ends on "Be on webcam."
- Slides link: the Google Slides deck *CST 286 - Week 1 - Mon*
  (1ibJ1Cri8kI7eC9LWgCYFqTe6IfEBG3hG4O_o3u8lEBo), linked as `/preview` so students get the clean
  viewer rather than the editor chrome. Sharing verified as anyone-with-link reader, so no CSUMB
  sign-in is required — unlike the syllabus `/preview` embeds, which are domain-restricted.
  Opens in a new tab, per the 13 Aug weekly-block rule.

This is the first `wday-body` on any of the three home pages to carry a link, so it sets the
pattern: prose first, the material named at the end.

The Wednesday Aug 26 row is unchanged ("Course orientation."), and the deeper course-design
conversation stays there, in person.

## 2026-08-23 — Trailheads: the physics exploration map lands as a course page

`trailheads.html` joins the CST286 pages, linked from **Week 2's Own your progress** block. It is the
student-facing form of the exploration map worked out in `fall-2026-courses/` this week, and it is built
as one page with three levels behind a hash router:

- `#basecamp` — **pick a trailhead.** Ten trail cards, each opening from an interest rather than a topic:
  The Slab of Glass · Game Feel · Signal & Sound · The Moving Body · From Sand to CPU · Rockets & Orbits ·
  Cameras & Light · Energy & What It Costs · The Weird Stuff · How Physics Knows.
- `#trail-<id>` — **follow the trail.** Each carries the "At the end of this trail" promise pair
  (answer *how & why* / predict *with numbers* — Sathya's framing, 23 Aug), an SVG map whose fork is a
  question the student answers, ⚠ pitfall and ✦ vista markers, the same waypoints written out in words,
  and its own **Trail sources** block.
- `#route-phone-motion` — **explore a route to its vista.** One route built out as the template:
  you-are-here strip, elevation profile, predict-first box, the route three ways (measure / simulate /
  build), pitfall, vista challenge, a Socratic Dojo prompt, and route-level sources. The other three
  phone routes are stubs in the same shape.

Design decisions worth keeping:

- **Colour encodes trail identity, not hierarchy** — ten muted hues, with `--blaze` reserved for forks,
  `--vista` for payoffs and `--warn` for pitfalls, so a marker means the same thing on every map.
- **Map labels carry a background-coloured halo** (`paint-order="stroke"`) so route names stay legible
  where dashed trail lines pass behind them.
- **Sources are per trail and per route, not one bibliography at the end.** That is deliberate: this page
  is captured into the Dojo context document, and the coach needs to know which sources belong to where
  the student actually is.
- House chrome (crumb, page nav, instructor, footer) wraps a deliberately different interior — the map is
  a place, not another course page — and the page carries no `data-canvas-href`, so inside the Canvas
  embed it stays a relative link and keeps working.

Everything is static markup; no generator. Trails 04–10 have finished maps and sources, and their route
pages open as each route is surveyed. — Alan


## week1-mon-recording.html — 25 August 2026

The Monday 24 Aug Zoom session, indexed rather than edited. Modelled on
`career-intelligence/sessions/week-1-recording.html`, but inverted the way Sathya asked for it: one
player at the top, the section list underneath, and clicking a section moves that player. The CI pages
carried per-clip takeaway bullets; this one carries a single line per section instead, following the
direction his last several rounds of edits have pulled (fewer sections, fewer words).

Ten sections out of a 98-minute recording, in two groups — *Why this course is built this way*
(2:02 / 10:15 / 51:29 / 58:08) and *Getting set up* (59:03 / 61:07 / 62:00 / 64:05 / 65:05 / 69:05).
Two are starred: **The two layers** (51:29) and **Your two things to do** (65:05). Section titles and
lines were written from the auto-caption transcript, saved at
`cowork/fall-2026-courses/cst286-transcript-2026-08-24.txt` with the full edit map beside it.

**The mechanism, and the thing that is easy to get wrong.** Clicking a section rewrites the iframe
`src` to the same `Embed.aspx` URL plus `&autoplay=true&start=<seconds>`. This works — verified end to
end in Chrome, the player lands on 51:29 — but **`&start=` is not applied until playback begins**. So
if you load the embed with `&start=` and inspect it before pressing play, the seekbar reads 0:00 and
the caption shows the first cue, and it looks exactly like the parameter is being ignored. It is not.
Check after play, not before. (Costly detour on the way here: this was first mis-diagnosed as
unsupported, and the page briefly shipped with the sections as links opening Panopto in a new tab.)

Autoplay does not actually fire — Chrome leaves the Panopto splash up even with `allow="autoplay"` on
the iframe and a real click driving the `src` change. That is why a click also reveals a line under the
player naming the section and saying that if the video does not start on its own, pressing play will
begin it there. The clicked row keeps a highlight so it stays obvious which section is loaded.

Linked from `home.html` week 1, Mon 24 Aug row, next to Slides, opening in a new tab. — Alan

## 2026-08-24 — Late graded items: two own-your-progress activities can stand in

Sathya's call, added to "How the grade works": if a student was late submitting graded items, they can swap
in up to **two own-your-progress activities** to stand in for two of them.

This required one consistency fix on the same page. The "How this course is different" section described
own-your-progress guidance as "activities that do not affect your grade at all", which the new rule
contradicts. Changed to "activities that are not graded", and the new note names itself as the one
exception — the single place where having done the optional work changes the grade.

**Open, and deliberately not written into the page:** which two graded items can be swapped (the late ones,
or any two), whether the swapped-in activities carry the graded item's points or only remove the late
penalty, and whether the swap has to be requested. The page states the flexibility without inventing the
mechanics.


## explore-physics-loop.html — 28 August 2026

The Week 2 own-your-progress activity: one full run of the course's loop (choose → run a model →
predict → change → watch → explain → AI feedback → final reflection → copy summary into Canvas),
built the day trinket.io announced it closes on 31 August. That killed the planned trinket embeds
three days before launch, so the sims run in **our own Web VPython runner** — `glowscript/sim.html`
wraps the open-source GlowScript 3.2 libraries (MIT, github.com/vpython/glowscript) with a plain
textarea editor, Run, and Reset-to-original; each iframe loads `sims/<name>.py` by relative URL.
Nothing here depends on a third-party service. One coding gotcha is recorded as a comment in
sim.html: the compiled program must define `__main__` in the eval scope, so no `use strict`.

Sathya's direction, his words kept: students should be **trying to do something in a little
world**, not watching a model — inspired, "not a math homework." So every topic is a mission with
a visible win: **bend a free kick around a wall of defenders** (a gray ghost flies the same kick
with no spin — the gap between the trails IS the Magnus force), **clear a 135 m ridge in a plane**
(angle 6 misses by ten centimetres; the stall traps you once you fall), and **keep a shaken
phone's arrow within 3°** (accelerometer honest-but-jittery, gyro smooth-but-drifting, and the
0.98 blend that real phones run). Banners score each run — GOAL! / CRASHED 10 m below the top /
ARROW LOST, up to 24.8° — and the graphs stay the referee.

Every number in the stage cards and the hidden coach notes (the AI feedback button's ground
truth) is verified against a plain-Python re-run of each model; the throttling trick (N physics
steps per drawn frame) is because browsers cap rate() at the display rate. The two week-2 OYP
rows this replaces ("What makes me tick", "How this course can make me better at learning on my
own") are swapped out of home.html and assignments.html; registry row is `286-w02-oyp1`, due
Fri 4 Sep. Trailheads still links trinket.io in one place — swap before Monday. — Alan

**Addendum, same day — the run log (from TA feedback).** The TA asked for an explanation of the
physics after every run and a comparison with the previous attempt. Built the comparison and the
measurements; deliberately not the explanation — the explaining is the student's move (the
reflection box, Check yourself, and the AI button carry it on demand). Each run now ends with a
RESULT line in the scene caption stating what happened as measurements ("GOAL — crossed 1.6 m
inside the post, 0.37 m off the ground"; "biggest sideways force 2.27 N against a 4.2 N weight"),
and the runner keeps a run log across runs: "Run 2 · you changed spin 0→6, aim 0→12 · GOAL…"
over "Run 1 · original settings · BLOCKED…". The changed-constants diff comes from comparing the
editor against the original source; the result travels through `scene.caption` because GlowScript's
print() has no home in the stripped-down runner. — Alan

**Addendum 2, same day — the prediction nudge (his idea).** Clicking Run while the active stage's
prediction box is empty now shows "Predicted first? Running in 3…2…1" beside the Run button, with
one escape — "I'll write it first" — which cancels the run and scrolls the course page to the
prediction box; doing nothing lets the run happen, and clicking Run again runs immediately. It
never fires on the automatic first run, after Reset, once a prediction exists, or when the runner
is opened standalone. The runner asks the course page through two same-origin hooks
(`exploreLoopPrediction` / `exploreLoopFocusPrediction`), so the nudge knows which stage the
student is on without the sims knowing anything about the page. — Alan

**Addendum 3, same day — the page becomes an OYP assignment page.** Executed the reviewed
revision prompt (`cowork/alan/explore-loop-oyp-revision-prompt-2026-08-28.md`) against the
writing-assignments five-block anatomy: due line + the standard Own-your-progress bubble in the
pagehead; Purpose gains "What this practices" (the loop, apply-and-analyze, the Sprint 1
practice-run identity — Sathya's framing) and "What you'll come away knowing"; a builds-on block
(Trailheads · one-line-of-code assumption · Dojo optional); a scannable "What you'll do" task
list with the deliverable stated separately; "What done and good look like" with done-vs-good,
two composed example explanations plainly labeled as ours (never student-voiced), a five-line
student-runnable checklist, and the how-it-counts line; the copy section reshaped as Submit;
the close now bridges to Sprint 1 ("notice which topic you would have picked if none of these
three had been on the menu") and the final reflection pins question 4 as the Sprint 1 seed.
Registry purpose line updated to match. Mechanics retested after the edit — gating, AI button,
copy, reload all pass; Draft v3. Canvas step still parked for Sathya's go. — Alan
