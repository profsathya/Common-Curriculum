---
purpose: Anonymized findings from student data analysis — what we know and how we know it
last_updated: 2026-02-23
updated_by: sathya
status: active
---

# Evidence

All findings use Canvas anonymous IDs only. No student names.

## Data Sources Analyzed

| Source | Course | Coverage | Method |
|---|---|---|---|
| analysis.json (Sprint 1) | Both | CST395: 9 assignments, CST349: 9 assignments | Automated Claude API scoring (1-5 scale) |
| analysis.json (Sprint 2) | Both | CST395: 17 assignments, CST349: 15 assignments | Automated scoring — **Sprint 2 CST395 data was stale until Feb 23 re-download** |
| 5 Whys quiz CSV | CST395 | 14 students | Manual analysis of reasoning chains |
| Solution Architecture quiz CSV | CST395 | 14 students | Manual analysis of design decisions |
| Skills Assessment Revision CSV | CST349 | 84 students | Manual analysis of self-assessment depth |
| Dojo session exports (Sprint 1) | CST395 | 13 sessions | Manual analysis of engagement depth (turns, words, progression) |
| Discovery Doc uploads (Sprint 2) | CST395 | 14 submissions | Manual analysis of partner conversation processing |
| Goal Setting Part II uploads (Sprint 2) | CST395 | 15 submissions | Manual analysis of goal specificity and evidence use |
| Assumption Audit uploads (Sprint 2) | CST395 | 8+ submissions | Manual analysis |
| Sprint 1 handwritten exam | CST349 | ~58 students | Manual grading and pattern analysis |

**Important caveat:** ~60% of all submitted work across both courses is unanalyzable by the automated pipeline (handwritten reflections submitted as photos/PDFs). Quality scores represent <40% of actual student work. See → pipeline.md for the technical gap.

---

## Gap 1: Students Cannot Distinguish Describing a Problem from Analyzing It

**Evidence strength: Strong** (multiple data points, both courses)

### 5 Whys Analysis (CST395, Sprint 1)

14 students analyzed. Bimodal distribution:

