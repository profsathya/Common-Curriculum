---
purpose: Technical infrastructure — what scripts do, known issues, recent changes
last_updated: 2026-02-26
updated_by: sathya
status: active
---

# Pipeline & Infrastructure

## Analysis Pipeline Overview

**Script:** `scripts/submission-analyzer.js` (Common-Curriculum repo)
**Data:** Common-Curriculum-Data repo (sibling directory)

### Actions

| Action | What it does | When to run |
|---|---|---|
| `download` | Pulls submissions from Canvas API, stores per-assignment JSON files | After assignment due dates pass |
| `analyze` | Runs submissions through Claude API for quality scoring | After download |
| `grade` | LLM-based grading with vision for images/PDFs, generates review dashboard | After download |
| `dashboard` | Generates HTML dashboard from analysis data | After analyze |
| `full` | download → analyze → grade → dashboard + anonymized export | Standard workflow |
| `post-grades` | Pushes reviewed grades to Canvas from downloaded JSON | After instructor reviews grading dashboard |
| `diagnose-downloads` | Tests Canvas file download for each content type | After download, to verify binary access |

### Usage
```bash
node scripts/submission-analyzer.js --action=full --course=cst395 --data-dir=../Common-Curriculum-Data
node scripts/submission-analyzer.js --action=full --course=cst349 --data-dir=../Common-Curriculum-Data
```

Requires `CANVAS_API_TOKEN` and `CANVAS_BASE_URL` environment variables for download and post-grades.

### Data Flow

```
Canvas API
  → download: submissions/*.json (per-assignment, keyed by anonymous ID)
  → submission-index.json (metadata: dates, types, counts)
  → id-mapping.json (anonymous ID ↔ Canvas ID ↔ name — NEVER share this)

submissions/*.json
  → analyze: analysis.json (quality scores, student summaries, distributions)
  → grade: grading/{assignmentKey}.json (suggested scores, comments, extracted text)

analysis.json
  → dashboard: dashboard.html (interactive visualization)

grading/*.json
  → dashboard: grading dashboards (per-assignment review + index)
  → instructor edits scores/comments in browser
  → downloads {assignmentKey}-grades.json
  → post-grades: pushes to Canvas, marks as posted in grading JSON

All of the above
  → full: anonymous/{course}/ (PII-stripped copies for external sharing)
```

## Activity Config Resolution (`loadActivityConfig`)

For `ai-discussion` assignments, the pipeline loads activity config JSON files from `activities/{course}/` to get question context for grading. The function resolves assignment keys to filenames using:

1. **Exact match**: `{assignmentKey}.json` (e.g. `s1-demo-ai-discussion.json`)
2. **Demo special case**: `demo-discussion` → `demo-ai-discussion` substitution
3. **Week-prefix scan**: Scans the directory and matches by stripping the `s{N}-w{N}-` prefix from filenames and the `s{N}-` prefix from assignment keys (e.g. assignment key `s2-orientation` matches file `s2-w5-orientation.json` because both reduce to `orientation` for the same sprint)

When no config is found, the assignment gets an empty `questions` array, causing the grading prompt to fall back to flat 3/3 scores.

## Submission Types the Pipeline Handles

| Canvas Type | contentType in data | Notes |
|---|---|---|
| `online_text_entry` | `text` | HTML stripped to plain text |
| `online_upload` (image) | `image` | Grading step downloads binary and sends as vision to Claude for reading/grading. Extracted text backfilled into submissions for analysis. |
| `online_upload` (PDF) | `pdf` | Same as image — sent as document content block via vision API. |
| `online_upload` (JSON — Activity Engine) | `ai-discussion` | Full structured data with responses |
| `online_upload` (JSON — Dojo session) | `conversation` | [Student]/[AI] prefixed text (Stage 3 fix) |
| `online_upload` (JSON — ChatGPT export) | `conversation` | Detects 3 format variants (Stage 3 fix) |
| `online_upload` (other text) | `text` | Raw text, truncated to 5000 chars |
| `online_url` | `url` | URL string only |
| Quiz submissions | `text` | Fetched via Quiz Reports API, answers concatenated |

## Three-Stage Improvement Plan

### Stage 1: Dashboard Homepage Redesign [IMPLEMENTED]
- 3-zone overview: Sprint Status, Alerts & Flags, Sprint Comparison
- Full student grid accessible via toggle button
- Applied to both main and anonymized dashboards
- Includes Bug 1 signature detection (flat 3/3 scores) as data quality alert

### Stage 2: Custom Analysis Rubrics + Sonnet Upgrade [SUBMITTED]
- Per-assignment-type rubrics (5 Whys chain progression, Discovery Doc partner evidence, etc.)
- Upgrade from Haiku to Sonnet for quality scoring
- Depends on Stage 3 (needs real data to analyze)

### Stage 3: Conversation JSON Extraction [SUBMITTED]
- `extractConversationContent()` function detects 4 JSON conversation formats
- Extracts readable text with [Student]/[AI] prefixes, 15K char limit
- New `conversation` contentType with metadata (userTurns, userWordCount, format)
- Staleness warning when download data is >24 hours old
- **Run this first** — Stage 2 rubrics are meaningless without extracted content

### Stage 4: Anonymized Export [SUBMITTED]
- Automatic as part of `--action=full` and `--action=dashboard`
- Outputs to `{dataDir}/anonymous/{course}/` (analysis.json, dashboard.html, submissions/)
- Strips all name fields; preserves anonymous ID keys, scores, content
- Does NOT copy student-mapping.json

