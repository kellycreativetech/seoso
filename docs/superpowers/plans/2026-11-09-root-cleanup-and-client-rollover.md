# Root cleanup and client-side event rollover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the root-level Astro site consistent after the move out of `site/`: working CMS paths, past concerts
dropping off upcoming lists in the browser (no rollover Worker), no trace of the retired CMS, and an accurate
AGENTS.md / README / superpowers docs.

**Architecture:** Prerendered Astro site on Cloudflare Workers (static assets + one on-demand route, `/api/preview`).
Sveltia CMS (GitHub backend, sign-in via the Sveltia CMS Authenticator Worker) edits Markdown/JSON in `src/content/`.
Upcoming-event rows carry `data-past-at` (absolute ISO instant); a small bundled script hides rows whose instant has
passed in the visitor's browser.

**Tech Stack:** Astro 7, @astrojs/cloudflare 14, Tailwind 4 + daisyUI 5, Sveltia CMS 0.253.1, Vitest 5.

**Spec:** decisions from the 2026-11-09 conversation (recorded in Global Constraints below).

## Global Constraints

- Hosting stays on Cloudflare Workers (Workers Builds), not Pages.
- CMS backend stays GitHub `kellycreativetech/seoso`, branch `main`, sign-in via the existing authenticator Worker.
- No rollover Worker and no scheduled rebuild. Past concerts are removed client-side by comparing `data-past-at` to
  the browser clock. All upcoming-at-build events are printed in the HTML (SEO); rows beyond the block's `limit`
  start hidden and the script reveals the next one when an event passes.
- The drop-off rule is unchanged: midnight America/New_York on the day after the event ends (`pastAt`).
- Live preview in Sveltia must keep working; preview components stay Astro (server-rendered via `/api/preview`).
- Remove every mention of the retired CMS and the one-off content import from tracked files. Leave git history and
  other branches alone.
- Keep `docs/superpowers/` files, revised to be accurate.
- daisyUI rules from AGENTS.md: semantic colors, no authored CSS selectors, static class strings.

## Review Focus

- A list where every upcoming event has passed → the "New dates are coming soon" message must appear.
- A year heading whose events all passed → heading must be hidden.
- Limit 3 with one passed → the 4th event must become visible.
- DST transition dates → `data-past-at` must still be local midnight Eastern.
- CMS preview of a page with an events block → still renders (script must not break the preview pane).

---

### Task 1: CMS paths at the repo root
**Files:** `public/admin/config.yml`, `public/admin/preview.js`, `src/lib/sections.ts`, `test/cms-config.test.ts`, `test/lib/sections.test.ts`
- [ ] Fix `repoRoot` in the CMS test; run → the folder test now fails only on `site/` paths.
- [ ] Add test: `normalizeUploadPath("/src/assets/uploads/a.jpg")` → `"../../assets/uploads/a.jpg"`; run → FAIL.
- [ ] Replace `site/src/` → `src/` and `/site/src/assets/uploads` → `/src/assets/uploads` in all three files.
- [ ] `npm test` → all pass. Commit.

### Task 2: Client-side rollover
**Files:** `src/lib/events.ts`, new `src/lib/rollover.ts`, `src/components/sections/EventsList.astro`,
`src/components/sections/EventList.astro`, `src/components/detail/EventDetail.astro`; remove `src/lib/now.ts`,
`src/pages/events.json.ts`, `nextRollover`; tests in `test/lib/`, `test/components/`.
- **Produces:** `applyRollover(root: ParentNode, now: number): void` in `src/lib/rollover.ts`.
- [ ] Tests: rows carry `data-past-at` = `pastAt(event).toISOString()`; upcoming HTML is not cut to `limit`;
  `applyRollover` hides passed rows, reapplies `data-limit`, hides orphan year rows, reveals the empty message.
- [ ] Implement; remove `now.ts`, `events.json`, `nextRollover` and their tests/comments.
- [ ] `npm test && npm run check && npm run build`; Blueprint inspector on changed components; browser check. Commit.

### Task 3: Remove the one-off content import
- [ ] Delete `scripts/`, `test/scripts/`, `migrate` script; move `yaml` to devDependencies; delete `site/`.
- [ ] Only docs (Tasks 4–5) still mention the retired CMS. Tests/check/build pass. Commit.

### Task 4: Revise `docs/superpowers` spec and plan to describe what exists. Commit.

### Task 5: Preview sync test + AGENTS.md + README
- [ ] `test/preview-sync.test.ts`: collections registered in `preview.js` == collections `parsePreview` accepts,
  and each exists in `config.yml`.
- [ ] Rewrite AGENTS.md (incl. "Live preview — must keep working" with the preview.js sync checklist) and README.
- [ ] No tracked file names the retired CMS; tests/check/build pass. Commit.
