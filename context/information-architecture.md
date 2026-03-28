---
purpose: Documents the sprint page information architecture redesign and its pedagogical rationale
last_updated: 2026-03-28
updated_by: claude-code
status: active
---

# Sprint Page Information Architecture

## The Problem

Sprint pages mixed orientation content (philosophy, grading, learning outcomes) with weekly tactical content (assignments, due dates, session plans) in one long vertical scroll. This created two failure modes:

1. **Students skip orientation to find due dates.** When the "what do I need to do" answer is buried below paragraphs of framing, students learn to scroll past everything to find the transactional content. The framing — which exists to help them understand why assignments matter — never gets read.

2. **Instructors model skipping.** When projecting the sprint page in class, the instructor scrolls past their own content to find the session plan. Students watch this and internalize that the text isn't worth reading.

The homepage suffered the inverse problem: it tried to be a personalized dashboard but had nothing students couldn't get faster from Canvas. It was bypassed entirely.

## Design Principles

### "What do I need to do" is the entry point, not the enemy
Grounded in: Self-Determination Theory (autonomy) — students engage more deeply when they choose to explore context, not when it's forced as a prerequisite.

Students visit course pages with one question: "what do I need to do?" Treating this as shallow misunderstands adult learning behavior. The redesign answers this question in under 5 seconds (Layer 1), then offers progressively deeper context for students who want it (Layers 2-3).

### Progressive disclosure over information density
Grounded in: Cognitive Load Theory (Sweller, 1988) — extraneous cognitive load from irrelevant-in-the-moment information reduces learning from relevant information.

Each assignment row is scannable (title, type, due date) with a one-click expansion revealing how it connects to the course arc. Students who want the transactional list get it instantly. Students who want context get it one click deeper. The click is genuine curiosity, not a tollbooth.

### No gating
Grounded in: Hansen et al. (2025) findings on forced AI interaction producing adverse effects; SDT autonomy research.

The other-LLM proposal to gate assignment access behind required interaction with philosophy text was rejected. Gating removes autonomy, signals distrust, and turns framing content into a tollbooth. Students who game it (click-through without reading) learn the philosophy is an obstacle, not valuable content. The redesign uses invitation, not compulsion.

### Accuracy by default
Grounded in: Practical observation — the homepage became useless because it was inaccurate. One wrong due date teaches students the page can't be trusted.

All dynamic content renders from the config, which is auto-generated from the CSV. If the CSV has correct dates, the page is correct. No manual HTML editing for weekly updates. The `briefing` field per assignment is the only hand-authored content in the weekly rendering.

### Never return null
Grounded in: Practical observation — during spring break and inter-week gaps, the old `getCurrentWeek()` returned null, showing blank or stale content.

The week resolution logic always returns the most recent valid week, with a banner explaining the gap (e.g., "Spring break — Week 11 starts April 8"). Students always see useful content.

### Journey arc as orientation, not decoration
Grounded in: Goal-setting theory (Locke & Latham) — visible progress toward a clear destination increases motivation.

The four sprint pills show where students have been and where they're going. Past sprints are clickable for retrospective summaries (2 sentences about what was built and what capability emerged). The current sprint is prominent. Future sprints show what's ahead. This replaces the dead homepage as the "where am I" surface.

### Still-due items are visible but not punitive
Grounded in: SDT (competence) — highlighting failure without agency to address it undermines motivation, especially for first-generation students.

Past-due assignments show as a collapsed indicator ("2 items from earlier weeks") rather than an open red list. Students who are caught up don't see it. Students who are behind see a gentle nudge, not a wall of shame. They click to expand if they want details.

## Structure

### Sticky week counter
Minimal "Week X of 16 · Sprint N: Name" bar pinned at top. Pure orientation, no interaction.

### Zone A: Sprint orientation
- Journey pills (always visible, never collapse)
- Sprint summary panels (expand when pill is clicked)
- Collapsible details: sprint context, grading, assignment reference table, week navigation tabs

### Zone B: Weekly briefing
- Week header with prev/next navigation (constrained to sprint weeks)
- Gap banner (spring break, inter-week gaps)
- Looking-back / looking-forward cards
- Weekly question (provocative, not motivational)
- Assignment groups: still-due (collapsed), this week, coming up
- In-class session link
- Why This block (Loom video + instructor framing)

### Home page redirect
home.html detects current sprint and redirects to sprint-X.html#zone-b. Pre-semester shows course overview.

## Notes Page (AI-Native Solution Engineering Notes)

### Problem
Continuous scroll forced students to scroll past completed phases to find new content. No way to track what was new.

### Solution
Phase box navigation at top — clickable pills representing the instructor's actual process chunks (U+M, P, P+I, etc.). Only one section visible at a time. LocalStorage remembers last-viewed section. First visit defaults to U+M.

Sections are data-driven — defined in a JS array at the top of the file. Adding a new section requires: (1) add the HTML content panel, (2) add an entry to the sections array, (3) update the changelog.

### Design decision: process chunks, not UMPIRE letters
The instructor's actual UMPIRE process produces natural bundles (U+M together, P+I together) rather than clean single-letter sections. Showing these bundles teaches students that UMPIRE is iterative in practice — you revisit phases, you combine steps. This is pedagogically more honest than forcing six discrete boxes.