- **3-4 students** produce chains where each "why" introduces a structurally different cause. One student traces procrastination to conscious context-switching deficits and links it to existing planning habits. Another traces music composition paralysis through entropy → fear of failure → need for structured learning partitions.
- **~10 students** produce chains that circle, rephrase, or stay at the willpower/discipline level. Common patterns:
  - Circular: "I forget" → "I focus too long" → "I get stubborn" → "I spent too much time" (restates the problem at each level)
  - Willpower framing: "Lack of focus" → "maybe stressed" → "need more discipline" (never reaches structural/environmental causes)
  - Environmental-only: "Distractions" → "phone access" → "wifi in room" → "buy alarm" (addresses symptoms, not systems)
  - Non-progressive: "I don't like water" → "I don't like water" → "I'm busy at work" (chain doesn't advance)

### CST349 Sprint 1 Exam (Handwritten)

~15% of students showed genuine progressive reasoning in their 5 Whys. ~10% provided real behavioral evidence of change. The rest performed the exercise without the thinking it's supposed to produce. Students were compliant — they wrote 5 whys — but couldn't distinguish going deeper from going sideways.

### Superagency Challenge (CST395, Sprint 1)

73% fundamentally misunderstood the concept. 11 of 15 analyzable submissions scored 1-2/5. Students treated "superagency" as "AI helps me do existing tasks better" (drinking water, waking up, procrastination) rather than "AI enables attempting things previously impossible." Zero students articulated the distinction.

### Solution Architecture (CST395, Sprint 1)

Same bimodal pattern. 4 students produced specific friction analyses with trade-off reasoning and concrete MVPs. ~10 students produced one-sentence answers or willpower-framed solutions with no architecture.

---

## Gap 2: Sprint 2 Partner Work Reproduces Sprint 1's Shallow Patterns

**Evidence strength: Moderate** (CST395 manual analysis; CST349 Sprint 2 data pending fresh analysis)

### Discovery Doc Analysis (CST395, Sprint 2 — 14 submissions)

Students who couldn't analyze their own problem deeply applied the same shallow approach to their partner's problem:

- **Deep** (~4 students): Specific partner quotes, distinguished stated vs. real problem, planned follow-up conversations to go deeper. One student moved from "bad time management" to "overcommitted across clubs — needs a tradeoff process, not a planner."
- **Working through it** (~5 students): Moderate depth, some specifics from partner conversation, but didn't push past surface-level problem description.
- **Surface** (~5 students): One-sentence problem descriptions with no partner evidence. One student hit "I cannot recall" when the Dojo pushed for specifics from the conversation — the partner conversation itself was too shallow to build on. Another student's 12-turn Dojo session averaged 13 words per turn.

### Goal Setting Part II (CST395, Sprint 2 — 15 submissions)

The deep students continued deep; the shallow students continued shallow. One student's ChatGPT session shows genuine AI pushback integration ("Where did willingness to drop/pause come from — did they say it?") with responsive revision. Multiple compliance-level submissions answered all five questions in under 155 words total.

### Key Insight

The theory behind Sprint 2 is that solving someone else's problem forces deeper analysis because you can't rely on assumptions. But for students who never learned analytical depth on their own problem, they just replicate shallow patterns with someone else's problem. The partner structure *requires* depth — it doesn't *teach* it.

---

## Gap 3: Students Don't Know What Quality Looks Like

**Evidence strength: Strong** (consistent across all data sources)

### No Exemplars, No Feedback Loop

Students submit shallow work → move to the next assignment → build on a weak foundation. Nothing in the current workflow surfaces the quality gap before progression. A student's 5 Whys scores 2/5, but they proceed to Solution Architecture without knowing their analysis was circular.

### Dojo Engagement Patterns (CST395 Sprint 1)

13 sessions analyzed. The Dojo pushes for depth, but:

- **4 genuinely deep sessions**: One student contributed 12,388 words across 19 turns — genuine thinking partner engagement. Three others showed substantive depth with self-correction.
- **Compliance pattern**: One student had 28 turns but only 629 total words (22 words/turn). The Dojo pushed deeper on every turn; the student repeated their previous answer with minor rewording. Session ended with "do I meet all requirements." The Dojo created an opportunity for depth — the student experienced it as a checklist.
- **Minimal engagement**: One student pasted a prompt template (2 turns, 54 words), stopped when pushed. Another: empty submission.

The Dojo **reveals** who already has depth. It doesn't **create** depth for those who don't have it yet.

### "Evidence" Interpreted as Feelings

Both courses show students interpreting "evidence of change" as "how I feel about my progress" rather than observable behavioral evidence. The CST349 exam showed this clearly: students wrote movingly about personal challenges (childhood experiences, social anxiety, family dynamics) but very few made the leap from self-knowledge to actionable design. One student who recognized they physically make themselves small (hunching, avoiding eye contact) and proposed deliberately seeking situations requiring communication — that's the leap. Roughly 10% made it.

---

## Quality Distributions

### CST349 Sprint 1 (Automated Scoring — 196 rated submissions)

| Score | Count | Percentage |
|---|---|---|
| 1/5 (minimal/misunderstood) | 56 | 29% |
| 2/5 (below expectations) | 44 | 22% |
| 3/5 (surface-level) | 29 | 15% |
| 4/5 (good) | 34 | 17% |
| 5/5 (excellent) | 33 | 17% |

**51% below expectations. 34% shows genuine engagement (4-5/5).**

### CST395 Sprint 1 (Automated Scoring — 53 rated submissions)

| Score | Count | Percentage |
|---|---|---|
| 1/5 | 7 | 13% |
| 2/5 | 15 | 28% |
| 3/5 | 8 | 15% |
| 4/5 | 9 | 17% |
| 5/5 | 14 | 26% |

43% at 4-5/5, but inflated by Sprint 1 Demo Discussion where 17/19 scored 4-5. Remove that outlier and distribution matches CST349.

### CST395 Student Tiers (Manual Analysis, Sprint 1-2 combined)

- **Consistently deep**: ~4 students (~20%). Structural insights, self-correction, cross-assignment connections.
- **Working through it**: ~5 students (~25%). Moderate depth, some specifics, don't push past first-level answers.
- **Surface/compliance**: ~6 students (~30%). Minimum viable responses, vague language, no self-correction.
- **Insufficient data**: ~5 students (~25%).

---

## Students Using ChatGPT Instead of Dojo

Multiple students completed Dojo-assigned work in ChatGPT, submitting ChatGPT exports or links. One explicitly stated: "I just need a json to submit since ChatGPT's json export is weird." This isn't cheating — the structured prompt is the same. But it means Dojo session data captures only a fraction of actual AI-assisted thinking. Quality metrics based solely on Dojo usage undercount engagement.

---

## Key Principle: Exemplars + Moves + Persistence Stance

Analysis of what separates deep from shallow students suggests three components, all necessary:

1. **Recognition** (exemplar) — "What does quality look like?" Students can't aim for depth they've never seen.
2. **Moves** (technique repertoire) — "When my chain repeats, I ask: what would have to be structurally different about my environment for this problem to disappear?" Specific, concrete, assignment-level techniques.
3. **Persistence stance** — "Quality is improvable through revision. I submit when I can't improve further, not when the form is filled in." The deep students have an internal revision loop; the course needs to teach it explicitly.

These connect to UMPIRE's Review/Evaluate steps. Students skip R/E because they feel like extra work rather than the learning itself. Making revision protocols concrete and assignment-specific is higher leverage than teaching R/E abstractly.

→ See open-questions.md for unresolved design tensions around implementing this.
