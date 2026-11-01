# CST349 Sprint 3 revisions

1 November 2026 · Ready for Sathya's check

Applied the supplied GPT Pro review to the current course files, with grading decisions reserved for Sathya as requested. The current plan already allowed a pivot in its answer label, self-check, and AI guidance; those newer edits were preserved. Markdown and HTML companions were updated together. Dates, points, scored self-checks, and the Grading paragraphs were preserved.

## Changes made

| Area | Revision |
|---|---|
| Plan | Added an example of a justified pivot. Replaced the optional “hardest to fake” reflection with questions about capability, usefulness, and evidence. Added a suggested sequence for criteria discussion, evidence collection, Commons outreach, and the two November 30 submissions. |
| Grader agreement | Suggested an early discussion of evidence, challenge, ambiguity, and dependencies. Clarified escalation for missing or unavailable classmates and excessive workload. The described post-deadline check now includes incoming and outgoing review coverage. |
| Report | Corrected the unsupported database diagnosis. Added examples of shareable evidence and a route to discuss inaccessible evidence with staff. The optional reflection permits retaining suitable criteria and revisits the information-diet choice. “Bring it to the exam” now says “review it before the exam,” consistent with the existing closed-book/from-memory directions. |
| Feedback | Reviewers send each author only that author's review block by December 7, with scores provisional pending the existing instructor review. Authors use feedback before the December 9 check-in. Missing reports, missing feedback, and unresolved questions have an escalation route. A straightforward judgment can be explained without inventing ambiguity. |
| Alumni conversations | Added a route to staff when matches or access to the visit's ideas are missing. Unanswered outreach is described using the student's own evidence; the other person's learning remains unknown. Optional reflection asks what advice fits, should be tested, deferred, or declined, and allows confirmation or uncertainty. |
| Information diet | Allows adding, replacing, reducing, or using an existing source differently. Replaced the understanding/engagement binary with questions about the purposes sources serve. Updated visible and copied Dojo prompts and hidden guidance. |
| Drafting and submission | Clarified drafting location separately from AI help. Students can put their answers in the reviewed Dojo summary, followed by the existing transcript. Empty task sections are omitted when that summary is present; filled task-box additions remain. The independent route still exports task answers. |
| Peer form | Starts new work with one review block. Additional blocks remain removable; untouched blocks are excluded from export. Existing saved blocks and numeric zero totals survive reload. |
| Agreement form | Added **Check my submission**, separate from **Copy my answers**. Copying incomplete work remains possible. Checks cover roster names, missing fields, consent ticks, self-selection, reciprocal names, and exam partners saved in the browser. The result explicitly says that class-wide matching and unseen exam history cannot be verified by the page. |
| Accessibility and saving | Task links retain descriptive accessible names on narrow screens. Home notes report failed storage writes accurately and leave the text available to copy. |
| Overview | Replaced the blanket “at most one graded item” promise with a reference to graded work on the course calendar. |

Existing fonts, styling, layout, and visual hierarchy were retained. Detailed AI setup remains in its established location; a broader opening-screen redesign was not needed for these wording and behavior fixes.

## Grading decisions left for Sathya

These remain unresolved in the student-facing materials; the revisions above do not establish new scoring policy.

1. **Report scoring model.** Reconcile the student's 100-point terms, the report's 50/25/25 self-check, the reviewer's 0–100 Task 1 score, and the instructor's Task 2 score. Decide the weight of attainment, evidence/judgment, and the next learning decision, then add a worked calculation.
2. **Partial credit and amendments.** Decide binary versus defined partial-credit levels and how revised terms take effect. The report's “added a slide” example still calls an apparently fulfilled criterion partly met; it is left for this decision rather than silently changing the scoring interpretation.
3. **Complete success and justified nonchange.** The report still allocates points to explaining an unmet line. The peer rubric still requires one thing to change. Decide how full success and justified continuation satisfy those criteria.
4. **Unanswered alumni outreach.** The allowance for an unanswered message still conflicts with the scored requirement to describe both people's learning. Decide equivalent scored evidence, including the case where an absent student cannot reach an attendee. Staff escalation is now visible, but no recording or notes were invented or promised.
5. **Synthesis of advice.** Replacing three separate actions with one or more synthesized decisions would change the 30-point conversation criterion. The optional reflection now evaluates applicability; the required actions and rubric are unchanged.
6. **Challenge as an assessed standard.** Optional guidance now discusses growth and useful evidence. Turning it into a common graded threshold, or changing the agreement's points for administrative versus evaluative work, needs Sathya's decision.
7. **Score validation.** The reviewer's total field still has its existing 0–100 limits. Automated reconciliation with free-text line scores and stricter submission validation should follow the settled scoring model.
8. **Exam and course totals.** The Sprint 3 exam itself and its assessment expectations remain to be designed. Reconcile the overview's advance-question promise with the plan's statement that questions are not provided. The registry's stated 3,000 total versus listed 1,000 + 600 + 1,500 remains unchanged for grading review.

