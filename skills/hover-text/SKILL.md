---
name: hover-text
description: Use when adding or revising hover text (glossary bubbles) on any student-facing course page — a home page, assignment page, design page, or sprint page; when a draft introduces a coined or course-specific term (Sprint Exam, baseline, Goal Plan, Symbiotic Thinking); and after any page rebuild, to verify the existing bubble layer survived. Covers when a term earns a bubble, the why-first register, placement, the exact markup and CSS, and the two-reader rule (student + AI Dojo).
---

_Status: v1 (16 August 2026). Grown from the first hover-text pass over the three Fall 2026
home pages (`cowork/fall-2026-courses/hover-text-review-2026-08-16.md` holds the worked
review), including one lost-layer incident and one mispositioned-bubble bug that this file
exists to prevent. Register rule confirmed by Sathya 16 August 2026._

# Hover text

A hover bubble is a small explainer attached to a term, opened by hover, keyboard focus, or
tap. It exists because a course page has **two readers**: a student who skims and needs the
idea at the moment of action, and the student's **AI Dojo**, linked to the live course
documents, which reads every line and can re-teach a bubble's content in conversation. Write
every bubble as a declarative statement an AI coach could act on — that is not a side effect,
it is half the audience.

## When a term earns a bubble

Give a term a bubble when at least one of these is true:

1. **It is acted on where it appears.** The student must do something with the term right
   there (book a check-in, write a baseline, declare a pillar) and the explanation lives on
   another page they will not open.
2. **It carries course-specific meaning.** A dictionary or a lecture-free guess gets it wrong:
   Sprint Exam, graded item, mechanism, Goal Plan, problem space, Symbiotic Thinking.
3. **It names a coined structure the page repeats weekly.** Recurring block titles (🌱 Own
   your progress guidance · 🎯 Graded item) carry their bubble at every occurrence on
   purpose — a student landing at week 9 gets the same on-time refresher as one at week 1.

Leave a term alone when its row already explains it in place, when the page already bubbles
it twice (a third dashed instance reads as noise), or when the content is deliberately
planted for a live session rather than the page. Dashed underlines lose their pull when they
are everywhere.

## The register — why and inspiration first

Start with why and inspiration rather than a raw description (Sathya, 16 August 2026). The
first row can define, but the definition itself should carry the payoff. The worked example —
Own your progress:

> *What it is.* Your weekly practice: activities that develop the habits and skills of taking
> ownership of your own success.
> *Why practice it.* Here you apply it to the goals of this class — but the practice makes you
> more self-directed everywhere, able to set and accomplish goals in any context. That opens
> doors: people like working and partnering with someone who takes ownership.

Not: "one to three ungraded activities per week." The mechanics ride behind the why, or on
the page chrome (the "· not graded" hint) instead of in the bubble.

## Format

A bold title, then two or three labeled rows, each label italic, one to three sentences per
row. Draw labels from the established set so bubbles read as one voice across pages:
*What it is.* / *What it means.* · *Why it matters.* / *Why practice it.* / *How it counts.* ·
*What a good one looks like.* / *What you do with it.* / *What happens next.* Simple, direct,
plain language — the same teaching register as the page (see `writing-to-teach/`).

## Placement

Attach the bubble at the moment of action, once per block. In a week block, prefer the
session row over repeating the same term on the 🎯 row below it. Never nest the bubble
button inside a link (`<a>`) — registry-linked assignment titles are links; put the bubble on
a nearby plain-text mention instead, rephrasing minimally if none exists.

## Markup and CSS — copy exactly

```html
<span class="gl"><button type="button" class="gt">TERM</button><span class="bub"
role="tooltip"><b class="bt">Title</b><span class="br"><i>What it is.</i> …</span><span
class="br"><i>Why it matters.</i> …</span></span></span>
```

CSS-only: hover, `:focus-within`, and tap all work with no script, and print hides bubbles.
The page must already carry the `.gl` / `.gt` / `.bub` rules (every Fall 2026 page does).
Two rules to verify every time:

1. **Anchoring.** `.bub` is `position:absolute` and anchors to the nearest positioned
   ancestor. The container holding your term must be in the page's `position:relative` list —
   for the weekly block that is `.wsec-head, .wbody, .wday-body, details.wday > summary`.
   A bubble whose container is missing from that list renders at the top-left corner of the
   page (found live, 16 August 2026).
2. **Colored heads.** Inside a colored section head, add
   `.wsec-head .gt{border-bottom-color:currentColor;}` so the dashed underline takes the
   section's color.

Known and accepted: a bubble button inside a `<details>` summary also toggles the row on
click; hover and keyboard focus are unaffected.

## After any rebuild

Bubbles live inside generated pages, and parallel sessions rebuild those pages. Before
editing, re-read the file as it is on disk now. After any page rebuild, verify the layer
survived: search the file for `class="gl"` and count against the previous version — a
missing layer is silent (the 8/14 title bubbles were lost exactly this way).

## Checklist — checkable by looking

- Every bubble term passes one of the three earns-a-bubble tests; none duplicates a row that
  already explains it in place.
- First row carries why or payoff, not bare mechanics.
- Title + 2–3 labeled rows, labels from the established set.
- No bubble button nested inside an `<a>`.
- The term's container appears in the page's `position:relative` list; focus the button in a
  browser and the bubble opens adjacent to it, not at the page corner.
- Rendered check: tag balance clean; one bubble opened via keyboard focus in a screenshot.
- `class="gl"` count recorded in the design log entry for the change.

---

*Provenance — Human (Sathya): the two-reader purpose (pages program the AI Dojo), the
why-and-inspiration-first register, the specific bubble texts this grew from. Human + AI: the
earns-a-bubble tests, placement rules, and format. AI (Alan): the markup/CSS mechanics and
this file's drafting, from the 16 August 2026 review pass.*
