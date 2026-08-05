# Course context docs

Every course folder in this repo can publish itself to a single Google Doc.
The doc holds the full text of the course site in plain language, so a student
can hand the whole course to an AI assistant as context and then ask questions
about their own work.

One folder, one doc. `cst499/` syncs to the CST499 doc; adding `cst286/` to the
config gives it its own.

## How it works

1. A push to `main` that touches `<course>/*.html` triggers
   `.github/workflows/sync-course-docs.yml`.
2. The workflow works out which course folders actually changed and syncs only
   those. A change to the builder or the config re-syncs every course.
3. `scripts/build_course_context.py <course>` reads every `.html` under that
   folder — including subfolders like `assignments/` and `sessions/` — strips
   the interactive scaffolding (tooltips, icons, accordions, navigation), and
   emits a JSON payload. Tooltip definitions are pulled out and collected once
   in a glossary at the end. Top-level pages come first, then subfolders
   alphabetically.
4. The workflow adds the shared token and POSTs the payload to a Google Apps
   Script web app.
5. The Apps Script clears that course's doc and rebuilds it.

**The doc is downstream.** The HTML is the source of truth. Anything typed into
the doc is gone at the next push. That is deliberate — it is what lets the doc
stay current without anyone maintaining it.

## Setup

Four steps, and only the first three need doing once.

### 1. Create the docs

One empty Google Doc per course. Note each document ID — the long string in the
URL between `/d/` and `/edit`.

Share each one **Anyone with the link · Viewer** so students can open it without
individual permissions.

### 2. Deploy the Apps Script

1. Create a standalone Apps Script project.
2. Paste in `apps-script/CourseDocSync.gs`.
3. Under **Project Settings → Script properties**, add:
   - `COURSE_DOC_SYNC_TOKEN` — any long random string
   - `COURSE_DOC_IDS` — a JSON map, e.g.
     `{"cst499":"1AbC...","cst286":"1XyZ..."}`
4. Deploy as a web app. Execute as **yourself**; access **Anyone**. The token in
   the payload is what actually guards it.
5. Copy the deployment URL.

Your Google account must have edit access to every doc listed in
`COURSE_DOC_IDS`.

Redeploying can mint a new URL. If it does, update the repository secret.

### 3. Add the repository secrets

In **Settings → Secrets and variables → Actions**:

- `COURSE_DOC_SYNC_URL` — the Apps Script web app URL
- `COURSE_DOC_SYNC_TOKEN` — the same string you put in script properties

### 4. Add a course

Add an entry to `config/course-docs.json`, and its doc ID to `COURSE_DOC_IDS`
in Apps Script. `order` is optional: pages you do not list are appended after
the ones you did, so a new page never breaks the sync.

`skip` takes a full relative path (`assignments/draft.html`), a bare filename
(`draft.html`), or a folder prefix with a trailing slash (`archive/`) to drop a
whole subfolder.

`titles` keys on either the relative path or the bare filename. Anything
untitled gets a readable one derived from its path, e.g. `assignments/s1-w2-five-whys.html`
becomes "assignments · s1 w2 five whys".

## Running it by hand

Preview what a course doc will say, without touching Google:

```bash
python3 scripts/build_course_context.py cst499 --dry-run
```

Write the payload to disk:

```bash
python3 scripts/build_course_context.py cst499 --output cst499-context.json
```

Force a sync from GitHub: **Actions → Sync course context docs → Run workflow**.
Leave the course blank to sync every configured course, or name one.

## Troubleshooting

**`unknown_course`** — the course is in `config/course-docs.json` but not in the
`COURSE_DOC_IDS` script property.

**`invalid_token`** — the repository secret and the script property have drifted
apart. Redeploy the web app if you changed deployment settings.

**Nothing happened on push** — the workflow only fires on `<course>/*.html`. Use
the manual trigger, or check whether the folder is in the config.

**A page came out thin** — the builder understands the accordion layout used by
the sprint pages and falls back to reading every text block for anything else.
Run `--dry-run` and read the output; if a section is missing, the page is using
a structure the builder has not seen.
