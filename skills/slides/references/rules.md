# Building a session deck - the rules, and where they came from

_This is the reference behind `../SKILL.md`, the one-screen checklist run on every session deck before it reaches Sathya. Read this file once at the start; run the checklist on the output. Every checklist line traces to a section here. When a rule changes here, change its test in SKILL.md in the same edit; when a test is added there, its rule and the correction it came from go here. Version history is at the end._

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

## The sentence first

Before any slide is written, the sequence file states the one sentence a student should be able to say on leaving the room. Sathya writes or approves it. Every slide earns its place by moving toward that sentence; a slide that is true and useful but does not move toward it belongs on the home page or an assignment page. Origin: 9 Oct 2026, the CST349 week-8 deck. v1 and v2 had eight teaching slides and no such sentence, and Sathya said after presenting from decks like them that he had to improvise the thread in front of students and still did not land a clear message. His diagnosis, which these rules implement: the model holds many interconnected ideas and presents them together; human cognition follows one thread at a time. The sentence for that deck became "I need to think about the unique value I can convincingly defend to others when I interview, and plan how I spend the next six months to prepare for it."

## Start from the belief in the room

A logical chain assumes students arrive neutral. They do not. The sequence file also states what students believe when they walk in, in their own words where there is evidence (guide notes, chats, posts), and the first teaching slide puts that belief or objection on the screen and treats it as a fair question. A mindset shift is grounded in the students' emotional state, and repeating the argument, even a correct one, does not move it; the student has to meet the limit of the old belief themselves. Origin: 11 Oct 2026, after student guides reported "most of us don't have an internship experience yet and need to get past the initial screen first"; the deck opened on that sentence instead of on the method.

## The case, then the claim

Where the deck has to move a belief, the example that carries the teaching is a real prior student's case (Utsab's method): the offer, the answer that student could give, then the steps worked backward and dated so the slide reads bottom to top. The idea is named after the case, not before. The case must turn on the thing the old belief misses, or it teaches the old belief: a project that got someone in the door teaches "a narrow demonstration works" unless the breakdown shows the moment the project became a story someone remembered. Outside evidence sits beside the story as one slide with two numbers, pointing back to where students already met it, so the course is seen to build on itself. The question the deck answers is framed as a hypothesis in plain words: why this is the most useful activity right now, and the claim that, if true, makes the case; conditions that let students defer ("if a screening test is in your way, do that first") are left out, because they hand the room its default behavior back.

## One job per slide

A slide raises a question, shows one example, names one idea, or asks for one action. The sequence file carries a table: slide, job, the question it leaves open. The failure this prevents: slides written as a summary of the words file, each complete on its own (three bullets, three ideas), so the deck has no thread and the speaker improvises it. Completeness on a slide is the opposite of teaching; the slide should need the next one.

## Example before name

Carry one example through the teaching part of the deck and name the idea after students have seen it. Depth comes from one example walked all the way down, not from three ideas covered on each slide.

## One example, every track

One example carries the teaching, but the room is not one track. CST349 holds software engineering, cyber security, data science and game development students, and some whose goal is communication rather than a technical area. A case told only in software-engineering terms loses half the room at its first step, and a summary slide afterwards ("the same applies to you") does not get them back. So at every move the example makes (the answer, the depth, the reach across, each dated step) the slide carries one line for each other track showing the same principle in that setting, and the speaker says it as the story goes. The parallels are the same move in a different setting, not a second case. Origin: Sathya, 11 Oct 2026, on the v4 week-8 sequence.

## Takeaways move, they do not summarize

The bold takeaway line is kept only when it turns toward the next slide's question. A takeaway that restates the bullets above it doubles the load; cut it.

## The headline test

Read only the headlines, in order. If they tell the sentence's story on their own, the thread is in the deck and not in the speaker's head. A headline that is a topic label ("Working backwards") is rewritten as a step in the story ("What had to be true, six months before the offer").

## End in an action

The teaching part ends with one thing students do in the next ten minutes, so the idea lands in their own work the same hour.

## The closing slide is Reminders

Not "This week". It carries what students need to be told, including the grading mechanics they will otherwise ask about one at a time:

- the graded item, with its due date;
- **OYP items do not affect the final grade** — except that they can substitute for something missed in the graded portion;
- **graded items carry a 10% late penalty, no exceptions**;
- the next session's shape;
- where to ask questions.

## Checklist (checkable by looking)

- The sequence file opens with the leaving sentence and the belief in the room; every slide has one job and the table says which; one example carries the teaching part; headlines alone tell the story; the last teaching slide is an action.

- One point per slide; a repeated sequence's payoff is on its own slide; a break has its own slide.
- No slide only asserts a belief — every claim sits on the slide that motivates it, and the why precedes the activity it justifies.
- Every step that uses a tool is that tool's slide, not a description of it.
- Headlines are claims, and carry nothing the slide's own furniture already says.
- "We" where the difficulty is shared; label-first bullets for parallel facts; no reassurance; timings as ranges.
- The closing slide is Reminders and states the OYP substitution rule and the late penalty.
- Run the whole deck against `writing-to-teach` — the no-telegrams rule catches most of what is left.

---

*Provenance — Human (Sathya): every move in this file, made as direct edits to the CST286 week-3 deck on 9 September 2026. AI (Alan): the deck those edits were made to, and this synthesis of them for his review.*

## History

_Status: v1 (9 September 2026). Extracted from Sathya's direct edit of the CST286 week-3 deck (`alan/cst286-week3-deck-v4.pptx` → his Google Slides version, 9 Sep). The deck Alan built was 25 slides and correct in content; what he changed was almost entirely **shape and register**, and those changes are the content of this file._

_v2 (11 October 2026). Added the teaching-sequence rules from the CST349 week-8 deck: the sentence first, start from the belief in the room, the case then the claim, one job per slide, example before name, one example every track, takeaways move, the headline test, end in an action. Decided with Sathya on 9-11 Oct 2026 after v1/v2 of that deck carried information without a message; the deck was rebuilt as v3 (one example) and v4 (students' question, screening numbers, Utsab's case study)._
