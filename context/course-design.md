---
purpose: Course structure, frameworks, sprint design, grading — the stable design decisions and their rationale
last_updated: 2026-02-24
updated_by: sathya
status: active
---

# Course Design

## Two Courses, One Framework

**CST395 — AI-Native Solution Engineering** (4 units, ~20 students)
Students solve real problems using AI tools. The core question: *can you use AI to attempt things you couldn't before, not just do existing things faster?*

**CST349 — Professional Seminar** (2 units, ~58 students)
Professional identity and Self-Directed Learning. The core question: *who are you becoming, and what's your evidence?*

Both serve a population that is 56% first-generation and 45% community college transfer, drawn from 60+ institutions. This shapes everything — we can't assume shared academic norms around analytical depth, self-assessment, or metacognitive practice.

## Theoretical Foundation

**Self-Determination Theory (SDT)** drives the sprint structure:
- **Autonomy**: Expanding stakeholder complexity gives students progressively more choice
- **Competence**: Each sprint builds on demonstrated capability, not assumed readiness
- **Relatedness**: Partner/group work and peer conversations create accountability

**Symbiotic Thinking Framework** — Three interdependent layers:
- **Mindset**: Creating vs. consuming spectrum (are you directing the AI or following it?)
- **Metacognition**: 3Cs framework — Context (what's the situation?), Choices (what are my options?), Confirmation (how do I verify?)
- **Motivation**: DIKW pyramid — moving from raw Data → Information → Knowledge → Wisdom

## Sprint Progression

### CST395 (Expanding Stakeholder Complexity)
| Sprint | Focus | Stakeholder | Key Capability |
|---|---|---|---|
| 1: Foundation | Solve your own problem | Self | Problem analysis, 5 Whys, solution architecture |
| 2: Mirror | Solve a partner's problem | Assigned partner | Discovery conversation, empathy, building for someone else |
| 3: Complexity | Solve for an external stakeholder | External (TBD) | Requirements gathering, real constraints |
| 4: Mastery | Full autonomy | Student-chosen | Integration of all capabilities |

### CST349 (SDL Progression)
| Sprint | Focus | Structure | Key Capability |
|---|---|---|---|
| 1: Beyond Technical | Identify a soft skill gap | Solo | Self-assessment, 5 Whys on personal gap |
| 2: Accountable Growth | External accountability | Triads | Group rules, peer evaluation, evidence of change |
| 3: Transfer | Technical curiosity | TBD | Connecting SDL to domain learning |
| 4: Proving It | Portfolio defense | Solo | Synthesizing evidence across sprints |

## Key Frameworks Students Use

**UMPIRE**: Understand → Map → Plan → Implement → Review → Evaluate
- Students currently skip Review and Evaluate (see → evidence.md, Gap 3)
- The Review/Evaluate steps are where quality improvement happens

**3Cs**: Context → Choices → Confirmation
- Metacognitive scaffolding for AI interaction
- Not yet deeply integrated into student workflow

**5 Whys**: Root cause analysis technique
- Sprint 1 anchor assignment for both courses
- Current major gap: students go sideways, not deeper (see → evidence.md, Gap 1)

**Symbiotic Thinking Dojo**: AI sparring partner (hosted on Netlify)
- Students submit Dojo session exports as JSON files
- Designed to push for depth, but compliance-mode students treat it as Q&A (see → evidence.md)

## Grading Structure (Both Courses)

- 20% per sprint (4 sprints = 80%)
  - 20% Goal Setting
  - 40% Reflections (group-averaged in Sprint 2+)
  - 40% Demo
- 10% Final Defense
- 10% Participation

Sprint 2 adds:
- Group-averaged reflections (20%) and check-ins (20%) to incentivize collaboration
- Individual accountability maintained for demos (40%) and goals (20%)

## Course Infrastructure

- **GitHub Pages** (profsathya/Common-Curriculum): HTML pages embedded in Canvas via iframes
- **Canvas**: LMS for submissions, grading, announcements
- **Netlify Functions**: Host Dojo AI sparring partner with Anthropic API
- **Google Apps Script**: Peer conversation tracking and form automation
- **Analysis Pipeline**: Node.js script that downloads Canvas submissions, runs them through Claude API for quality scoring, generates dashboards (see → pipeline.md)

## Design Principles

1. **Identity before task** — "Who am I becoming?" frames every sprint before "What am I doing?"
2. **Experience before framework** — Students encounter a challenge, then learn the framework that addresses it
3. **Progressive disclosure** — Previous sprint content stays visible; new content builds on it
4. **Discovery over instruction** — The 3Cs framework guides students to insights rather than telling them answers
5. **Hand-written reflection** — Physical notebooks for reflections prevent AI bypass (trade-off: 60% of work is unanalyzable by script — see → pipeline.md)
6. **Specificity over generality in assignments** — Generic instructions ("find sources," "research the domain") produce generic work. Assignments that name the specific domains, provide starting sources, and show concrete weak-vs-strong examples produce dramatically better student output. The Domain Learning Plan (ASSIGN-1) demonstrated this: providing a curated reference page with the 4 actual problem domains students are working in — with real sources, myth/reality framing, and investigation questions — sets a quality floor that "go find sources" never achieves. For this population, specificity is scaffolding. Design each assignment to be as specific to the actual student context as possible.
