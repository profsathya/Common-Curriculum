---
purpose: Early-stage concept capture — Science of Computing as foundational domain knowledge for AI-augmented builders
last_updated: 2026-03-03
updated_by: sathya
status: early-stage investigation
sources: CS Working Group prep session (March 2, 2026) + SOSE 2026 redesign session (March 2, 2026)
---

# Science of Computing — Concept & Working Notes

This file captures an emerging idea that may shape CST395 Sprints 3–4, SOSE 2026, and broader CTI 2.0 curriculum design. Nothing here is settled. The purpose is to preserve the thinking so it doesn't get lost while investigation continues.

---

## The Core Problem

A student builds a working task management app with AI in 90 minutes. It stores data in flat JSON, has no separation of concerns, handles one user at a time, and swallows errors silently. Concurrent use corrupts data. The student doesn't know to ask whether any of this is wrong. The app runs. It looks finished.

This isn't a prompting failure — better AI tools won't fix it. The student is missing something fundamental about how computing works: how systems behave under real conditions, how to reason about whether something that *runs* is actually *sound*. This gap exists **upstream of any AI tool usage**.

**Key distinction:** Symbiotic Thinking teaches how to work with AI effectively (Context, Choices, Confirmation). Science of Computing teaches what you need to know so that your AI partnership produces sound systems, not just working ones.

---

## What Science of Computing Is (and Isn't)

**What it is:** The underlying principles that govern how computational systems behave. The ability to reason about whether a working system is actually sound. The phrase is deliberate — not "computer science," which activates a mental model of courses, textbooks, and degree requirements. Science of Computing reopens the question of what matters.

**What it isn't:** A programming course. Not traditional CS prerequisites renamed. Not CS1/CS2/Algorithms in new packaging.

**Candidate domains (still under investigation):**
- **State** — Why a flat file and a database aren't interchangeable; what happens when multiple processes touch the same data
- **Composition** — Working pieces don't automatically make a working whole; reasoning about where the seams are
- **Fitness evaluation** — Not just "does it run" but does the structure match the problem; what happens when conditions change
- **Reasoning about the invisible** — Edge cases, failure modes, scale effects, security surfaces, error propagation
- **Architectural tradeoffs** — Separation of concerns, coupling, design debt

**Caveat:** This list emerged from two conversations and one scenario. It may be incomplete, may include things that don't belong, and may miss the actual core. The CS Working Group needs to define this properly.

---

## Relationship to SDL/IS/AB

SDL, IS, AB and Science of Computing are **different dimensions, not competing frameworks.**

- SDL/IS/AB describe **how students operate** (meta-capabilities, process)
- Science of Computing describes **what students need to understand** (domain knowledge, substance)

A student exercises SDL *while* learning to reason about system architecture. A student operates as an Integrative Solver *while* connecting architectural constraints to user needs. You don't choose between them. Science of Computing should not be merged into the capability framework — they strengthen each other but serve different functions.

**CS-specific expressions of the capabilities:**
- **SDL in computing:** Rapidly navigating unfamiliar codebases, docs, and APIs; knowing when to read vs. delegate to AI
- **IS in computing:** Connecting technical constraints to human needs; architecture decisions informed by stakeholder context
- **AB in computing:** Specifying, verifying, and iterating on AI-generated solutions; scope management in complex systems

---

## Two Layers: Universal and Practitioner

There may be two distinct layers. This is the newest and least-developed idea.

### Universal Layer (everyone, all disciplines)

Computational reasoning as a citizen of an AI-augmented world. Increasingly, everyone builds with AI. A nonprofit program manager who uses Claude to build an app faces the same broken-task-management-app problem. They don't need to redesign the architecture, but they need enough understanding to **ask the right questions** — to not accept "it runs" as equivalent to "it's sound."

Possible content:
- Systems have state, and state can be corrupted
- Data has structure, and structure choices have consequences
- Composition isn't automatic — working pieces don't make a working whole
- What you see in a demo isn't what you get under real conditions
- "It works" and "it's good" are different claims

**This layer could sit inside Durable Foundations 101** — giving it *substance* alongside the *process* capabilities (Symbiotic Thinking, SDL/IS/AB). Both the CS team and the Durable Foundations team would build it together.

