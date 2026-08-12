---
name: writing-to-teach
description: Use whenever writing or revising text that students will read to learn — a course or sprint home page, a concept introduction, the framing at the top of an activity, or any page standing in for a lecture. Triggers when drafting a new student-facing page, when converting lecture or video material into text, and whenever a draft reads like a summary for colleagues instead of teaching — short sentences that describe the end state without walking the reader there. Covers starting from what the reader knows, has, and has attention for; the four engagement modes a page must reach; the two registers (teaching text vs task text) and which rules govern each; the teaching moves; and a backbone-plus-expandables page structure. Does not cover goal lines (writing-learning-goals), assignment structure (writing-assignments), or the final trim pass (reviewing-course-text).
---

_Status: v1 (August 2026). Born from the CST499 lock-ladder session: the named defect
was presentation-register writing — describing the end state to readers who don't yet
have what they need to get there. First test passed 2026-08-04, rewriting the CST499
home page against it._

# Writing to teach

Teaching is different from presenting. A presentation assumes the reader could have
written the page themselves; teaching assumes the reader does not yet have everything
needed to understand — and meets them at their starting point, then guides their
thinking and actions, step by step, in simple direct language, to the end point. Since
our written pages now stand in for lectures, the pages must do what the lecture would
have done.

Worked references (private team archive, not in this repo):
`alan/teaching-register-examples-2026-08-04.md` (four of Sathya's lecture transcripts
with the moves marked) and `alan/loom-teaching-analysis.md` (the 24-video synthesis
with the research behind each move).

## Start from the reader — what they know, have, and have attention for

Before any mode or mood: the material starting point. Write every page against these
four facts about the room.

**Evidence.** Some students arrive with GitHubs and internships; many arrive with
coursework only. Write so a thin-evidence reader sees a path, never a verdict.

**The first move.** Many have done well for years by executing what was asked and have
never once been asked to generate their own idea. Stalling at "choose your own" is
missing practice, not missing ability — so the first step on any page must be small,
concrete, and takeable today.

**Time and attention.** Some read around shift work and family load, and attention is
earned a line at a time: assume you get one sentence — maybe three to five lines —
before the reader decides whether to continue. The first sentence carries the payoff;
the backbone must survive a skim; depth waits behind clicks.

**Vocabulary.** No insider terms unassisted. A term of ours gets its tooltip or
parenthetical at the point of first use, every time.

## The four modes a page must reach

We use Rebecca Winthrop's engagement modes — passenger, achiever, resistor, explorer —
as internal language for how a student meets a page. Two ground rules: modes are
*states, not types* — the same student moves between them week to week, and our pages
are part of the environment that moves them; and this is working language for us, never
a label put on a student and never cited to students as established research.

**The passenger** is capable and coasting — doing what's in front of them without
taking the wheel. They read asking *what do I have to do?* A page loses them by being
one more task list; it reaches them by making the payoff personal and the first step
small — a reason to drive.

**The achiever** is engaged and grade-driven — they will do everything asked,
excellently, and stop there. They read asking *what gets the A?* A page loses them by
letting points be the only visible why; it reaches them by attaching a payoff beyond
the grade — the referral bar, work an employer actually reads — and honest bars worth
chasing.

**The resistor** has agency pointed away from the work, and may give a page one
sentence while looking for a reason to dismiss it. A page loses them with lecture-tone
and warnings; it reaches them by respecting their judgment, being honest about what
the work is for, and offering something their agency can point at — real choice, real
stakes, their own interests.

**The explorer** is curious and self-driven where the environment permits it. They read
asking *what's here for me?* A page loses them by over-constraining; it reaches them
with room to run — open problem spaces, expandable depth, explicit permission to go
beyond the assignment.

## The two registers

Course text does two different jobs, and different rules govern them.