### Stage 5: Grading Pipeline with Vision [IMPLEMENTED]

Addresses the "60% unanalyzable" problem. The `grade` action sends image/PDF submissions to Claude Sonnet via the vision API, reads handwritten work, and produces score suggestions + student-facing comments.

**Key components:**
- `callGradingLLM()` — Generous grading prompt with scoring guide. Text submissions get direct grading; image/PDF submissions are downloaded as base64 and sent as vision content blocks.
- `gradeSubmissions()` — Orchestrates per-assignment grading. Skips quizzes, pre-graded students, and reviewed/posted entries. Saves to `grading/{assignmentKey}.json`.
- **Grading dashboard HTML** — Interactive review page per assignment. Sorted lowest score first. Inline score/comment editing, "Apply All Suggestions" for bulk acceptance, "Download Grades JSON" for post-grades compatibility.
- **Extracted text backfill** — When vision reads an image/PDF, the transcribed text is saved back into the submission JSON as `extractedContent`. Subsequent analysis runs can then quality-score these submissions instead of marking them "participation only".

**Canvas file download fix (prerequisite):**
Canvas file URLs 302-redirect to pre-signed S3/CDN URLs. The original `fetch` forwarded the Authorization Bearer header to S3, which rejected it. Fixed by using `redirect: 'manual'` and stripping auth on the CDN hop. Both `downloadFileContent()` (text) and `downloadFileAsBase64()` (binary) in `canvas-api.js` handle this.

**Grading flow:**
1. `--action=grade` produces suggested scores in `grading/*.json` + review dashboards
2. Instructor opens dashboard, reviews/edits, downloads grades JSON
3. `--action=post-grades --assignment=<key>` pushes to Canvas
4. Grading JSON entries marked as `posted` to prevent re-grading

**Skip logic:**
- Skip if `canvasType === 'quiz'` (quizzes graded via Canvas directly)
- Skip if Canvas score > 0 AND status is 'graded' (already meaningfully graded)
- Do NOT skip if score === 0 on a submitted assignment (likely default/accidental)
- Skip if grading JSON has status `reviewed` or `posted`
- Re-grade entries with status `pending` (allows re-running to update suggestions)

## AI Discussion Activity Engine

The "Activity Engine" is a custom assignment format where students complete structured activities (writing prompts, AI discussion sessions) through interactive HTML pages hosted on GitHub Pages. The JSON export captures their responses.

**How it works:**
1. Student opens an activity page (e.g., Sprint 1 Demo Discussion) embedded in Canvas
2. The page presents writing prompts and an AI discussion component (powered by Netlify Functions → Anthropic API)
3. Student completes the activity; responses are saved as a JSON file
4. Student downloads and uploads the JSON to Canvas as a file submission

**What the JSON contains:**
```json
{
  "activityId": "sprint-1-demo",
  "studentName": "...",
  "authorName": "...",
  "responses": [
    {
      "questionType": "text",
      "questionId": "q1",
      "response": "Student's written answer..."
    },
    {
      "questionType": "ai-discussion",
      "questionId": "q2",
      "messages": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
      ]
    }
  ]
}
```

**Pipeline handling:**
- Download step detects Activity Engine JSON by checking for `activityId` + `responses` fields
- If any response has `questionType === 'ai-discussion'`, contentType is set to `ai-discussion`
- Analysis step uses specialized `analyzeDiscussionAssignment()` with partner matching and dual grading (writing quality + discussion quality scored separately)
- Activity config files in `activities/{course}/` provide question context for the grading prompt
- Config resolution: exact match → demo special case → week-prefix scan (→ pipeline.md#activity-config-resolution)

**Partner matching:** For discussion-style activities, the pipeline identifies which students discussed with each other (via the AI discussion partner metadata) and can compare perspectives. This is unique to the Activity Engine format — ChatGPT/Dojo exports don't have partner information.

## Known Limitations

1. ~~**60% unanalyzable work**: Handwritten reflections submitted as photos/PDFs. Pipeline can't OCR them.~~ **RESOLVED** by Stage 5 grading pipeline — vision API reads handwritten work and backfills extracted content for analysis.

2. **Content truncation**: Non-conversation text submissions truncated to 5000 chars. Activity Engine JSON to 10,000. Conversations to 15,000 (Stage 3). Very long submissions lose tail content.

3. **Quiz response ingestion**: Quiz CSVs (5 Whys, Solution Architecture, Skills Assessment) contain the richest student thinking but can only be manually downloaded from Canvas and analyzed outside the pipeline. Adding quiz CSV ingestion would be a high-ROI future enhancement.

4. **Dojo vs. ChatGPT visibility**: Students using ChatGPT instead of the Dojo produce valid work but in different JSON formats. Stage 3 handles format detection, but Dojo-specific metrics (construct, partners) are unavailable for ChatGPT sessions.

5. **Single-run scoring**: Quality scores are one-shot LLM calls. No calibration, no inter-rater reliability. Scores should be treated as directional, not precise.

## Course Infrastructure (Non-Pipeline)

- **GitHub Pages**: profsathya/Common-Curriculum serves HTML pages embedded in Canvas via iframes
- **Canvas integration**: Redirect tools for iframe embedding, assignment configuration
- **Netlify Functions**: Hosts Dojo AI sparring partner with Anthropic API keys
- **Google Apps Script**: Peer conversation tracking, automated form creation, status emails
- **CSV-first workflow**: Assignment metadata structured in spreadsheets before HTML generation
