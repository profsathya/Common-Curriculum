---
purpose: What this folder is, and where the current thinking actually lives
last_updated: 2026-08-13
updated_by: alan (cowork)
status: active
---

# Context Folder

Shared memory for the Common-Curriculum project: the findings, principles and open
tensions that took real work to learn and that a newcomer — human or AI — needs before
contributing.

It is deliberately small. **It does not hold the course design.** That lives in the
pointer map below, in one place per topic, and this folder points rather than repeats.
Rewritten 13 August 2026 for that reason: the folder had grown a parallel description of
the Spring 2026 courses and their pipeline, and by August it disagreed with the live
design in several places. Anyone reading it in good faith got the wrong answer.

## Where the current thinking lives

| If you need | Read |
|---|---|
| The Fall 2026 course design — outcomes, principles, evidence, grading, what is still to build | [`fall-2026-vision.html`](../fall-2026-vision.html) |
| How to write a student-facing page — teaching prose, learning goals, assignments, the final trim | [`skills/`](../skills/) |
| Every assignment in a course — week, points, due day, prerequisite, links | that course's `schedule.html` |
| What CTI as a whole is doing and why | [`cti2.0/guidebooks/landscape.html`](../cti2.0/guidebooks/landscape.html) |
| What students actually did, and what we learned from it | `evidence.md`, here |

Behind the vision page sits Sathya's dated decision record, in a private repo
(`cowork/fall-2026-courses/CONTEXT.md`). You do not need it — the vision page is its
readable view, and it is kept current. If the vision page and something here disagree,
the vision page is right and the file here needs fixing.

## What's in this folder

- **`evidence.md`** — anonymized findings from Spring 2026 student data. The strongest
  thing here. Read it before proposing an intervention; several obvious ideas are already
  tested and documented as not working.
- **`design-uncertainty.md`** — what we don't know about students and about what they'll
  need, and how to design anyway. Includes the three-population picture that most design
  arguments turn on.
- **`open-questions.md`** — design tensions still without an answer, plus the ones the
  Fall design settled and how.
- **`session-design.md`** — patterns that work for in-class delivery, from experience.
- **`student-relationship.md`** — how instructor presence and intent get communicated in
  course materials.
- **`science-of-computing.md`** — early-stage concept capture; the domain-knowledge
  question underneath CST286 and the SOSE redesign.
- **`index.html`** — open in a browser to read the above with navigation.

Files are Spring 2026 in origin unless dated otherwise. Each carries a scope line saying
what still holds.

## What was removed, and how to get it back

Eleven files were retired on 13 August 2026 — the CSV assignment pipeline and its QA
checklist, the sprint-page information-architecture spec, the terminology map, the gaps
tracker, the changelog, and the Sprint 2/3 trackers. All described machinery the Fall
courses no longer use, and the two that stated design rules (`course-design.md`'s
"actionability first, Quick Start block at the top of every page" and `terminology.md`'s
"the CSV is the single source of truth") had become actively wrong.

Nothing is lost. Every version is in git:

```
git log --diff-filter=D --name-only -- context/
git show <commit>^:context/course-design.md
```

The first command lists what was removed and when; the second reads any file as it was.

The working rule behind this, Sathya's: keep the files tight to current thinking while
the design is still moving, and use the repo history when you need to know what we
used to think.

## Working with student data

**No student names in any analysis, discussion, or AI conversation.** Use Canvas
anonymous IDs only (for example `CST395-07`, `CST349-23`). Student submissions and
analysis output live in a separate repo, `Common-Curriculum-Data`; use its `anonymous/`
subfolder, never the course directories.

## Updating this folder

Add a finding when you have one, with how you know it. Update a file's `last_updated`
and `status` when you touch it. If what you're writing is a course-design decision, it
belongs on the vision page instead — bring it to Sathya rather than filing it here, or
this folder starts disagreeing with the design again.