### Practitioner Layer (CS/SWE specific)

Going deeper into *why* things behave the way they do and *how* to reason about designing them differently. Architecture, scalability, formal evaluation, system composition at depth. Sits **alongside** Durable Foundations 102/103 as a parallel path, not on top of it.

### Distinguishing the layers

The line isn't clean. "How state works" is universal at one level (data can be corrupted) and practitioner-specific at another (concurrency models). The distinction may be better defined by **what decisions the person needs to make:**
- **Universal = "can I trust this?"**
- **Practitioner = "can I fix or redesign this?"**

---

## The Bootstrapping Problem

The traditional CS sequence (CS1 → CS2 → Data Structures → Systems) was designed for an AI-free world. Students learned architectural reasoning as a **byproduct** of implementing things by hand over years. That path worked. But it was never designed to coexist with tools that generate implementation instantly.

We cannot put students in an AI-free world — not in principle and not in practice. They have AI tools. Industry expects them to use AI tools. If the only path to sound reasoning is a multi-year implementation-heavy sequence, students will build with AI long before they finish it — and they'll build badly without knowing it.

**The honest question:** Can we develop the same foundational understanding through a different path — one that works *with* AI from the start? We don't know yet. But we won't find out if we assume the old path is the only one.

**Design principle:** Everything that is not a law of physics should be on the table. Course names, outcomes, lengths, sequences, the idea of semesters, the idea of prerequisites, the assumption that concept X must precede concept Y because that's how textbooks ordered it. Build bottom-up from the problem.

---

## Two Approaches in the Field

**Approach A — Integrate AI into existing curriculum.** Keep CS1, CS2, algorithms, software engineering; add AI tools. The UCSD-led Consortium (teachcswithai.org) is a well-funded example. Their CS1 still organizes around syntax, loops, data types — same learning outcomes, now with Copilot. Makes sense for CS departments adapting an existing catalog.

**Approach B — Rethink what's worth learning.** Start from what computing professionals actually need to understand and build from scratch. Harder, less proven, riskier. CTI's space — because we're not a CS department with a course catalog to protect.

These may complement each other: A figures out how to make existing programs better today; B figures out what the next generation should look like. Learn from A's pedagogical techniques (assessment redesign, overreliance mitigation, pair programming with AI). But CTI's job is B.

**Sequencing concern for teachcswithai workshops:** Sending team members without pre-framing risks confirming the attachment we're trying to loosen — they return saying "the experts are keeping CS1/CS2 intact." Send people *after* establishing our own framing internally, so they go as evaluators, not learners. Sequencing problem, not a binary decision.

---

## SOSE 2026 Dependency

SOSE 2026's Sprint 2 asks students to propose a system-level issue — not a surface feature but something requiring reasoning about how the system works at an architectural or design level. The quality ceiling of Sprint 2 is directly limited by students' ability to reason about system behavior.

**With computing foundations:** Student discovers OED's data model assumes single-site deployment, preventing multi-campus energy comparison — a real user need.

**Without computing foundations:** Student discovers OED needs dark mode.

The jump from surface-level to system-level is qualitative, not quantitative. **But this is an assumption, not a proven claim.** Summer 2026 data should test it.

### Why SOSE shouldn't carry the teaching load

SOSE's power is authentic engineering context — real projects, real maintainers, real stakes. Turning it into a vehicle for teaching foundational concepts compromises that authenticity. The moment Sprint 2 becomes "learn about data modeling" instead of "discover what users actually need," it stops being intrinsically motivating (SDT: autonomy, relatedness). SOSE has a dependency on computing foundations. It should not carry the teaching load for them.

### Summer 2026 approach

The full Science of Computing experience won't be ready by summer 2026. For this cohort: **SOSE pre-work carries a targeted computing foundations layer** — activities that develop system-level reasoning before Sprint 2. Sprint 2 Dojo scaffolding also includes computing-reasoning prompts alongside user-needs analysis.

One possible framing: guided analysis of real systems for failure modes. "Here's a working app built with AI — where will it break? How would you know?"

**What exactly this layer contains is still being investigated.** How much can fit in 10–15 hours of pre-work alongside Dojo activities and project selection is an open question.

### 2027+ trajectory

