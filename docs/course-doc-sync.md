# Course context docs

Every course folder in this repo can publish itself to a single Google Doc.
The doc holds the full text of the course site in plain language, so a student
can hand the whole course to an AI assistant as context and then ask questions
about their own work.

One folder, one doc. `cst499/` syncs to the CST499 doc; adding `cst286/` to the
config gives it its own.

## Two tabs

Each doc has two tabs, and they sync independently:

| Tab | Holds | Rewritten when |
| --- | --- | --- |
| **Course** | that course's pages | one of that course's pages changes |
| **Dojo** | the Dojo Core plus every module | any `dojo-*.txt` changes |

The Dojo tab is identical in all three docs. That is the point of splitting
them: editing `dojo-core.txt` refreshes the Dojo tab in every course doc
without rebuilding a single page of course content, and editing a course page
never touches the Dojo tab.

Attaching the doc to an AI assistant picks up **both** tabs — the "Current tab
only" default applies to the manual File → Download dialog, not to a tool
reading the document.

**Tabs cannot be created by script.** Google's API can write into a tab that
exists but cannot make one. Add the two tabs by hand once per doc, and keep
their titles matching the `tabs` block in `config/course-docs.json` — the sync
finds them by title, so renaming a tab in Google Docs breaks that doc until the
config catches up.

## How it works

1. A push to `main` that touches `<course>/*.html` or a `dojo-*.txt` triggers
   `.github/workflows/sync-course-docs.yml`.
2. The workflow works out which *tabs* actually need rewriting — a course page
   edit produces one job, a dojo edit produces one job per course. A change to
   the builder or the config re-syncs both tabs everywhere.
3. `scripts/build_course_context.py <course> --section <course|dojo|all>` builds
   the payload. For the Course tab it reads every `.html` under the course
   folder — including subfolders like `assignments/` and `sessions/` — strips
   the interactive scaffolding (tooltips, icons, accordions, navigation), and
   pulls tooltip definitions into a glossary at the end. For the Dojo tab it
   reads the `dojo-*.txt` files, using each file's first line as its heading so
   the version shows in the doc.
4. The workflow adds the shared token and POSTs the payload to a Google Apps
   Script web app.
5. The Apps Script clears **only the tabs named in the payload** and rebuilds
   them, leaving every other tab untouched.

**The doc is downstream.** The repo is the source of truth. Anything typed into
a synced tab is gone the next time that tab syncs. That is deliberate — it is
what lets the doc stay current without anyone maintaining it.

## Setup

Four steps, and only the first three need doing once.

### 1. Create the docs

One Google Doc per course. In each, open **View → Show tabs & outline** and make
two tabs named exactly `Dojo` and `Course` — Dojo first, so an assistant reads
how to behave before it reads the material.

Note each document ID — the long string in the URL between `/d/` and `/edit`.

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

### 5. Add a dojo module

Drop a new `dojo-*.txt` into `career-intelligence/resources/`. Nothing else is
required — no new tab, and no config change unless you want it in a particular
position, in which case add the filename to `dojo.order`. Files not listed there
are appended alphabetically after the ones that are.

The first non-blank line of each file becomes its heading in the doc, so keep
carrying the version there (`RESUME DOJO - module (v1.2.1, ...)`). Lines of the
form `== Section ==` become subheadings.

## Running it by hand

Preview what a tab will say, without touching Google:

```bash
python3 scripts/build_course_context.py cst499 --dry-run              # both tabs
python3 scripts/build_course_context.py cst499 --section dojo --dry-run
```

Write the payload to disk:

```bash
python3 scripts/build_course_context.py cst499 --output cst499-context.json
```

Force a sync from GitHub: **Actions → Sync course context docs → Run workflow**.
Leave the course blank for every configured course, or name one; pick a section
to sync just the Course or just the Dojo tab.

## Troubleshooting

**`no tab titled 'Dojo'`** — that doc is missing the tab, or it has been
renamed. Tabs are matched by title and cannot be created by script; add it in
Google Docs or fix the title in `config/course-docs.json`.

**`unknown_course`** — the course is in `config/course-docs.json` but not in the
`COURSE_DOC_IDS` script property.

**`invalid_token`** — the repository secret and the script property have drifted
apart. Redeploy the web app if you changed deployment settings.

**Nothing happened on push** — the workflow fires on `<course>/*.html` and on
`career-intelligence/resources/dojo-*.txt`. Use the manual trigger, or check
whether the folder is in the config.

**The Dojo tab did not update** — dojo files only match if they are named
`dojo-<something>.txt` and sit in the folder named by `dojo.source_dir`.

**A page came out thin** — the builder understands the accordion layout used by
the sprint pages and falls back to reading every text block for anything else.
Run `--dry-run` and read the output; if a section is missing, the page is using
a structure the builder has not seen.
