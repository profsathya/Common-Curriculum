---
purpose: Active learning gaps, proposed interventions, and their status — the working tracker
last_updated: 2026-02-28
updated_by: claude-code
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

### GAP-6: Cognitive Overload & Finding Deliverables [ACTIVE]

**Problem:** Students struggle to extract the actionable "what do I submit?" from assignment pages that lead with motivational framing. The purpose/rationale content is valuable, but when deliverable details, submission format, due date, and grading weight are buried below it, students skim past the reasoning to hunt for logistics — and miss both.

**Evidence:** Cross-course content review (2026-02-28). Assignment pages vary widely: some lead with a Quick Start summary (effective), most bury submission details after 2-4 sections of scaffolding. Productive reflection time estimates (10-15 min) understate actual cognitive demand for multi-prompt exercises like CST395 W3 (closer to 30-40 min). Students who encounter inaccurate time estimates lose trust in the course's self-awareness.

**Proposed Interventions:**
1. Implement a universal Quick Start block at the top of every assignment page (time estimate, deliverable checklist, submission format/filename, due date, grading weight, 1-sentence "why")
2. Calibrate time estimates to actual cognitive demand — test by writing answers yourself
3. Add explicit quality signals ("what distinguishes good from adequate") to key assignments, starting with 5 Whys (directly addresses GAP-1 and GAP-3 simultaneously)

**Status:** Principle agreed. Implementation planned for Priority 2 content updates.

---

### GAP-7: Flow Friction & Trust — Dates, Dead-Ends, Placeholders [ACTIVE]

**Problem:** Students encounter trust-breaking friction in three forms: (1) hardcoded dates in HTML that can drift from Canvas/config when schedules shift, (2) "Under Construction" banners on pages linked from active sprint content, (3) placeholder pages for Sprint 3/4 that say "Don't do any work" without giving students any preview of what's coming.

**Evidence:** 200+ hardcoded date strings found across 84 HTML files (both courses). 15 pages display "Under Construction" banners, including the CST349 concepts page (a core reference) and several CST395 Sprint 1 assignments (build-log, human-value-statement, presentation, peer-reflection, bridge-reflection). Sprint 3/4 placeholder pages exist in both courses with no content beyond the warning banner.

**Proposed Interventions:**
1. Replace all hardcoded dates with `data-due-date` attribute bindings; client-side JS injects dates from config at render time. CSV remains the single source of truth (CSV → config.js → HTML data-attributes).
2. Build a validation script (`scripts/validate-content.js`) that flags hardcoded date strings and verifies all `data-due-date` keys exist in the CSV.
3. Replace Sprint 3/4 placeholders with MVP briefs (Purpose, Deliverable, Success criteria, Due date from config, Submission link).
4. Soften "Under Construction" banners on pages with substantial content to "This page may be updated — check back before your due date."

**Status:** Architecture agreed. PIPE-6 tracks the automation. Content fixes planned for Priority 1.

---

### GAP-8: Terminology Debt — Inconsistent Metaphors Across CST395 [ACTIVE]

**Problem:** CST395 uses competing metaphors inconsistently. Sprint pages are sometimes called "Blueprints," the home page uses "Studio" language, but URLs use `sprint-*.html`, and most content and all config files use "Sprint." Students in both courses encounter "Sprint" as the dominant term, making the Blueprint/Studio vocabulary confusing rather than clarifying.

**Evidence:** Cross-course content review (2026-02-28). CST395 `home.html` uses Studio framing; `sprint-1.html` uses Blueprint in its title but Sprint in its content; config files and CSV use Sprint exclusively. CST349 uses Sprint consistently throughout.

**Proposed Intervention:**
1. Standardize on "Sprint" as the canonical term across both courses (aligns with config, CSV, URLs, and CST349)
2. Add a mapping sentence where Blueprint/Studio language currently appears ("Blueprint 1 = Sprint 1") as immediate fix
3. Full search-and-replace pass to remove orphaned metaphors

**Status:** Decision made (instructor preference: keep "Sprint" as consistent term). Implementation planned for Priority 3.

---

## Operational / UX Gaps

These gaps relate to the student experience of navigating the curriculum as a digital product, distinct from the pedagogical learning gaps above.

*See also: → content-qa.md for the operational checklist that prevents these gaps from recurring.*

---

## Active Pipeline/Infrastructure Issues

### PIPE-1: Conversation JSON Extraction [FIXED]

**Problem:** Dojo session and ChatGPT export JSONs stored as raw JSON text truncated to 5000 chars. Analysis LLM evaluates JSON syntax, not student thinking.

**Fix:** Stage 3 prompt adds `extractConversationContent()` — detects 4 conversation formats, extracts [Student]/[AI] prefixed text, 15K char limit, new `conversation` contentType.

**Status:** Implemented. `extractConversationContent()` is live in submission-analyzer.js.

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

### PIPE-4: Anonymized Export [IN PROGRESS]

**Problem:** Analysis data contains student names. Need PII-stripped versions for external analysis and AI-assisted review.

**Fix:** Anonymized export runs automatically as part of `--action=full`. Outputs to `{dataDir}/anonymous/{course}/` with dashboards, analysis.json, and submissions.

**Status:** Claude Code prompt submitted.

---

### PIPE-5: Dashboard Homepage Redesign [IMPLEMENTED]

**Problem:** Current dashboard is flat list of assignments. Need 3-zone architecture: current sprint status, alerts/flags, deeper analysis.

**Fix:** 3-zone overview: (1) Sprint Status with submission rate, analysis coverage, avg quality, distribution bar; (2) Alerts & Flags with student alerts (consecutive missing, quality drops) and data quality warnings (flat 3/3 detection, unanalyzable counts, staleness); (3) Sprint Comparison table with color-coded deltas. Full student grid available via toggle. Applied to both main and anonymized dashboards.

**Status:** Implemented in `buildDashboardHTML()`. Both dashboards share the same rendering logic.

---

### PIPE-6: Automated Content QA / Due Date Consistency [PLANNED]

**Problem:** Manually hardcoding due dates in HTML causes student confusion when dates shift. Currently 200+ date instances across 84 HTML files. Any schedule change requires manually updating every affected page — a process guaranteed to produce drift.

**Proposed Intervention:**
1. Replace all hardcoded HTML date strings with `data-due-date="[assignment-key]"` binding attributes.
2. Add client-side JavaScript to each page that reads dates from the course config.js and injects them at render time.
3. Build `scripts/validate-content.js` that:
   - Flags any remaining hardcoded date strings (regex: `/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}/` and variants)
   - Verifies all `data-due-date` keys exist in the CSV
   - Checks for broken internal links between assignment pages
   - Can run as a pre-commit check or CI step

**Data flow:** `config/{course}-assignments.csv` (single source of truth) → `scripts/canvas-sync.js` → `config/{course}-config.js` → HTML pages read via `data-due-date` attributes at render time.

**Why this matters:** A single CSV edit propagates to Canvas (via API), config.js (via sync script), and all HTML pages (via data-binding) — no manual page edits needed for schedule changes.

**Status:** Architecture agreed. Awaiting implementation.