If Science of Computing matures into a standalone offering, it becomes a natural prerequisite for SOSE. Summer 2026 is the baseline measurement — which students go deeper in Sprint 2? What differentiates them? That signal directly informs what the foundations experience needs to produce. **SOSE 2026 is not just a program but a research instrument for the broader initiative.**

---

## The Tacit Knowledge Problem with the CS Team

The CS team members likely already possess Science of Computing capabilities — developed through years of writing code. But this knowledge is **tacit**: fused with practice so thoroughly they can't see it as separable. They've never had to name "evaluating whether a computational model captures the real-world problem" as a standalone skill because it was always bundled inside "implement a solution and see if it works."

**Consequence:** Asking "what are the fundamental CS concepts students need?" produces a course catalog (data structures, algorithms, OOP) because that's the only vocabulary they have. They need an **experience** that forces the separation before they can contribute to the design.

**Possible approach:** Give them a complex, ambiguous problem and have them solve it *only* by directing AI — no typing code themselves. Then have them articulate what was hard. The hard parts (specifying precisely, evaluating architectural soundness, recognizing technically-correct ≠ contextually-right, deciding what to test) — *that's* the curriculum. They'll surface it themselves if the experience forces it.

**Reframe for resistance:** We're telling people whose expertise is being commoditized. That's real. But they already know the things that matter most — they've been teaching the *byproduct* of that knowledge rather than the knowledge itself. Their conceptual knowledge is the valuable thing. What changes is the pedagogy.

**Tactical note:** Don't pre-populate the exceptions list (what genuinely requires hands-on implementation). Let them argue for specific exceptions and hold each to a standard of evidence. Pre-populating it gets treated as a concession and expanded.

---

## CTI 2.0 Learning Experience Architecture

How Science of Computing fits in the broader structure:

- **Durable Foundations 101** (shared prerequisite, everyone): Symbiotic Thinking basics — 3Cs, UMPIRE, productive reflection, Superagency + Human Value. Common language installation. *Possibly includes the universal computing literacy layer.*
- **Durable Foundations 102/103** (discipline-neutral path): SDL/IS/AB through discipline-neutral problems. AD's team designs.
- **Science of Computing Foundations** (practitioner path): SDL/IS/AB through computational reasoning. Runs **alongside** 102/103 as a parallel path, not after it.
- **Applied experiences** (SOSE, Nano-Internships, etc.): Depend on Durable Foundations and (for CS students) Science of Computing readiness. Vehicles for demonstrating capabilities, not developing foundational understanding.

**Crossover requirement:** If the CS path diverges too far, you lose the integrative value of CS students learning alongside non-CS students. Part of IS is encountering genuinely different perspectives. Need deliberate crossover points — peer conversations, shared deep work sessions, shared demonstrations — even when content paths are parallel.

---

## Illustrative Module: The Architect's Eye

*Shows the kind of thing we'd build in the practitioner layer. Not prescriptive.*

**Concept:** Evaluating system design when you didn't write the code. 2 weeks.

**Setup:** Students receive the task management app from the core scenario — working, passing tests, built by AI. Their job is to figure out what's wrong that a demo won't show.

- **Week 1 — Evaluation:** Read spec and code (AI helps with explanation). Map architecture. Identify: does structure match problem? What breaks under real use? Hidden assumptions? Produce an Architectural Assessment — what's sound, fragile, wrong.
- **Week 2 — Redesign Proposal:** Propose specific changes with tradeoff analysis. Direct AI to implement one change. Verify the result. Peer review targets reasoning quality, not code.

**Why it matters:** In an AI-augmented profession, the most common task isn't building from scratch — it's evaluating, maintaining, and improving systems you didn't write. Traditional pedagogy spends most time on implementation. This skips to the judgment.

**Portfolio evidence:**
- Superagency: "I evaluated and improved a system I couldn't have built from scratch in this timeframe."
- Human Value: "AI built it — my judgment determined it wasn't good enough, and I specified what better looks like."

**Strategic value:** This module provokes useful pushback ("but how do they evaluate if they've never built?") — which forces the CS team to articulate which aspects of building are essential for developing judgment vs. which are just how they happened to learn. That's the tacit knowledge surfacing.

---

## Decisions Made So Far

