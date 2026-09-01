---
name: reviewing-course-text
description: Run as the final step whenever student-facing course text is created or substantively edited — activity pages, Canvas assignment/quiz descriptions, self-check JSON blocks (infoBlock, description, prompts), home-page rows and notes, slide body copy, and emails to students. Triggers at the end of any course-development writing task, before the text is saved to a live surface, and whenever a reviewer says content feels long, repetitive, or preachy. Covers mapping the message of each sentence, cutting redundancy within a page and across stacked surfaces, removing sentences with no job, flipping unnecessary negatives, and placing each instruction at the point of action. Developed for Career Intelligence; general across programs.
---

_Derived from the Fall 2026 four-layer lock record (`cowork/fall-2026-courses/CONTEXT.md`), which holds the decisions this skill assumes. This file governs how to write the thing; where it states a decision the record does not, that is drift to fix here. Last checked against the record: 13 August 2026._

_Status: v2 (29 August 2026) — added the structure gate: compare against a similar page and report the numbers, plus `scripts/review_student_page.py`. v1 (July 2026). Born from the Week 5 build: the same intro paragraph rendered twice on the self-check (page intro + engine description), and the referral application page needed a hard trim after team review._

# Reviewing course text

CTI is building an interactive, book-like experience that develops students' reading skill. That commitment cuts both ways: text worth reading closely must be written so close reading pays off. Every sentence that repeats, pads, or lectures teaches the student to skim — and a student trained to skim by our own pages stops reading exactly where we need them to read. Respecting the reader is how we keep the reader.

## When to run

At the end of writing, every time. The review is the last step before student-facing text is saved to a live surface, the way a build gets tested before it ships. It is not optional polish for long pieces; short blocks (a home-page meta line, a question's sub-note) are where padding hides best.

## The structure gate — run it before the prose pass, and report the numbers

Added 2026-08-29, after a review found three Week 2 pages that argued for the work before letting
students do it: 1,098 / 838 / 653 words before the first response, at 2.9 / 2.7 / 2.3 screens on a
1280×720 laptop. Every prose rule that would have prevented that was already in these skills and did
not bite. A number did.

**Compare against a similar page, not against a fixed threshold (Sathya, 2026-08-29).** A page teaching
a new idea legitimately needs more before the first action than one asking students to list six moments,
so a constant would be wrong on one of them. Instead:

1. **Before writing**, find the closest existing page of the same kind and measure it.
2. **After writing**, measure yours.
3. **Report both, side by side.** A gap is not a violation — it is something to account for. *"400 words
   longer than What Are My Priorities, because it introduces two new terms"* is a complete answer. A
   number with no account is the thing this gate exists to catch.

**Pending:** a nominated set of reference pages does not exist yet (Sathya, 2026-08-29 — revisit after
several more pages have been through this process). Until it does, compare against the closest page by
kind, and say which one you used.

**What to report, every time:**

- Visible words before the first response field or first required action, and the distance to it in screens.
- The longest paragraph, and any paragraph over roughly 60–70 words.
- Any run of three or more prose paragraphs with no heading, list, table, example or action between them.
- Whether success criteria appear **before** the submit control. After it is a defect: the student meets
  the standard only once the work is done.
- Passages of 30–40 words repeated across sibling pages in the same week.
- Every sentence that speculates about someone else's judgment — a recruiter's reaction, whether an
  instructor would vouch for them, whether anyone would be impressed.
- Every fear, scarcity, shame, survival or deficit frame, and every place a worry is raised and then
  reassured about. Both halves come out.
- **The hidden text too:** system prompts, coach notes, button labels and error messages are student-facing
  course text and get the same pass as visible prose.
- Whether every required reflection has somewhere to answer it, or is clearly marked optional.

`scripts/review_student_page.py` produces the countable items. It reports; it never rewrites. The
judgment about which flags matter stays with a person.

## The discipline

**1. Map the messages.** Go through the draft sentence by sentence (paragraph by paragraph for long pieces) and write the one message each carries, as a short label. A sentence whose message you cannot name has no job — cut it. This map is the whole audit; the remaining steps read the map, not the prose.

**2. Cut duplicates — across surfaces, not just within the page.** Each message appears once, in its strongest placement; every other occurrence goes. Check the full stack the student actually reads in sequence: home-page row → activity page → embedded engine description → Canvas assignment text → question blocks. Files that each look clean in isolation still read as repetition when stacked — the Week 5 self-check said "one reflection, by hand first, copy into Canvas" twice before the question appeared, because a page intro and a JSON description both carried it.

**3. Cut sentences with no job.** If deleting a sentence changes nothing about what the student understands or does next, delete it. True is not a reason to keep; the reader's next move is.

**4. Flip unnecessary negatives.** Apply the inspire-don't-scare rule (see `writing-learning-goals`) to body text: warnings, not-X constructions, and loss-frames used as hooks get their positive twin ("write an answer only this company could receive," not "if it could go to any company, it isn't done"). Honesty guardrails — no-guarantees, plan-not-promise — stay, but they never lead. Exclusivity and survival frames count as negatives too: “the professionals who stay valuable are the ones who…” gets the same flip as a warning — growth stated plainly as part of the profession (CST349 gate, 2026-08-11).

**5. Keep it crisp — volume loses students (Sathya, 28 Aug 2026).** A page with a lot of
text loses students unless it keeps them focused and guides their thinking. Purpose sections
are one or two sentences. When a template block (skills, rationale, framing) inflates a page,
compress it into the doing text or cut it — guide the student's thinking with the fewest
words that keep them moving.

**6. Place instructions at the point of action.** A "how to submit" line belongs in the submit box, not the intro; a hand-write-first rule belongs on the question that gets hand-written. A message in the wrong place forces a second copy in the right place — misplacement is where most duplication starts.

## The test

Read the finished text as a student who reads every word. They should never feel told twice, warned instead of invited, or made to hold an instruction for later. If the message map has each label exactly once and every label sits where the student acts on it, the text is done.

## Quoting students — an absolute rule

When any material quotes a student's work, the words inside quotation marks are the student's exact words. Never invent, compose, or "reconstruct" a student quote, and never present a paraphrase inside quote marks. Only two alterations are allowed, and both must be visible: [square brackets] for replaced identifying details or pronouns, and an ellipsis (…) wherever words are omitted — including trailing omissions mid-sentence. If a quote needs more smoothing than that, paraphrase it outside quotation marks instead. Don't assign students a gender the submission doesn't state, and verify every quote against the source before the material ships. This rule has no exceptions; when in doubt, quote less and mark more.

## Relation to other skills

`writing-learning-goals` owns the goal line itself; this skill owns everything after it. `updating-canvas` governs module structure. Dojo context files follow their own tone rules (warm-and-direct, the Dojo behaviour docs) — review them for duplication, not for voice.
