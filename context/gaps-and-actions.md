---
purpose: Active learning gaps, proposed interventions, and their status — the working tracker
last_updated: 2026-02-23
updated_by: sathya
status: active
---

# Gaps & Actions

## Active Gaps

### GAP-1: Analytical Depth — Describing vs. Analyzing [ACTIVE]

**Problem:** ~70% of students produce 5 Whys chains that circle or rephrase rather than deepen. They are compliant (they write 5 whys) but can't distinguish going deeper from going sideways.

**Evidence:** → evidence.md, Gap 1

**Proposed Interventions:**
1. Show students a bad chain vs. good chain and have them *diagnose* which whys advance the analysis — builds recognition before production
2. Teach a specific "level change" move: "Ask yourself: what would have to be structurally different about my environment for this problem to disappear?"
3. Add a pre-submission revision check embedded in the assignment (not separate)
4. Better scaffolding on what constitutes a valid "deeper" why

**Status:** Designing for Sprint 3. No intervention deployed yet.

---

### GAP-2: Partner Work Reproducing Shallow Patterns [ACTIVE]

**Problem:** Students who didn't develop analytical depth in Sprint 1 apply the same shallow approach to their partner's problem in Sprint 2. The partner structure requires depth but doesn't teach it.

**Evidence:** → evidence.md, Gap 2

**Proposed Interventions:**
1. Close the Sprint 1 feedback loop before Sprint 2 partner work begins (students should know their 5 Whys was shallow before building on it)
2. Structure the discovery conversation itself with specific prompts that prevent surface-level exchanges
3. Consider whether analytical depth should be a gate (demonstrated before progressing) vs. a continuing development target

**Status:** Sprint 2 already launched. Interventions target Sprint 3 design.

---

### GAP-3: No Quality Reference Point [ACTIVE]

**Problem:** Students don't know what quality looks like. No exemplars exist. No formative feedback loop closes before the next assignment. The Dojo pushes for depth but compliance-mode students treat it as a checklist.

**Evidence:** → evidence.md, Gap 3

**Proposed Interventions:**
1. Create exemplar pairs (shallow vs. deep) for key assignments: 5 Whys, Discovery Doc, Goal Setting
2. Embed revision protocols at point of submission — not a separate page
3. Make the quality distinction explicit: "recognition → moves → persistence stance" framework
4. Redesign Dojo interaction to include self-check ("Did you go deeper than your first answer, or repeat yourself?")

**Status:** Principle identified. Implementation not yet designed.

---

### GAP-4: Evidence Interpreted as Feelings [ACTIVE]

**Problem:** Students interpret "provide evidence of change" as "describe how I feel about my progress" rather than citing specific behavioral moments.

**Evidence:** → evidence.md, CST349 exam analysis

**Proposed Intervention:**
Reframe evidence questions explicitly: "Describe a specific moment in the last 4 weeks where you acted differently than you would have before this sprint. What happened? If you can't name one, say so and explain why."

**Status:** Ready to implement in Sprint 2/3 assignments.

---

### GAP-5: Conceptual Overload (Sprint 1) [EXPLORING]

**Problem:** Students encounter UMPIRE, 3Cs, SDL/IS/AB, 5 Whys, Symbiotic Thinking, meta-habits all in Sprint 1. Many can't execute a single 5 Whys chain, let alone connect to the larger framework. Overwhelmed → compliance mode.

**Proposed Intervention:** Reduce framework count. Master 5 Whys/UMPIRE before encountering 3Cs. Sequential, not simultaneous.

**Status:** Exploring. Trade-off: progressive disclosure is a design principle, but current load may exceed what it can manage.

---

## Active Pipeline/Infrastructure Issues

### PIPE-1: Conversation JSON Extraction [IN PROGRESS]

**Problem:** Dojo session and ChatGPT export JSONs stored as raw JSON text truncated to 5000 chars. Analysis LLM evaluates JSON syntax, not student thinking.

**Fix:** Stage 3 prompt adds `extractConversationContent()` — detects 4 conversation formats, extracts [Student]/[AI] prefixed text, 15K char limit, new `conversation` contentType.

**Status:** Stage 3 prompt submitted to Claude Code. Awaiting implementation and re-run.

---

### PIPE-2: Custom Analysis Rubrics [IN PROGRESS]

**Problem:** Generic 1-5 scoring doesn't capture assignment-specific quality dimensions. A 5 Whys needs "chain progression" scoring; a Discovery Doc needs "partner evidence vs. assumption" scoring.

**Fix:** Stage 2 prompt adds per-assignment-type rubrics and upgrades analysis to Sonnet.

**Status:** Stage 2 prompt delivered. Run after Stage 3 (needs real data first).

---

### PIPE-3: 60% Unanalyzable Submissions [OPEN]

**Problem:** Handwritten reflections (photos/PDFs) are the primary driver of unanalyzable submissions. Quality data represents <40% of actual student work.

**Options explored:**
- Require typed reflections (loses AI-bypass benefit of handwriting)
- Photograph AND type 2-sentence summary
- OCR pipeline (technically possible but quality uncertain for handwriting)

**Status:** No decision made. See → open-questions.md.

---

### PIPE-4: Anonymized Export [COMPLETE]

**Problem:** Analysis data contains student names. Need PII-stripped versions for external analysis and AI-assisted review.

**Fix:** Anonymized export runs automatically as part of `--action=full` and `--action=dashboard`. Outputs to `{dataDir}/anonymous/{course}/` with analysis.json, dashboard.html, and submissions/. Name replacement uses word boundaries to clean text fields (summaries, qualityNotes). Dashboard shows anonymous IDs as display names.

**Status:** Implemented. Functions: `buildNameReplacementMap`, `anonymizeAnalysis`, `anonymizeSubmissions`, `generateAnonymizedExport`.

---

### PIPE-5: Dashboard Homepage Redesign [PENDING]

**Problem:** Current dashboard is flat list of assignments. Need 3-zone architecture: current sprint status, alerts/flags, deeper analysis.

**Fix:** Stage 1 prompt ready.

**Status:** Independent of Stages 2-3. Can be implemented anytime.