**Teaching text** explains, motivates, and builds a mental model — the register of the
transcripts. It flows, gives examples, meets feelings, and may return to an idea from a
new angle. **Task text** tells the student what to do — it is scannable and minimal:
start with the verb, one task per line, bold the real constraints (dates, counts,
tools), and state the deliverable separately from the steps so what-to-hand-in is never
buried in how-to-do-it. Most pages carry both; know which sentence is doing which job,
and never let task-text compression flatten the teaching, or teaching warmth blur an
instruction.

## The moves — teaching register

**Locate the lesson, and name the payoff, before any content.** First lines answer:
where are we in the arc, and what does the student get from this page. ("Before we
focus on any thinking skill — how we think is the most important tool we bring as
professionals.")

**Meet the feeling, and bound what's not needed.** Name the likely intimidation or
misconception, then shrink it: "this may sound daunting — yes and no"; "you don't have
to become an expert in how the brain works." Every bounded scope is a weight lifted.

**Everyday example before technical example.** Each concept gets an example the student
already owns — driving home on autopilot, buying a car, learning to ride a bike —
before any example from the field. **Pair definitions with a non-example**: "'backend
work on data pipelines at climate-tech companies' passes; 'full-stack at a startup'
does not." The boundary teaches more than the definition.

**Short sentences, light load.** Keep sentences short even when teaching — but the real
rule is one new idea per sentence. A short sentence carrying three compressed ideas is
presentation, not teaching. When a sentence needs two reads, split it and spend the
words walking, not summarizing.

**Walk the chain — don't chain declaratives.** (2026-08-11, named by Sathya at the
CST349 gate.) A run of short declaratives that each state a conclusion leaves the
connections as reader homework — presentation in miniature, even when every sentence
is short. Give each claim its actor and its concrete mechanism ("with the help of AI,
you could complete the work" — never "work can be produced"), and write the
connectives — but, so, because — into the prose. An aphorism may close a section; it
never explains one. Corollary: describe integrity mechanisms as what holds us
accountable to our learning together, never as fake-detection.

**Pronouns don't survive first contact.** A "they" or "it" whose antecedent lives in
an earlier sentence fails a first-time reader (found live: first TA review,
2026-08-11). Repeat the nouns until the pair itself has a name.

**Sibling terms need a frame before the contrast.** Two new terms arriving inside an
either/or read as interchangeable (same review). First the frame ("it comes in two
kinds"), then one definition sentence per term.

**Backbone visible, detours behind clicks.** In a lecture a detour works because the
key points are tied back across it; on a page, the same content laid flat becomes a
wall. So: the backbone — payoff, core idea, everyday example, next action — reads
top-to-bottom on its own and survives a skim, and the detours (added detail, extra
examples, edge cases, definitions) sit in expandable dropdowns and popup bubbles at
the point of use. The glossary tooltips and `<details>` blocks already on our pages
are this pattern; use them deliberately, not decoratively.

**The why at every seam.** Every change of direction carries its reason at the moment
it's needed — "we test all the cases *because* one bug means the computer can't add" —
not saved for a rationale section nobody reads.

**Fellow learner, not lectern.** Write as "we"; keep honest hedges ("there's some
controversy in the research — don't worry about it here"); let the instructor's own
mistakes and provenance show. This is where trust comes from — and it is what keeps a
resistor reading.

**Varied repetition.** Returning to an idea from a new angle builds transfer — that is
teaching, and it stays. Repeating it in nearly the same words teaches skimming — that
gets cut. (This is the boundary with `reviewing-course-text`: its duplicate-cutting
rule targets verbatim and cross-surface repetition, not varied returns.)

**Interleave action.** Where a lecture says "pause the video and try it," a page says
*do this now* — a small action mid-page, before more reading. Understanding built on an
action just taken holds; understanding built on ten paragraphs does not.

**Close on agency, and an open door.** End with what the student can now do — the
zoom-out ("you have built the piece that lets a computer add") — and the standing
invitation to ask. Never end on a warning.

## Promises and frames

Born from the CST349 home-page gate (2026-08-11), where the instructor's edit round
read as eight page rules. The four that govern promises and framing:

**Growth is part of the profession, never survival.** No fear levers, no exclusivity
("the ones who stay valuable"). State growth as what professionals do.

**A promised skill gets unpacked into its parts at the moment it is promised** —
"build that skill" becomes "recognize the growth needed, develop a plan, follow
through."

**Metaphor decorates; capability claims.** The literal capability carries the
sentence ("cross domains, disciplines and systems"); the image (ladder, pillar)
illustrates it.

**Page promises match the grading truth.** If the course grades movement, the page
promises "a meaningful effort," "an initial plan," "an ability you will need" —
never arrival.

And three that govern the actors on the page: **reflection is a named step wherever
the loop appears** (set → work → reflect → revise → adapt — never compressed to
"read and adapt"); **independence is a fading scaffold** ("decreasing levels of
guidance"), never an anti-instructor contrast; **conversations include peers and
audiences include collaborators** — instructor/TA and peer conversations, sitting
beside interviewers and managers. Use **student-humane verbs**: students recognize
their starting point and reflect on their experience; they do not "get set" or
"read their data."

## One vocabulary

The same thing has the same name everywhere — on this page, on its siblings, in Canvas,
on slides. Three names for one thing reads as three things. (Learned live: "artifact,"
"piece of proof," and "portfolio piece" were one concept; the page got clearer the day
it became "portfolio piece" everywhere.)

## The test

Read the finished page four times, once as each mode, testing the page rather than the
student. The passenger: is there a reason to take the wheel, and a first step small
enough to take today? The achiever: is there a payoff beyond the grade? The resistor:
is the page honest, respectful, and offering something their agency can point at? The
explorer: is there room to run? Then check the support stack: where the page asks for
something hard, it supplies inspiration, a mental model, steps, and tools — whichever
of the four the moment needs. Finally, the attention check: would a reader who gives
you only the first sentence leave knowing the payoff?

## Closing checklist — checkable by looking

- The first sentence carries the student's payoff; where-this-fits appears before any
  mechanics.
- Every concept has an everyday example before or beside its technical one.
- Every definition carries a non-example.
- The backbone reads top-to-bottom with every expandable closed; detail sits behind
  clicks at the point of use.
- No sentence introduces more than one new idea.
- No declarative chains: each claim carries its actor, mechanism, and connective;
  every pronoun resolves inside its own sentence.
- Task text: verb first, one task per line, constraints bold, deliverable stated
  separately from the steps.
- One name per concept, on this page and its siblings; our terms carry a tooltip or
  parenthetical at first use.
- The page ends with what the student can now do and where to ask questions.
- Promises match the grading truth; growth framed as profession, not survival; loop
  descriptions name reflection; independence reads as fading guidance.

Judgment calls — does it meet the feeling, is the voice right, is the hope honest — are
not checklist items. They go to a person: that is what the publish-as-a-doc gate is for.

## Relation to other skills

`writing-learning-goals` owns the goal line itself. `reviewing-course-text` owns the
final trim, with the varied-repetition boundary noted above. `updating-canvas` and
`slides` own where the text lands. This skill owns how teaching text gets written in
the first place.

---

*Addendum 2026-08-11: the Promises-and-frames section was extracted from Sathya's direct-edit round on the CST349 fall home page — the gate's second output, per the pattern-extraction practice.*

*Provenance — Human (Sathya): the teach-vs-present diagnosis; the personas idea and the
choice of Winthrop's modes; the light-load-sentences, backbone-plus-expandables, and
attention-span additions; the four-layer support stack; and the lecture transcripts the
moves are drawn from. Human + AI: the two-register split, the moves extraction, the
two-lens shape (modes for engagement, resources for the starting point). AI (Alan): the
drafting; the Winthrop research and its use-as-language-not-measure boundary (private
archive: `alan/winthrop-four-modes-2026-08-01.md`); cross-checked against the June Loom
analysis.*
