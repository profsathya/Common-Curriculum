---
purpose: Unresolved design tensions requiring discussion — the async conversation layer
last_updated: 2026-02-23
updated_by: sathya
status: active
---

# Open Questions

These are design tensions without clear answers. If you have a perspective, add it below the question with your name and date. If you disagree with the current direction, flag it — that's a trigger for a face-to-face conversation.

---

## OQ-1: Handwritten Reflections — Keep, Modify, or Replace?

**Tension:** Handwriting prevents AI-generated answers (real benefit for this population). But 60% of submitted work is unanalyzable photos/PDFs, creating a quality visibility black hole. We can't assess reflection depth at scale.

**Options on the table:**
- **Keep as-is:** Accept the visibility trade-off. Instructor reads handwritten work manually.
- **Photograph + typed summary:** Students submit photo AND type a 2-3 sentence summary of their key insight. Summary is analyzable; photo proves authenticity.
- **Switch to typed:** Full text, fully analyzable, but loses the AI-bypass protection.
- **Selective handwriting:** High-stakes reflections (bridge, sprint-end) stay handwritten. Weekly check-ins move to typed.

**Current leaning:** No decision yet. The 60% gap is a real cost.

---

## OQ-2: Should Analytical Depth Be a Gate or a Gradient?

**Tension:** Students proceed from 5 Whys → Solution Architecture → build phase regardless of quality. A shallow 5 Whys (2/5) produces a weak foundation that cascades through the sprint. But gating (you can't move on until your analysis is deep enough) conflicts with the course timeline and could demoralize struggling students.

**Options:**
- **Soft gate:** Automated flag (Dojo or script) surfaces "your chain appears to repeat — try this revision technique before submitting." Student sees the gap but isn't blocked.
- **Hard gate:** Instructor sign-off required before progression. Doesn't scale to 58 students.
- **Revision loop:** Students can resubmit with improvement for upgraded score. No gate, but incentive to deepen.
- **Accept and scaffold forward:** Don't gate. Instead, make each subsequent assignment surface the weakness (e.g., Solution Architecture prompt explicitly asks "what did your 5 Whys reveal that you didn't expect?").

**Current leaning:** Soft gate + revision loop seems most aligned with SDT (autonomy + competence). But untested.

---

## OQ-3: Dojo as Required Format vs. Structured Prompt as the Real Mechanism

**Tension:** Students are doing Dojo-assigned work in ChatGPT and getting equivalent (sometimes better) results. The structured prompt — not the Dojo platform — appears to be what drives depth. Requiring Dojo-format submissions adds friction (JSON export issues) without clear quality benefit.

**Options:**
- **Require Dojo:** Maintains data consistency, Dojo-specific features (constructs, partners), institutional control over the AI interaction.
- **Accept any AI tool with the structured prompt:** Lower friction, higher compliance. Loses Dojo metadata. Requires format-flexible submission handling (Stage 3 addresses this).
- **Dojo preferred, alternatives accepted:** Best of both? Or just confusing?

**Current leaning:** The structured prompt is the intervention. The platform is delivery. Probably not worth fighting students on format when the thinking is what matters.

---

## OQ-4: How to Implement "Moves" Without Creating Another Framework to Memorize

**Tension:** Gap 3 analysis shows students need specific techniques for going deeper (not just "go deeper" but "ask: what would have to be structurally different?"). But adding more named techniques risks compounding the conceptual overload problem (Gap 5). Students already juggle UMPIRE, 3Cs, 5 Whys, SDL/IS/AB.

**Options:**
- **Embed moves in assignments, not as named techniques:** "Before submitting, check: does each why introduce a new type of cause?" — not "use the Level Change Technique."
- **Teach one meta-move:** "When stuck, ask: am I repeating or advancing?" — a single diagnostic question applicable across assignments.
- **Reduce existing frameworks first:** Simplify the conceptual load, then add targeted moves.

**Current leaning:** Embedded, assignment-specific revision checks at point of submission. No new framework names.

---

## OQ-5: Sprint 3 Stakeholder Complexity — What External Means

**Tension:** Sprint 3 requires external stakeholders (CST395). This is a significant jump from partner work. Options range from "interview someone outside the class" to "work with a real client." The population (56% first-gen, many commuters) has limited professional networks. The external requirement could either stretch students productively or create anxiety that blocks engagement.

**No options formulated yet.** Need to discuss after Sprint 2 demos reveal how partnership work went.

---

## OQ-6: Group-Averaged Grading — Is It Working?

**Tension:** Sprint 2 uses group-averaged reflections (20%) and check-ins (20%) to incentivize collaboration. But if one partner is deep and the other is surface, averaging punishes depth and rewards compliance. We won't have data on this until Sprint 2 grading is complete.

**Watch for:** Does group averaging cause the deep student to carry the shallow student, or does it motivate the shallow student to step up? CST349 triads may show this more clearly than CST395 pairs.

---

*To add your perspective: write below any question with your name, date, and brief position. Keep it to 2-3 sentences. If you think a question needs face-to-face discussion, note that explicitly.*
