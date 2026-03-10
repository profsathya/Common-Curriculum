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
   - Hosted on Loom; link inserted as `LOOM_VIDEO_URL_PLACEHOLDER` until recorded

2. **2–4 sentences of written framing** in instructor's voice
   - Not institutional ("this activity develops your metacognitive skills")
   - Personal stakes: what he's observed when students engage seriously vs. phone it in
   - Signed "— Prof. Sathya"

## What NOT to Do

- **No gate / acknowledgment checkbox** before content — compliance theater, undermines autonomy (SDT)
- **No AI-generated analogies presented as instructor's voice** — students recognize them
- **No long justification paragraphs** — the video does the trust work; the text is a signpost

## HTML Component

Insert immediately after `<div class="container">` and before `<p class="breadcrumb">` in every new assignment file. Use course accent color: teal `#14b8a6` for CST395, blue `#3b82f6` for CST349.

```html
<!-- WHY THIS BLOCK -->
<div style="background: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 20px; align-items: flex-start;">
    <a href="LOOM_VIDEO_URL_PLACEHOLDER" target="_blank" rel="noopener" style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; text-decoration: none;">
        <div style="width: 72px; height: 72px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <span style="font-size: 11px; color: #0f766e; font-weight: 600; text-align: center; line-height: 1.3;">Watch before<br>you start</span>
    </a>
    <div>
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #134e4a; line-height: 1.6;">[WRITTEN_FRAMING — instructor's voice, 2–4 sentences]</p>
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

* `LOOM_VIDEO_URL_PLACEHOLDER` stays in the file until instructor records and provides the URL
* When the URL is ready, run a targeted Claude Code prompt to replace the placeholder in the specific file(s)
* Written framing must be drafted by instructor, not generated — it is his voice, not a course document