The full Dojo conversation requirement was retained. The summary's role and the conversation's role are now explained; replacing the transcript with selected excerpts would be a separate evidence-policy choice.

## Verification

- Browser checks passed for a fresh one-block peer form, optional add/remove, omission of untouched blocks, preservation of partially filled blocks, and migration of an existing two-block saved draft including zero.
- Agreement checks detected missing fields, unknown roster names, reciprocal assignments, and a saved exam partner. Copying still worked with an incomplete or conflicting draft. A passing form check stated its verification limits.
- All three Dojo-enabled graded pages passed summary-only, mixed summary/task-box, and independent-answer export checks. Filled answers were retained and empty summary-route sections were omitted.
- Home-note tests covered successful saving and a simulated storage failure; the latter displayed an accurate message and preserved the text in the field.
- Checked desktop, 390-pixel mobile, and 754-pixel Canvas-width presentation. Mobile task links retained descriptive accessible names; the tested task pages did not overflow horizontally. No uncaught browser errors occurred. This used local files and simulated Canvas width/context, not signed-in Canvas Student View.
- Inline script syntax, unique HTML IDs, and local section links passed. Scored self-check markup and Grading paragraphs matched the pre-edit files exactly. `git diff --check` passed.
- The course-context builder produced the downstream Course payload successfully: 34 pages. This verifies generation, not a live Google Doc sync.

### Writing review

The comparison page was **My first step, taken**, the closest existing graded activity. The structure script reports words before the first available action, which may be the Dojo checkbox; browser distances below refer to the first answer field. These are different measures.

| Page | Words before first action | First answer field, 720px screens | Longest visible paragraph, words |
|---|---:|---:|---:|
| My first step, taken (reference) | 211 | 2.47 | 107 |
| My Sprint 3 plan | 223 | 1.85 | 68 |
| My Sprint 3 report | 235 | 1.87 | 68 |
| My grader | 382 | 1.76 | 60 |
| Grade your partners | 292 | 1.43 | 66 |
| What I learned from others | 217 | 2.12 before final introduction trim | 98 before final introduction trim |
| Information Diet Audit | 147 | 0.92 | 65 |

The agreement and review pages have no opening Dojo checkbox, so more of their required setup appears before their first action. The plan and report add context relative to the reference but reach their answer fields sooner. The alumni introduction was split and shortened after measurement. Fonts and remote resources were blocked during the isolated browser test; dimensions reflect the local fallback rendering.

The source checker reported six to eight consecutive paragraph elements on revised pages, versus nine in the reference; it includes hidden coach text and purpose-card markup. Criteria precede submission controls, and the tone checker found no flags. Shared submission and AI-help boilerplate remains repeated across pages because each page can be opened independently. No new promises about employer reactions or forced failure were added.

The message map for added prose is: pivot example → reason for a changed goal; plan reflection → growth and useful evidence; suggested sequence → preparation before the break; agreement discussion → early clarity; staff escalation → unavailable partners; report evidence → accessible verification; feedback handoff → recipient and use; alumni reflection → applicability; audit → purposeful attention; submission instructions → one complete answer set; form messages → accurate checks and save status. Optional reflection remains under the existing support disclosures. Existing grading-dependent contradictions are listed above rather than rewritten.

## Publication status

Saved in the local course repository for the existing sync-helper workflow. No manual commit, push, Canvas publication, or direct Google Doc edit was performed. Live site publication, Google Doc synchronization, and private Canvas/Commons readiness were not verified in this pass. Actual class-wide review matching remains an operational check after agreements are collected.
