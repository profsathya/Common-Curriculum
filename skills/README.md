# skills/ — course-design skills

The discipline files an AI assistant loads while helping design a CTI course. This folder holds the **design-level** skills — the ones about deciding what a course, its sprints, its modules, and its components should be. The operational skills that publish and assess a live course (Canvas builds, slides, submission evaluation, Dojo construction) stay in the CTI team repo (`cti-chief-of-staff/skills/`), which also carries the shared **Authoring rules** every new skill here is written against.

Each skill lives in its own subfolder as a `SKILL.md` with YAML frontmatter: a `name`, and a `description` written as the moment the skill should load. The body is self-contained.

**Status (8 August 2026).** The folder starts small on purpose: this README plus the four design-level skills that exist and have been grown from real course work. The scale skills below are named gaps. Each gets written the first time real work exercises it, so its content comes from use rather than from invention — `writing-to-teach/` is the first skill grown this way, promoted 8 August 2026 after passing its first test on the CST499 home page.

## The process these skills serve

A CTI course is built in eleven steps: frame the experiment first (the EDFG, and the qualities the course nurtures), lay the calendar out end to end, fill it with sprints, weeks, goals and activities, draft the home page and then the sprints in conversation with AI, publish each as a document the instructor edits directly — the two human gates — check the built work against the experiment design after each gate, and, once students are in the room, iterate weekly from their submissions and the metrics. The full process, step by step, is the "How we build a course" tab of the [landscape guidebook](../cti2.0/guidebooks/landscape.html).

Two decisions are settled and load-bearing here:

1. **One skill file per scale, not per verb.** Module, sprint and course are one file each, and each file carries four sections: design · implement · flow · alignment. Flow asks whether the thing hangs together on its own; alignment asks whether it serves the experiment design.
2. **Each level depends on the level below it.** A sprint skill assumes finished modules; a course skill assumes finished sprints. What gets tracked is decided once, with the experiment design, before anything is built — every alignment check reads against that rather than re-deciding it.

## The ladder — what lives here, what exists, what's a gap

Read bottom to top; each level takes the one below as its input.

| Level | Covers | Today |
|---|---|---|
| **L6 — The loop** | Weekly grading and assessment, and the iteration that follows from it | Assess half exists in the team repo (`evaluating-submissions`); the iterate half is a gap |
| **L5 — Course** | Designing the course by combining sprints; implement, flow, alignment | Gap as a skill; the method exists as the four-layer lock record used for CST286, CST349 and CST499 |
| **L4 — Sprint** | Designing a sprint by combining modules; implement, flow, alignment | Gap — will be written from the first sprint built through the process |
| **L3 — Module** | Designing, implementing, flowing and aligning one module | Design, flow and alignment are gaps; the build half exists in the team repo (`updating-canvas`, `slides`) |
| **L2 — Components** | Learning goals, assignments, discussions, activities | **`writing-learning-goals/` — here** · **`writing-assignments/` — here** (the Purpose–Task–Criteria shape + the schedule→page→Canvas pipeline). `dojo-design` is in the team repo; discussions have no skill yet |
| **L1 — Writing** | Plain, direct, action-oriented text that says why — and making things measurable | **`writing-to-teach/` — here** (the teaching half) · **`reviewing-course-text/` — here** (the cutting-and-tightening half); the measurable part is not written |
| **L0 — How to write these** | What a course-design skill should look like | Largely exists: Anthropic's `skill-creator` plus the team repo's Authoring rules |

## Current skills

- `writing-to-teach/` — how teaching text gets written in the first place: start from what the reader knows, has, and has attention for; reach all four engagement modes; keep teaching text and task text under their own rules; backbone visible, detours behind clicks. Triggers when drafting or revising any page that stands in for a lecture.
- `writing-learning-goals/` — the per-goal writing discipline: a learning goal is one sentence stating what the student does and why it matters, in plain student-facing language with no internal jargon or forward references. Triggers when writing or reviewing any learning goal on an activity, module, slide, or self-check.
- `writing-assignments/` — the assignment/activity page shape: Purpose · Task · Criteria · Reflection (adapted from the Transparent Assignment Template, Winkelmes 2013), the internal qualities line, and the pipeline the page lands in (`assignments.html` as source of truth → HTML page → Canvas iframe → reconcile; renamed from `schedule.html` 14 Aug 2026). Triggers when a decided assignment needs its student-facing page. Sits above the three L1 skills and calls them.
- `building-canvas-fall-2026/` — the Canvas-side build recipe for the three Fall 2026 CSUMB courses only: grade groups and weights, assignments from `assignments.html` rows, per-sprint type-split modules with submit requirements and the reflection gate, same-pass id write-back, publish and verification rules. Deliberately course-specific — whether other programs adopt a similar structure is left open; `updating-canvas` in the team repo stays the general skill.
- `hover-text/` — glossary bubbles on student-facing pages: when a term earns one, the why-and-inspiration-first register, placement (moment of action, never inside a link), the exact markup/CSS with the anchoring rule, and the after-rebuild survival check. Triggers when adding or revising hover text, when a draft introduces a coined term, and after any page rebuild.
- `reviewing-course-text/` — the final pass over any student-facing text before it reaches a live surface: map the message each sentence carries, cut what repeats across the stacked surfaces, drop sentences with no job, flip unnecessary negatives, and move each instruction to its point of action. Triggers at the end of any course-writing task.

## Adding a skill

Write it against the Authoring rules in `cti-chief-of-staff/skills/README.md` — one authoritative source; this file points rather than duplicates. Keep the body self-contained, describe the trigger as a moment, and close with a checklist only of things checkable by looking. Add a one-line entry to the list above.

---

*Provenance — Human (Sathya): the eleven-step process, the seven-level hierarchy, the one-file-per-scale and level-depends-on-level decisions, and the decision to start this folder with the two existing skills and grow the rest from live use. Human + AI: the four-verb shape (design · implement · flow · alignment) and the design-level vs operational split of the existing skills. AI (Alan): this README's drafting, from the process record in the landscape guidebook.*
