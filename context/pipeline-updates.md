---
purpose: Actionable pipeline and infrastructure work items — next technical session queue
last_updated: 2026-02-24
updated_by: sathya
status: active
---

# Pipeline Updates

Actionable items for next technical session. For pipeline architecture and existing stages, see pipeline.md.

---

## PIPE-7: AI-Discussion Rubric Rework [QUEUED]

**Problem:** Current rubric rewards conversation arc — which the AI guarantees. AI-discussion submissions average 4.3/5 while student-authored work averages 2.1/5. The rubric measures "did a good conversation happen?" not "what did the student contribute?"

**Required change:** Custom rubric should score student contributions independently:
- What claims did the student make?
- What evidence did they cite?
- What connections did they draw?
- NOT "did the conversation follow a productive arc"

**Depends on:** Stage 2 custom rubrics (PIPE-2) being the vehicle for this change.

---

## PIPE-8: Remaining Flat 3/3 Scores [QUEUED]

**Problem:** Students with participation=1 (missing/late) still show 3/3 in some cells. These should be null, not flat scores.

**Root cause:** Bug 1 fix (activity config resolution) addressed the majority of flat 3/3 scores, but edge cases remain where participation flags aren't properly gating the scoring.

**Fix:** Add a pre-scoring check — if participation=1, set all sub-scores to null before analysis runs.

---

## PIPE-9: Bug 2 — Filename-as-Text [QUEUED]

**Problem:** ~17 CST349 submissions still affected. Pipeline ingests the uploaded filename as the submission text content instead of extracting the actual file contents.

**Status:** Not addressed in latest update. Needs investigation — likely a content-type detection issue where the upload handler falls through to the filename-only path.

---

## PIPE-10: Analysis Prompt — Deeper Insight Extraction [QUEUED]

**Problem:** Current analysis prompt produces quality scores (1-5). It should extract diagnostic insights, not just a number.

**Required extractions per submission:**
1. What partner problem was identified
2. What cognitive moves the student made (projection, evidence/inference confusion, solution-first thinking)
3. What the student admitted they don't know
4. The gap between conversation richness and deliverable quality

**Why this matters:** Scores tell us who's struggling. Diagnostic insights tell us *how* they're struggling — which determines the right intervention. A student who projects their experience needs different help than a student who can't distinguish evidence from inference.