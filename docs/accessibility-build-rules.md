# Accessibility build rules for course pages

Adopted 6 Oct 2026 after a full check of the CST286 and CST349 pages (42 pages, axe WCAG 2.2 AA).
Every new or edited course page follows these rules. The check at the end confirms them.

## Rules

1. **Colors.** Use these values for the shared variables. Each one passes 4.5:1 on white and on the tinted card backgrounds.
   - `--teal: #0F766E` (was `#0D9488`)
   - `--muted: #5C6873` (was `#6B7780`)
   - `--check: #0A7340` (was `#0B874B`)
   - `--blaze: #B04A18` and `--warn: #6F5612` on the trail pages
   - Any new text color is checked against the background it sits on before it is used.
2. **Links in running text are underlined.** Color alone does not mark a link. Button-style links carry a class and keep their own styling.
3. **One main region.** The page content sits in `<main>` (new pages) or in `<div class="page" role="main">` (existing pages). The page footer sits outside it, or carries `role="none"` when it has to stay inside.
4. **Headings go down one level at a time.** h1, then h2, then h3. Do not jump from h2 to h4 for a smaller look; style an h3 instead.
5. **Decorative icons are hidden.** Inline `<svg>` icons carry `aria-hidden="true" focusable="false"`. An icon that carries meaning gets a text label instead.
6. **Tables.** A data table has `<th>` header cells and a caption or `aria-label`.
7. **Glossary bubbles.** The trigger is a real `<button class="gt">` with `aria-describedby` pointing at the bubble's `id`. Escape closes the bubble. The bubble prints as an indented block, so nothing is lost on paper.
8. **Text size.** No text below 12px on student pages (11px on the `assignments.html` registries).
9. **Click and tap targets** are at least 24px tall. Links that stand alone in a list get padding.
10. **Answer scaffolds are visible text.** Sentence starters go in a `<p class="starter" id="...">` above the box, tied to the box with `aria-describedby`. A placeholder is only for a short format hint.
11. **Status messages are announced.** A line that reports "Copied" or "Saved" carries `role="status"`. A button that only changes its own label is covered by the small script the pass adds.
12. **Motion.** Any page with animation or transitions includes the `prefers-reduced-motion` block.
13. **Video.** YouTube embeds include `cc_load_policy=1`. Recordings are captioned before they are linked.
14. **Narrow screens.** The page does not scroll sideways at 320px or at the Canvas embed width of 754px.
15. Keep what already works: `lang` on `<html>`, alt text on images, a label on every form field, visible focus outlines, native `<details>` for anything that opens and closes, and no `tabindex`.

## The script

`scripts/a11y_fix.py` applies rules 1 to 13 to every page in `cst286/` and `cst349/`:

    python3 scripts/a11y_fix.py .

It skips any page that already carries the `<style id="a11y-pass-1">` block, so it is safe to run again after a new page is added. New pages should be written to the rules directly; the script is the backstop. It has not been run on `cst499/` or the other course folders.

## The check

Render the page and run axe-core with the tags `wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`, with every `<details>` open. On 6 Oct 2026 the 42 pages went from 2,067 flagged elements to 12, all of them minor: two helper pages without an h1, and a few small blocks outside the main region (the bookmarks button, the trail breadcrumbs, the copy bar on the six-questions page).

## Not covered by any automated check

- Caption accuracy on the Panopto recordings and the YouTube clips.
- How the glossary bubbles behave on a phone.
- A read-through with a real screen reader.
