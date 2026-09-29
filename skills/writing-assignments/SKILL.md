---
name: writing-assignments
description: Use when writing or revising any assignment or activity page students will act on, whatever the course calls that kind of work. Triggers when a design conversation has decided an assignment and it needs its student-facing page, and when an existing assignment page is revised. Covers the Purpose–Task–Criteria–Reflection shape (adapted from the Transparent Assignment Template) with its builds-on/prerequisite block, the internal qualities line, and the pipeline the page lands in (assignments.html → HTML page → Canvas iframe → reconcile). Prose register belongs to writing-to-teach, goal lines to writing-learning-goals, the final trim to reviewing-course-text — this skill sits a level above those three and calls them.
---

# Assignment pages - the checks to run before a page reaches Sathya

One screen. The page shape, the pipeline, his corrections and the version history are in `references/rules.md` in this folder - read that once at the start, then run this list on the page. Every line traces to a section there, named in parentheses; the tests picked are the ones his corrections show were missed. Prose rules come from `writing-foundation` and `writing-to-teach`, the goal line from `writing-learning-goals`, the final trim from `reviewing-course-text`. When a rule changes in `references/rules.md`, its test changes here in the same edit (and the other way round).

## Before the first draft

- The `.md` twin is drafted first, beside the `.html`, with the student-facing content in page order and none of the machinery; once he has edited it, every change goes into both files. (The internal lines - The editable twin)
- Each task's question has been compared with its guidance, checklist, examples and AI-feedback instructions, and any count, resource type, time requirement or demanded result found only in the support is flagged for the author. (Task)

## On every page

- The blocks are Purpose · Task · Criteria · Reflection, in that order; there is no "What you're building on" block and no "By the time you submit, you will have" list; earlier work is named inside the task, by assignment name and question number. (Purpose; What you're building on)
- Purpose is one or two sentences, and the first carries the payoff, not the topic. (Purpose; Checklist)
- An own-your-progress page opens with the ownership line, verbatim, in its `.ownbar` block under the page head and above Purpose. (How own-your-progress and graded items are labelled and dated)
- The words "not graded" appear nowhere a student reads; the section heads carry his two markers verbatim. (How own-your-progress and graded items are labelled and dated)
- Every row shows `Recommended Date:` (OYP) or `Due Date:` (graded) from its `data-due`, in the title's `.hint` span with the date in `span.wdate`; no due date is repeated in the Canvas assignment body. (How own-your-progress and graded items are labelled and dated)

## On every task

- Likely errors are prevented by a positive test, a structured field or a paired example; a common mistake is named outright only when it is consequential, likely, and cannot be prevented more directly. (Task)
- Sub-points (a/b/c) are distinct answer elements, never a restatement of the main instruction, and separate requirements stay visible. (Task)
- Guidance under the `+` gives a way to work out an answer; no sentence praises, justifies or rephrases the question. (Task)
- Examples sit in the task's click-in, not in Criteria, and none predicts an employer's reaction or tells the student which goal is best. (Task; Criteria for success - Examples live under each task)
- Inside the click-in, the answer box comes right after the guidance and examples, and the reflection question follows with its own smaller box; the copied text carries a `Reflection:` line under each answer. (History, v6)

## On Criteria and Reflection

- The Self-check click-in `+` opens Criteria: about ten items in submission order, each a checkbox, a neutral observable line saying what a 5 looks like (never "I wrote…"), and its points; points set per item, adding up to the assignment total; no separate "Done" block; the copy button carries each item's checked state. (Criteria for success - The Self-check; The checked boxes travel)
- No 3 or 1 rung, priority rank or quality tag is on the page or behind a dropdown; each item has all three in the record. (Criteria for success - What stays off the page; The internal lines)
- "What makes it strong" is written as traceability between tasks; grading names points per item, the grade group, and the peer/TA/instructor conversation. (Criteria for success)
- The copy-the-questions line and the guidance line use his wording: the first names the trade between the doc route and the guided page, the second says what the `+` layer is for, never that it is optional. (Criteria for success)
- No question, example, criterion or AI note requires a failure, an AI error or a changed answer; justified uncertainty is allowed; "answer without hedging" is not a criterion; no question assumes a personal limitation; the questions are answerable only after the work. (Reflection; Checklist)
- The AI feedback notes are written from the question, say nothing when every requested element is present, and supply no goal, ranking or reader reaction; a change to the question wording changed the copied questions, answer labels, checklists and notes in the same pass. (The internal lines - The notes behind the AI feedback button)

## Before it reaches him

- The `assignments.html` row matches the page, with kind and points from the course design and the due day by the rhythm rule (one OYP Fri; two Wed, Fri; three Tue, Wed, Fri; a graded item the following Monday). (The pipeline this page lands in)
- The Canvas name carries its prefix, `OYP: `, `GI: ` or `Exam: `; activity links open a new tab (`_blank`, never `_top`); the page renders on the web and in the Canvas iframe, and the course Google Doc carries its current Canvas link and page link. (The pipeline, 3, 4 and 6; Checklist)
