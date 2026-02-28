---
purpose: Definition of Done checklist for publishing assignment and sprint pages — the quality gate
last_updated: 2026-02-28
updated_by: claude-code
status: active
---

# Content QA Checklist

Before deploying a new or significantly revised assignment, sprint, or activity page, it must pass this checklist. This ensures the Product Experience Principles (→ course-design.md) are consistently applied and the UX gaps (→ gaps-and-actions.md, GAP-6/7/8) don't recur.

## Assignment Pages

### Quick Start Block (top of page, immediately after `<h1>`)
- [ ] **Time estimate** — Realistic for the cognitive demand, not just the mechanical task
- [ ] **Deliverable checklist** — What exactly the student submits (numbered if multiple items)
- [ ] **Submission format** — Accepted file types and filename pattern (e.g., `lastname-s1-five-whys.pdf`)
- [ ] **Due date** — Uses `data-due-date="[assignment-key]"` binding, not hardcoded text
- [ ] **Grading weight** — Points or percentage clearly stated
- [ ] **One-sentence "why"** — Brief motivational framing (1 sentence max in the Quick Start; full framing follows below)

### Content Body
- [ ] **No hardcoded dates** — All dates use `data-due-date` attributes. Regex check: no matches for `/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}/` or day-of-week + date patterns
- [ ] **Dependency links** — If this assignment requires prior work, a "Before you start" callout links to the prerequisite assignment
- [ ] **Quality signals** — For key assignments (5 Whys, Discovery Doc, Human Value Statement), a "What distinguishes good from adequate" section with 2-3 concrete indicators
- [ ] **Reflection numbering** — Uses sprint-prefixed format: S1-R1, S2-R4, etc. (not just "Productive Reflection #1" which collides across sprints)
- [ ] **Upload instructions explicit** — If the assignment requires file upload, the exact source of the file is stated (e.g., "Download your Dojo session export as JSON" or "Photograph your handwritten notebook pages")

### Styling & Structure
- [ ] **Uses shared stylesheet** — `../css/shared-styles.css` (not extensive inline styles with hardcoded colors)
- [ ] **Consistent with design system** — Uses CSS variables (`var(--cst395-primary)`, etc.), not hardcoded hex values
- [ ] **No "Under Construction" banner** — If content is incomplete, use MVP brief format instead (see Sprint/Placeholder Pages below)

## Sprint Overview Pages

- [ ] **All linked assignments exist** — No links to placeholder or under-construction pages without MVP brief content
- [ ] **Week structure clear** — Each week section shows: concepts, assignments with due dates (from config), and session info
- [ ] **Dates from config** — Sprint dates, week dates, and assignment due dates all use data-binding
- [ ] **Terminology consistent** — Uses "Sprint" (not Blueprint/Studio). See → terminology.md

## Sprint/Placeholder Pages (Future Sprints)

If a sprint's assignments aren't yet fully designed, the page must still contain a **Minimum Viable Brief** with:
- [ ] **Purpose** — 1-sentence description of the sprint's focus
- [ ] **Deliverable** — 1-sentence output requirement
- [ ] **Success criteria** — 3-4 bullet points of what success looks like
- [ ] **Due date** — From JS config (or "Dates TBD" if not yet in CSV)
- [ ] **Submission link** — Placeholder `href` or Canvas ID
- [ ] **No "Don't do any work yet" language** — Replace with "Details will be refined based on feedback from earlier sprints. The structure below shows what to expect."

## Activity / Prep Pages

- [ ] **Clear output description** — What the student will produce and how it connects to the next assignment
- [ ] **File export instructions** — If the activity generates a downloadable file, step-by-step export instructions with expected filename

## Session / Slides Pages

- [ ] **Student-facing sections identified** — If the page mixes facilitator notes with student content, student-facing sections are clearly marked or separated
- [ ] **Key takeaways extractable** — A student revisiting the page can find the core points without reading through all 16+ slide sections

---

## Automated Checks (PIPE-6)

When `scripts/validate-content.js` is implemented, it will automate:
1. Hardcoded date detection (regex scan)
2. `data-due-date` key validation (cross-reference against CSV)
3. Broken internal link detection
4. "Under Construction" banner detection in active sprint content

Until then, run these checks manually before merging any content PR.

---

*This checklist is a living document. When a new UX gap is identified, add the corresponding check here so it doesn't recur.*
