# Contributing to Common-Curriculum

This repo holds course content students actually see — Canvas pages, activities, assignments, rubrics, and the scripts that publish them. Team thinking, decisions, and meeting notes do **not** go here; they go in the team repo (`cti-chief-of-staff`). If you're unsure which repo, read `cti-chief-of-staff/docs/where-does-my-update-go.md`.

## The one rule (same as the team repo)

**Your change counts only when it is on `main`.** Merge your own PR in the same sitting, delete the branch, then open the file on `main` and confirm your change is there. Work left on an unmerged branch is invisible — a weekly report flags strays to their owners, but don't rely on it.

An interactive version of the how-to guides lives on the site: [cti2.0/guidebooks/](https://profsathya.github.io/Common-Curriculum/cti2.0/guidebooks/) — pick your task, pick your tool, follow the steps.

## Generated content — do not hand-edit

Parts of this repo are **build outputs from the `applying-ai-at-work` repo** (the "Applying AI at Work" De Anza courses): the hosted pages and activity JSON under `deanza/…` and `activities/deanza/…`. Their source of truth is Markdown in `applying-ai-at-work`; a protected workflow regenerates the files here. Hand-edits will be silently overwritten on the next publish. To change that content, work in `applying-ai-at-work` (plain-English request to Codex, "stop before Canvas", review, merge). See that repo's README.

## Before you change assignments

Assignment definitions follow a **CSV-first pipeline** (see [README.md](README.md)): `config/*.csv` is the source of truth, scripts generate the Canvas-side configuration, and GitHub Actions sync to Canvas. Practical consequences:

- To change an assignment's title, due date, or points: edit the CSV, not Canvas and not a generated file.
- New assignment: CSV row + HTML file in the right course folder, with the matching `data-assignment-key` (steps in README).
- Never hand-edit files the README marks as generated — the next sync overwrites them.
- After merging, check that the sync workflow ran (Actions tab) — merged-to-main is the finish line for the repo, but Canvas has its own last step.

## How to make a change

Step-by-step guides for each tool (claude.ai chat, claude.ai/code, Cowork, github.com) are in the team repo: `cti-chief-of-staff/docs/README.md`. They apply here unchanged. Short version: branch → PR → merge yourself right away → delete branch → see it on `main`.

Anything student-facing deserves one extra beat of review before merging: a broken activity page reaches students in the current course within hours, not weeks.
