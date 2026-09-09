---
name: slides
description: Use when building or revising a session deck for any of the fall courses. Triggers when a class session has been planned and needs its slides, and when an existing deck is being revised. Covers the house slide system (eyebrow, headline, archetypes, palette), one point per slide, where interactive tool slides go, the closing Reminders slide, and the register Sathya writes in — first-person plural, label-first bullets, no reassurance. Prose rules belong to writing-to-teach, which governs every sentence here too; assignment structure belongs to writing-assignments.
---

_Status: v1 (9 September 2026). Extracted from Sathya's direct edit of the CST286 week-3 deck (`alan/cst286-week3-deck-v4.pptx` → his Google Slides version, 9 Sep). The deck Alan built was 25 slides and correct in content; what he changed was almost entirely **shape and register**, and those changes are the content of this file._

# Building a session deck

The deck is a script for a room, not a document. Everything in `writing-to-teach` applies to every sentence on it — the **no telegrams** rule especially, because slide bullets are where noun-phrase-plus-em-dash writing hides most easily.

## The house system

Cloned from the existing course decks rather than rebuilt, so the brand is the real one. Calibri throughout. Teal `0D9488` for eyebrows, badges and the closing line; deep blue `0A5A8A` for row labels and column heads; slate `2D3B45` for headlines and body; grey `6B7780` for the slide number and footnotes; dark slides carry `E8F1F8` text; the trail line and waypoints are `C9D9E6`.

Every content slide carries a section **eyebrow** in caps at top left (`WHERE WE ARE`, `SPRINT 1`, `YOUR INTEREST`, `CURIOSITY WARM-UP`, `HOW WE WORK`, `THE COMMONS`, `NEXT WEEK`) and the course · slide number at top right. Headlines are **claims, not labels**: "Your interest is one hand on the elephant", never "Conversations".

The archetypes, all present in the existing decks and duplicated with `add_slide.py` rather than rebuilt:
**title · claim** (headline + three body lines + a closing line) **· steps** (three numbered badge rows: label + body, plus a closing line) **· two-column · single** (headline + one line, the quiet slide) **· pipeline** (five chevrons) **· dark statement · closing**.

## One point per slide, and the corollaries

Rarely two. The corollaries are what make it real:

- **A repeated sequence pays off on its own slide.** Five warm-up questions, then the line that tells them what the show of hands meant, alone on the next slide. Do not hang the payoff on the last item — it competes with the question still on the screen.
- **A break is a slide.** One word.
- **A headline sheds its scaffolding.** "Four weeks to explore one thing you care about" became "Explore one thing you care about" once the week-by-week row underneath already said four weeks. If the slide's own furniture states it, the headline does not.

## Fold a claim into the slide that earns it

The build had two slides: the elephant (why one person's view is partial) and then a dark statement, "Deep conversations, not debates". **He deleted the second and folded its point into the first**, as the conclusion of the same slide. A slide that only asserts a belief has to sit inside the slide that motivates it, or it reads as a poster.

**And the why comes before the activity, not after.** He moved the conversations slide ahead of the peer-reading exercise. Students should know why they are about to talk to someone before they are told to.

## Interactive slides are the tool, not a description of it

Where the build said "Put one of them on Pear Deck", he replaced the slide with an actual **Pear Deck** slide — *Share with the class · Anonymous*. Three of them in one session: the share, the compare, and the Nutrition for the Mind question.

**Alan cannot create these.** Pear Deck slides carry add-on metadata written by the Pear Deck add-on inside Google Slides. Build the slide with the right title and instruction, leave it plain, and say in the handover that he applies the add-on. Never describe an interactive step in prose when the slide could be the step.

## Register — how he writes, and what he takes out

- **"We", not "you", where the difficulty is shared.** *"We are probably not used to talking about our curiosity"* replaced *"It is not common to start with this question."* The first admits he is in it too; the second is an observation about them.
- **Label-first bullets for a set of distinct facts.** The exam slide became `No surprise question` / `Options: one required question and one of two optional` / `Conversation: swap papers, type up their response, interview each other`. A short lead word, then the detail. Prose bullets are for one idea developing; label-first is for three parallel ones.
- **Reassurance comes out.** He deleted *"You do not need an answer yet. You need to start looking for one."* and *"This is not a question you get asked often, so it is allowed to be slow."* This is the same rule `writing-to-teach` states for activity pages: naming a worry and then soothing it puts both on the screen. **Alan keeps adding these. They keep getting cut.**
- **Timings are ranges.** "5-10 minutes", not "Ten minutes".
- **His own stake is first person.** The Commons slide became *"I am trying to build a platform that streamlines the process for strengthening our ability to have deep conversations"* — his project, named as his, with the loop it runs on (practice it · analyze it · learn and try again) and an honest ask: *"Today I would like to trial test one of the features."*
- **Point forward when a skill is coming.** *"We will explore asking good questions in the upcoming weeks"* — the activity gets its place in the arc rather than standing alone.
- **Sharpen an activity's question toward the skill being built.** His step 3 became *"What type of questions did they have? What makes some questions more useful for a conversation."* — moving the reflection off the topic and onto the questioning itself, which is the capability the course is actually after.

## The closing slide is Reminders

Not "This week". It carries what students need to be told, including the grading mechanics they will otherwise ask about one at a time:

- the graded item, with its due date;
- **OYP items do not affect the final grade** — except that they can substitute for something missed in the graded portion;
- **graded items carry a 10% late penalty, no exceptions**;
- the next session's shape;
- where to ask questions.

## Checklist (checkable by looking)

- One point per slide; a repeated sequence's payoff is on its own slide; a break has its own slide.
- No slide only asserts a belief — every claim sits on the slide that motivates it, and the why precedes the activity it justifies.
- Every step that uses a tool is that tool's slide, not a description of it.
- Headlines are claims, and carry nothing the slide's own furniture already says.
- "We" where the difficulty is shared; label-first bullets for parallel facts; no reassurance; timings as ranges.
- The closing slide is Reminders and states the OYP substitution rule and the late penalty.
- Run the whole deck against `writing-to-teach` — the no-telegrams rule catches most of what is left.

---

*Provenance — Human (Sathya): every move in this file, made as direct edits to the CST286 week-3 deck on 9 September 2026. AI (Alan): the deck those edits were made to, and this synthesis of them for his review.*