| Decision | Rationale | Status |
|----------|-----------|--------|
| Use "Science of Computing" not "Computer Science" | Avoids activating course-catalog mental model; reopens the question | Settled for now |
| SOSE 2026 pre-work carries targeted foundations layer | Full experience won't be ready; pre-work can raise the floor | Decided for summer 2026 |
| Build toward standalone prerequisite for 2027 | Cleanest separation; SOSE shouldn't carry the teaching load | Direction, not commitment |
| Science of Computing is separate from SDL/IS/AB framework | Different dimensions (domain knowledge vs. meta-capabilities) | Settled for now |
| CTI pursues Approach B (rethink what's worth learning) | Not a CS department; freedom to think fundamentally | Settled for now |
| Everything not a law of physics is on the table | Course names, outcomes, lengths, sequences, all open | Design principle |
| Part 1 briefing shared with CS team first; Part 2 held back | Create the gap before offering a direction | Tactical |

---

## Open Questions

### Definitional

**SOC-Q1: What does "foundational computing reasoning" actually mean in an AI-augmented context?**
We have a scenario and candidate domains but no rigorous definition. The CS Working Group needs to define this.

**SOC-Q2: Is "where will it break?" the right framing?**
Possibly too narrow or negative. May miss dimensions of computing reasoning that matter.

**SOC-Q3: What's the relationship to the abstraction ladder?**
AI commoditizes lower rungs (syntax, implementation); human value moves to higher rungs (architecture, purpose). Science of Computing seems to live in the middle — understanding *how* systems work, not just *that* they work, but not yet at *why* they should exist. Where exactly?

### Structural

**SOC-Q4: Does the two-layer model (universal + practitioner) hold up?**
Or does it create more confusion than clarity? Is the universal layer part of Symbiotic Thinking or its own thing?

**SOC-Q5: Where does the universal computing literacy layer live?**
Inside Durable Foundations? Standalone? Does it have enough substance?

**SOC-Q6: How does this relate to the De Anza certificate?**
The two courses ("Problem Understanding with AI" and "Solution Building with AI") launching April 2026 may overlap with or inform this work.

### SOSE-Specific

**SOC-Q7: How much can fit in 10–15 hours of pre-work?**
Pre-work already includes Dojo activities and project selection. Must be targeted enough to raise the Sprint 2 floor without becoming a course.

**SOC-Q8: Is a pre-work layer sufficient, or does Sprint 2 require readiness only a longer experience can build?**
Won't know until summer 2026 data.

**SOC-Q9: What's the minimum effective dose?**
Smallest intervention that moves students from surface-level to system-level discovery.

**SOC-Q10: Will every curated project have discoverable system-level issues?**
We believe yes for non-trivial open source, but needs validation during project pool curation.

**SOC-Q11: How do we instrument Sprint 2 to measure the foundations effect?**
Need to capture what differentiates students who find system-level issues vs. surface features. This data shapes 2027.

### Validation

**SOC-Q12: How do we validate the alternative path works?**
What evidence would convince a skeptic that students who learn through evaluation/verification develop the same foundational understanding as students who learned through implementation?

**SOC-Q13: What genuinely requires hands-on implementation?**
The question for the CS team — but don't answer prematurely. Let them generate exceptions and hold each to evidence.

**SOC-Q14: What's the minimum viable version of Science of Computing Foundations?**
One module? Three? What tests the approach before committing?

### Institutional

**SOC-Q15: Who owns the Science of Computing investigation?**
CS Working Group composition and authority aren't defined.

**SOC-Q16: Does Science of Computing Foundations eventually become its own CTI program?**
If so: timeline, delivery model (async Dojo? synchronous? hybrid?), first students?

**SOC-Q17: Sequencing with AD's Durable Foundations effort.**
How to keep parallel efforts coherent without stepping on each other. The universal computing layer is the integration point.

---

## Documents Referenced

- **Part 1 briefing (1 page):** Scenario, bootstrapping problem, two approaches, Science of Computing teaser. For CS team meeting (March 2, 2026). Creates discomfort without resolving it.
- **Part 2 briefing (1 page):** Science of Computing expanded, Architect's Eye example, "What This Group Will Do." Share after Part 1 has landed.

---

*Last updated: March 3, 2026*
