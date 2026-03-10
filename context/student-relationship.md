---
purpose: Design principle for how instructor presence and intent is communicated to students in course materials
last_updated: 2026-03-10
updated_by: sathya
status: active
---

# Student Relationship: The "Why This" Layer

## The Problem

The courses are technically rigorous but students perceive them as assembled by a process rather than built by a person who cares about them. This gap matters especially for a student population that is 56% first-generation and 45% community college transfer — students who are more skeptical of institutional distance and need visible human investment before extending trust.

Students know Claude was used to build the course. Polished, structured content confirms that suspicion. The solution is not to hide this — it's to make instructor's personal reasoning visible before the activity demands anything from the student.

## The Solution: Personal Opening Block

Every new assignment and activity HTML file should open with a personal framing block containing:

1. **A short video** (target ~1–1.5 min, phone camera acceptable, no production needed)
   - instructor looking at camera, in his own voice, not scripted
   - Content: why he built this activity, what he hopes students discover
   - Hosted on Loom; embedded inline via `LOOM_VIDEO_ID_PLACEHOLDER` until recorded

2. **2–4 sentences of written framing** in instructor's voice
   - Not institutional ("this activity develops your metacognitive skills")
   - Personal stakes: what he's observed when students engage seriously vs. phone it in
   - Signed "— Prof. Sathya"

## What NOT to Do

- **No gate / acknowledgment checkbox** before content — compliance theater, undermines autonomy (SDT)
- **No AI-generated analogies presented as instructor's voice** — students recognize them
- **No long justification paragraphs** — the video does the trust work; the text is a signpost

## HTML Component

Insert immediately **after** `<p class="breadcrumb">` (below the Home / Sprint 2 / … line) and before the assignment title/content in every new assignment file. Use course accent color: teal `#14b8a6` for CST395, blue `#3b82f6` for CST349.

```html
<!-- WHY THIS BLOCK -->
<div style="background: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 12px; padding: 24px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.12); display: flex; gap: 24px; align-items: flex-start;">
    <div style="flex-shrink: 0; width: 220px;">
        <div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.15);">
            <div style="position: relative; padding-top: 56.25%; background: #0d9488;">
                <!-- Loom embed: replace LOOM_VIDEO_ID_PLACEHOLDER with the Loom video ID -->
                <iframe src="https://www.loom.com/embed/LOOM_VIDEO_ID_PLACEHOLDER" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
            </div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #0f766e; font-weight: 600; text-align: center;">~1 min &middot; Why I built this</p>
    </div>
    <div style="padding-top: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #134e4a; line-height: 1.6;">[WRITTEN_FRAMING — instructor's voice, 2–4 sentences]</p>
        <p style="margin: 0; font-size: 13px; color: #0f766e; font-style: italic;">— Prof. Sathya</p>
    </div>
</div>
```

For CST349, swap `#14b8a6` → `#3b82f6`, `#f0fdfa` → `#eff6ff`, `#0f766e` → `#1d4ed8`, `#134e4a` → `#1e3a8a`.

## Content Framework

Before writing the framing text for any new activity, instructor should be able to answer:

1. **The problem this solves** — what capability gap does this address? (1 sentence, concrete)
2. **The stakes** — what happens to students who skip or phone this in? (1 sentence, specific)
3. **The bet** — what does instructor hope students discover by doing this? (1 sentence)

If these three questions don't have clear answers, the activity design should be revisited before building the HTML.

## Workflow Rule

* `LOOM_VIDEO_ID_PLACEHOLDER` stays in the iframe `src` until instructor records and provides the Loom video ID (the part after `loom.com/share/`)
* When the ID is ready, run a targeted Claude Code prompt to replace the placeholder in the specific file(s)
* Written framing must be drafted by instructor, not generated — it is his voice, not a course document
