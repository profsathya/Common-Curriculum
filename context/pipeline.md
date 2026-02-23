---
purpose: Technical infrastructure — what scripts do, known issues, recent changes
last_updated: 2026-02-23
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
| `dashboard` | Generates HTML dashboard from analysis data | After analyze |
| `full` | All three + anonymized export | Standard workflow |
| `post-grades` | Pushes participation scores back to Canvas | Manual only, when ready |

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
  → student-mapping.json (anonymous ID ↔ Canvas ID ↔ name — NEVER share this)

submissions/*.json
  → analyze: analysis.json (quality scores, student summaries, distributions)

analysis.json
  → dashboard: dashboard.html (interactive visualization)

All of the above
  → full: anonymous/{course}/ (PII-stripped copies for external sharing)
```

## Submission Types the Pipeline Handles

| Canvas Type | contentType in data | Notes |
|---|---|---|
| `online_text_entry` | `text` | HTML stripped to plain text |
| `online_upload` (image) | `image` | Filename only — unanalyzable |
| `online_upload` (PDF) | `pdf` | Filename only — unanalyzable |
| `online_upload` (JSON — Activity Engine) | `ai-discussion` | Full structured data with responses |
| `online_upload` (JSON — Dojo session) | `conversation` | [Student]/[AI] prefixed text (Stage 3 fix) |
| `online_upload` (JSON — ChatGPT export) | `conversation` | Detects 3 format variants (Stage 3 fix) |
| `online_upload` (other text) | `text` | Raw text, truncated to 5000 chars |
| `online_url` | `url` | URL string only |
| Quiz submissions | `text` | Fetched via Quiz Reports API, answers concatenated |

## Three-Stage Improvement Plan

### Stage 1: Dashboard Homepage Redesign [PENDING]
- 3-zone architecture: current sprint status, alerts, deeper analysis
- Independent of Stages 2-3
- Prompt ready, not yet submitted

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

### Stage 4: Anonymized Export [COMPLETE]
- Automatic as part of `--action=full` and `--action=dashboard`
- Outputs to `{dataDir}/anonymous/{course}/` (analysis.json, dashboard.html, submissions/)
- Strips all name fields; preserves anonymous ID keys, scores, content
- Builds name→anonId replacement map for text fields (summaries, qualityNotes)
- Uses word boundaries and length thresholds to avoid false-positive replacements
- Dashboard uses anonymous IDs as display names, sorted by ID
- Does NOT copy id-mapping.json (that file IS the name↔ID bridge)

## Known Limitations

1. **60% unanalyzable work**: Handwritten reflections submitted as photos/PDFs. Pipeline can't OCR them. Quality scores represent <40% of actual student work.

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
