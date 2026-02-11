#!/usr/bin/env bash
#
# pull-canvas-ids.sh — Pull Canvas IDs from Canvas and update CSV + HTML files
#
# Canvas is the source of truth for Canvas IDs.
# This script fetches assignments from Canvas, matches them to config entries
# by title, writes the IDs back to the CSV, and updates HTML submission URLs.
#
# Usage:
#   ./scripts/pull-canvas-ids.sh              # Both courses (dry-run)
#   ./scripts/pull-canvas-ids.sh --apply      # Both courses (apply changes)
#   ./scripts/pull-canvas-ids.sh cst349       # One course (dry-run)
#   ./scripts/pull-canvas-ids.sh cst395 --apply  # One course (apply changes)
#
# Requires: CANVAS_API_TOKEN environment variable

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse arguments
COURSES=()
DRY_RUN="--dry-run"

for arg in "$@"; do
  case "$arg" in
    --apply)
      DRY_RUN=""
      ;;
    cst349|cst395)
      COURSES+=("$arg")
      ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: $0 [cst349|cst395] [--apply]"
      exit 1
      ;;
  esac
done

# Default to both courses if none specified
if [ ${#COURSES[@]} -eq 0 ]; then
  COURSES=("cst349" "cst395")
fi

# Check for Canvas API token
if [ -z "${CANVAS_API_TOKEN:-}" ]; then
  echo "Error: CANVAS_API_TOKEN environment variable is not set."
  echo "Set it with: export CANVAS_API_TOKEN=your_token_here"
  exit 1
fi

if [ -n "$DRY_RUN" ]; then
  echo "=== DRY RUN — no changes will be written (use --apply to write) ==="
  echo ""
fi

for course in "${COURSES[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $course — Pulling Canvas IDs"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  echo "Step 1/3: Fetching assignments from Canvas..."
  node "$SCRIPT_DIR/canvas-sync.js" fetch-assignments "$course" $DRY_RUN
  echo ""

  echo "Step 2/3: Writing Canvas IDs back to CSV..."
  node "$SCRIPT_DIR/canvas-sync.js" writeback-csv "$course" $DRY_RUN
  echo ""

  echo "Step 3/3: Updating HTML submission URLs..."
  node "$SCRIPT_DIR/canvas-sync.js" update-html-links "$course" $DRY_RUN
  echo ""

  echo "✓ $course complete"
  echo ""
done

if [ -n "$DRY_RUN" ]; then
  echo "=== DRY RUN complete — run with --apply to write changes ==="
else
  echo "=== All changes applied ==="
  echo ""
  echo "Files updated:"
  cd "$PROJECT_DIR"
  git diff --name-only 2>/dev/null || true
fi
