# CST286 Sprint 3 · Response to the ChatGPT Pro review

Ready for Sathya’s check · 1 November 2026

The revised pages preserve the investigation sequence, open-ended Dojo coaching, distinct A/B/C paths, prediction-before-explanation records, and the right to reach a supported or unresolved conclusion. Canvas publication remains on hold. Files are saved for the established automatic GitHub and course-context document workflows; no manual publishing, commit or push was performed.

## Implemented

- **Choosing a path:** the transition and goal explain the topic, support, tools, evidence and self-organization involved. A first goal condition can be provisional. Paths retain independent drafts; switching does not populate one path with another’s answers. No claim of equal workload is made.
- **Working through the investigation:** relationship navigation distinguishes exploration from synthesis. Scenarios have four stages and collapsible scenario sections, keeping the existing response support available. Collapsed responses remain in the export.
- **Scientific quality:** questions, checklists, feedback instructions and the peer-review copies now emphasize consistency of words and formula, correct quantities and units, justified assumptions and conclusions bounded by evidence. Assumptions may be a short list. Checks distinguish calculation, implementation and independent observation; measurements ask what size difference could be detected.
- **LED model boundary:** the 2 V value is an operating approximation, not a universal threshold. A negative computed current indicates inconsistency of that assumed model; the actual current requires device data or measurement. Sources: [Vishay TLDR5400 data](https://www.vishay.com/docs/83003/tldr5400.pdf) and [TI LED-driver considerations](https://www.ti.com/lit/an/slyt084/slyt084.pdf).
- **Feedback before the exam:** the existing meeting now includes relationship, assumptions and one scenario. A response field records a revision, a reasoned decision to retain an answer, or an unresolved question and proposed check. If the meeting falls after the November 30 submission, the plan is recorded there and the response is preserved in the December 7 reflection.
- **Peer assessment:** December 9 remains the due date. Each student has one incoming grader and reviews one different classmate; neither may be a Sprint 1 or Sprint 2 exam partner. A practice sample asks for two scores and evidence before revealing an interpretation. The first attempt and reflection are saved and exported. Scores remain recommendations subject to instructor moderation.
- **Reflection:** the question now explicitly asks for the specifics that are assessed and connects a learning decision, evidence of its effect and a future decision. Complete and partial recall both invite reflection on what helped.
- **Exam preparation:** a new [blueprint](../cst286/sprint-3-exam.html) covers explaining and using a relationship, an unfamiliar variation, and interpreting investigation evidence. Date, 200 points and handwritten closed-book format remain. Exact questions and point allocation are still for review.
- **Administrative clarity:** the overview treats finding instructions as something the course should make easy. It names the November 18 Zoom exception and December 7/9 pair of assignments. The registry now counts 13 graded assignments (1,300 points), three exams (600 points) and ten OYP activities. It no longer presents the incorrect 3,000-point arithmetic as the course grade calculation.
- **Draft reliability:** core forms, book evidence and peer review detect a newer saved draft before replacing it; preserve recoverable conflicting versions; and avoid saving untouched stale tabs on exit. This is optimistic browser-local conflict detection, not a cloud backup or a transactional cross-device service. Save failures are visible near the top. Incomplete exports are marked as drafts.
- **Status and AI handoff:** saved reflection text no longer marks a home-page item submitted. The manual submission mark can be cleared. Failed note saves report failure. Prompt copying uses displayed text, including the selected path. Hidden path instructions are filtered from per-box feedback. HTML and Markdown use the same R3 Dojo codes. A context mismatch permits continued reading and planning while the link is repaired.

## Pending policy decision

The existing registry says graded assignments 30%, exams 20%, check-ins 50%, while student pages describe timely submission as earning the “doing half.” The asynchronous question to Sathya asks whether to use 30/20/50 with assignment quality scored by published criteria, or retain completion-based credit and discuss weights. No answer has arrived yet. This conflict has not been silently resolved, and actual Canvas grade settings have not been verified. Late penalties, retakes and attendance policies were not otherwise changed.

## Validation

All targeted checks passed:

- `tests/sprint3-storage.test.js`: path echoes and legacy ownership.
- `tests/sprint3-paths.browser.cjs`: initial empty entries, independent A/B/C drafts and checklists, migration, original book predictions, model calculations, branch restoration, exports, narrow layout and browser errors.
- `tests/sprint3-partner-grading.browser.cjs`: one review, eligibility confirmations and reciprocal-name check, two assignment totals, score ranges, legacy preservation, calibration completion, path-specific evidence and blocked storage.
- `tests/sprint3-review.browser.cjs`: unchanged and edited stale tabs, recovery and explicit version selection, book/peer conflicts, exact copied prompts, incomplete export labels, keyboard disclosure controls, export of collapsed answers, separate reversible submission marks, preserved calibration attempt, failed note writes, 390 px layout and 200% CSS-zoom layout.
- Inline JavaScript syntax, unique HTML IDs, local section targets, matching freshness codes and whitespace checks.
- Course-context generation: 31 pages; includes all four R3 codes, calibration, the feedback response, measurement sensitivity and the new exam blueprint.

Desktop/mobile screenshots were inspected for the new exam blueprint and review page. This was not a screen-reader session or a student usability pilot. No real student, Canvas submission or AI request was used in browser tests. Live Google Doc freshness and GitHub deployment completion were not independently verified.

## Writing review and recommendation choices

The relationship page was the reference for the longer activity revisions. The structure report counts 183 words before its first action, scenarios 187, review 270, and reflection 182. The review’s extra 87 words introduce the calibration sample and scoring task. The blueprint is a reading/preparation page, so it has no response field. Script estimates of 0.30–0.45 screens are text-only floors, not measured viewport distances.

The final prose pass split the long story question into invitations and evidence instructions, split calibration interpretation by criterion, and removed the duplicated transition comparison. The largest remaining paragraphs are mostly collapsed Dojo prompts or hidden context guidance; those retain exploration, student authorship and supported uncertainty. The repeated path labels and provenance are intentional cross-page navigation and attribution. Criteria precede submission controls; all added required responses have a field or an explicit later reflection destination.

Sentence-purpose map for the added blocks: path descriptions = choice/support/evidence/reconsideration; initial condition = provisional hypothesis/refinement; synthesis = connect observations/explain evidence; check = comparison/evidence type/detectable difference/limit; feedback = meeting/review/response/timing; calibration = attempt/evidence/interpretation/reconsideration; story = decision/effect/evidence/future use; blueprint = expected reasoning/quality standard/preparation; draft messages = location/status/recovery/next action. No added sentence asks students to invent uncertainty or a changed belief.

I retained the response scaffolds instead of removing them. A few-student pilot and a screen-reader pass remain sensible follow-ups, not work claimed complete here. The pilot should test whether students can explain their path choice, find the next task, distinguish saved from submitted work, use feedback, and judge a new case independently.
