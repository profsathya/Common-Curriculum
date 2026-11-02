# CST499 Sprint 3 review revisions

1 November 2026 · Ready for Sathya's check

Applied the supplied GPT Pro feedback to the current local course files. Grading, assessment expectations, dates, and overall course structure are reserved for Sathya. Existing fonts, colors, layout, and hierarchy remain; the new editable starter uses the poster sample's styling. Content edits were carried into both Markdown and HTML.

## Changes made

| Review recommendation | Revision |
|---|---|
| 5A: misleading completion | The home page uses only the student's explicit, reversible completion mark. A saved reflection is labeled as a draft below the original description. Accessible labels explain that Canvas submission is not verified. Other open home tabs update when the mark or reflection changes. Failed note saves are reported accurately. |
| 5B: stale drafts | All seven Sprint 3 forms use the existing draft guard. Untouched tabs do not save old state. Conflicting edits preserve both versions and require an explicit choice. The closing reflection is updated only after the corresponding draft saves successfully, including conflict resolution. Existing Copy my answers remains the export path. |
| 5C: incomplete Dojo handoff | The integrative report, first poster, decisions assignment, and final poster now include the closing response in both visible and copied output prompts. Hidden Dojo guidance asks for it before summarizing. Instructions explain how to distribute answers into the form, select the opening/closing choices, and complete unsettled answers. |
| 5D: setup before writing | The claim page now provides a direct link to task 1 before Dojo setup. Existing support and the summary-plus-conversation submission route remain. A larger layout redesign was not undertaken. |
| 5E: starter and keyboard access | Added an editable HTML starter, linked from the sample page and first-poster assignment. Students can edit, preview, download and reopen it without constructing the interface. It saves through a downloaded file, not browser autosave. Sample dialogs now contain keyboard focus, make the background inert, close with Escape, and return focus to the opener. |
| 2D: evidence interpretation | The report's evidence guidance distinguishes observation from inference, gives bounded examples of what a test or user trial supports, and suggests considering uncertainty and another check. No new scored item or required answer format was added. |
| 3A: retrospective decisions | Guidance recognizes goals, evidence, time, access, experience and motivation as relevant factors. It suggests distinguishing alternatives and evidence available then from hindsight, using a dated record where available. The required alternative count remains unchanged. |
| 3B: Security+ example | Exam-only study is explicitly an initially attractive option rejected for failing to provide hands-on evidence. The decision card points to the analyzed postings for the market rationale and the investigation for practical work. The example no longer promises a completed exam before its December 12 date. The sample card explains the distinction between posting evidence and a lab diagram. |
| 3D: audience and T-shaped skills | Added a brief depth-and-connection definition and explained that aggregate labor-market findings motivate investigation rather than prove a particular project's benefit. Poster guidance distinguishes a nonspecialist first screen from technical details inside the cards. The assigned readings remain unchanged. |

## Decisions left for Sathya

These remain unresolved in the course materials. None of the guidance added above establishes a new grading policy.

1. **Integration outcomes and causality (2A).** Decide whether unsuccessful, inconclusive, or well-justified nonchange can satisfy the Integrative Solving report. Its purpose, questions, rubric and AI feedback currently require improvement; its strength criterion says the change could only have come from the second domain. Revise those together once the standard is settled.
2. **Current claim versus December target (2B).** Set the expectation for the November 16 poster: a current supported claim plus milestones toward a larger target, or a claim with explicitly unproven parts. Its existing rubric and strength description conflict. The claim assignment's December target remains intact.
3. **Project quality and individual contribution (2C).** Decide how the proposal's project-specific quality criteria and each student's contribution feed the final poster and interview. Adding this as assessed evidence needs an agreed standard.
4. **AI judgment (3C).** Decide whether independently testing and accepting an initial AI result satisfies the process criterion. The current rubric requires an initial output, a follow-up, and checking; it was not broadened in this pass.
5. **Alternatives (3A).** Decide whether a consequential choice between two options may satisfy the task without two additional alternatives. The fixed count was preserved.
6. **Rehearsal and responses to feedback (4A–B).** Decide whether to add explicit claim/evidence questions and role-grounded professional feedback, and whether adopting, adapting, testing or rejecting a suggestion can all earn credit. The existing required listener questions and revision criteria remain. The final poster already permits rejecting a planned change in its opening, but its rubric/AI feedback still emphasize change.
7. **Interview expectations and chronology (4C, 6).** Define the interview dimensions, any transfer question, the artifact version assessed, and the order of interview, final poster and festival. The home schedule and final-poster prose disagree; no dates or sequence were invented.
8. **Course structure and November check-ins (6).** Reconcile the overview's six sprints, November 18 Sprint 4 opening, and at-most-one-graded-item statement with the current Sprint 3 schedule. Decide whether November 18/20 meetings explicitly assess evidence gaps. These are overall design/scheduling decisions.
9. **Quality review source drift (6).** Its Markdown Dojo route and weighted self-check differ from the rendered page. Choose the authoritative workflow and scoring presentation before reconciling; neither was silently promoted over the other. Draft protection was added to the existing HTML form.
10. **Reading scope (3D).** If desired, select report excerpts and revise the reading instruction. This changes the assigned learning task; the current instruction to read both reports remains.

## Verification

- Local browser regression checks passed on all seven forms: untouched stale tabs, conflicting edits, recovery, explicit replacement, and carry-forward reflection protection. Synthetic drafts only; no student work was accessed.
- All four corrected output prompts matched their Copy prompt text and included the closing response; answer export retained that response.
- Home checks passed for independent completion marks, clearing a mark, keeping the description, labeled draft reflections, and failed note storage.
- Sample keyboard checks passed for Tab/Shift-Tab containment, inert background, Escape, and focus return. This is a focused check, not full accessibility certification.
- The starter retained edited text and its evidence URL when downloaded and reopened. Mobile layouts on the changed teaching pages, samples, and starter did not overflow at 390px. Desktop screenshots were inspected. No uncaught browser JavaScript errors occurred.
- Failed form storage was reported while Copy my answers still exported the current text.
- The existing CST286 browser suite passed after the backward-compatible optional save callback was added to its shared draft guard.
- Scored self-check markup and Grading paragraphs matched the original files on all seven forms. Inline JavaScript syntax, unique IDs, local links and `git diff --check` passed.
- The course-context builder generated the Course payload successfully (47 HTML pages). This verifies generation, not a live Google Doc sync.

### Writing review

The comparison page was Quality review, the closest existing Sprint 3 graded page. The structure script reports words before the first available action, including a checkbox or button; it does not measure distance to the first writing box.

| Page | Words before first action | Longest paragraph counted by source checker |
|---|---:|---:|
| Quality review (reference) | 200 | 98 |
| My claim | 189 | 221 |
| Integrative report | 241 | 174 |
| Decisions | 271 | 167 |
| First poster | 258 | 190 |
| Final poster | 243 | 151 |

The later pages begin with a look-back question and context from earlier work, accounting for the additional opening words. Most long paragraphs counted on the revised pages are copyable Dojo prompts or hidden coach guidance. Existing prompt requirements were retained. The source checker found five to ten consecutive paragraph elements, including purpose-card and hidden guidance markup; these are not all uninterrupted visible prose. Criteria precede submission controls, and the tone checker reported no flags. The direct task link improves access without moving established support.

Repeated 30-word passages are the shared Canvas-opening notice, submission and storage instructions, Dojo setup/output guidance, and provenance statements; they remain because pages can be opened independently. The new sentence purposes are: audience → choose detail level; definition → understand depth/breadth; labor-market caveat → use readings appropriately; decision guidance → explain evidence and constraints; example → match reasons to evidence; report guidance → bound interpretation; handoff → place every response correctly; starter instructions → edit, retain, and submit work. No new employer-reaction claims or assessment requirements were introduced.

## Publication status

Saved locally for the established sync-helper workflow. No manual commit/push, Canvas publication, or direct Google Doc edit was performed. Live site publication, Google Doc synchronization, and signed-in Canvas Student View were not verified. The deferred decisions above should be resolved before treating the affected assessment guidance as reconciled.
