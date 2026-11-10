# SEOSO on Astro + Sveltia CMS (Cloudflare Workers) Implementation Plan

> **Status: done.** This is the record of how the site was built, revised on 2026-11-09 to match the code as it
> is now: the Astro project lives in the repo root (it began in `site/`), and past concerts drop off in the browser
> (`src/lib/rollover.ts`) instead of a rollover Worker. See
> `docs/superpowers/plans/2026-11-09-root-cleanup-and-client-rollover.md` for that change.

**Goal:** A static Astro site whose content lives in the repo and is edited in Sveltia CMS with an accurate live
preview, deployed free on Cloudflare Workers.

**Architecture:** Prerendered Astro, except one on-demand route (`/api/preview`) that renders CMS entries with the
real `.astro` components. Content is Markdown/JSON validated by content-collection schemas; pages are ordered
`sections` lists in frontmatter.

**Tech Stack:** Astro 7.4.2 (pinned exactly), @astrojs/cloudflare 14.x, Tailwind CSS 4.3 + daisyUI 5.7 (Vite
plugin), @sveltia/cms 0.253.1 (pinned, loaded from unpkg), marked, vitest 5, wrangler 4,
@fontsource-variable/newsreader + @fontsource-variable/source-sans-3.

**Spec:** `docs/superpowers/specs/2026-10-26-sveltia-astro-migration-design.md`

## Global Constraints

- The repo root is the Astro project and the Workers Builds root directory.
- Pin `astro` exactly (the Container API used by tests is experimental).
- Every public route is prerendered; only `src/pages/api/preview.astro` sets `export const prerender = false`.
- No React, Vue or Svelte in the site's code. The only React is Sveltia's bundled `CMS.React` in
  `public/admin/preview.js`.
- Design per `AGENTS.md`: daisyUI 5 semantic colors only, `seoso` / `seoso-dark` themes, square corners, no
  shadows, no authored CSS selectors, static class strings, Newsreader + Source Sans 3.
- Section tones: `hero` and `highlightBand` are "stage" by default; the home page alternates (first two stage, then
  base/stage…). Stage wrapper = `data-theme="seoso-dark"` + `bg-neutral text-base-content`.
- Event dates are stored in UTC and displayed in `America/New_York`. An event is past from 00:00
  America/New_York on the day after it ends (start if no end).
- No secret in the repo.
- Headings are inline Markdown: `*x*` → `<em>`, `~~x~~` → `<s>`; everything else escaped.
- CMS content paths are relative to the repo root (`src/content/pages`).

## Review Focus

1. Editor text containing `<`, `&`, quotes or stray `*` in headings, labels and alt text → escaped (site and
   preview).
2. Events on DST-change days, late-evening events whose UTC date is the next day, and events ending on a later
   day → fall off at the right midnight.
3. Sections saved with optional fields blank → render without crashing or empty wrappers.
4. A snippet that includes itself, or a deleted snippet → the rest of the page renders, no loop.
5. Preview of an unsaved upload (`blob:` URL) or a half-filled block → the preview renders what it can with a
   small notice, never a blank pane.

---

### Task 1: Scaffold and design system — done
`package.json`, `astro.config.mjs`, `wrangler.jsonc`, `tsconfig.json`, `vitest.config.ts`, `.node-version`,
`src/styles/global.css` (both daisyUI themes + type-scale `@theme` tokens), `src/layouts/BaseLayout.astro`.
Test: `test/smoke.test.ts`.

### Task 2: Shared rules — done
`src/lib/events.ts` (`pastAt`, `isPast`, `selectEvents`), `src/lib/dates.ts` (Eastern Time formatting),
`src/lib/inline.ts` (`renderInline`), `src/lib/links.ts` (`resolveHref`, `isExternal`).
Tests: `test/lib/{events,inline,links}.test.ts`, including DST and late-evening cases.

### Task 3: Content schemas and section model — done
`src/content.config.ts`, `src/lib/sections.ts` (`SECTION_TYPES`, `makeSectionSchema(image)`,
`previewSectionSchema`, `expandSnippets`, `normalizeUploadPath`). Test: `test/lib/sections.test.ts`.

### Task 4: Content — done
Pages, events, news, venues, snippets and settings in `src/content/`; images in `src/assets/uploads/`, referenced
relative to the content file (`../../assets/uploads/…`).

### Task 5: Page chrome and PageBuilder — done
`src/components/ui/*`, `src/components/site/*` (header, drawer, footer, `NavBehavior`), `PageBuilder.astro`,
`sections/SectionRenderer.astro`. Tests: `test/components/{page-builder,ui}.test.ts`.

### Task 6: Existing sections — done
Hero, EventsList (+ EventList), HighlightBand, NewsList (+ PostFeature), RichText, People, Contacts, Venues,
Gallery, Video. Test: `test/components/sections-existing.test.ts`.

### Task 7: Landing-page sections — done
TextMedia, CardGrid, Testimonials, CtaBand, Faq, Stats, Logos; `src/content/pages/kitchen-sink.md`
(`noIndex`, one of every block) is the visual test page. Test: `test/components/sections-new.test.ts`.

### Task 8: Routes, redirects, calendar feed — done
`src/pages/{index,[slug],404}.astro`, `events/` and `news/` index + detail routes, `src/components/detail/*`,
`src/pages/events.ics.ts` + `src/lib/feeds.ts` (`buildIcs`, RFC 5545), `public/_redirects`.
Test: `test/lib/feeds.test.ts`.

### Task 9: Preview rendering route — done
`src/lib/preview.ts` (`parsePreview`), `src/pages/api/preview.astro`, `src/pages/admin/preview.css.ts`.
Test: `test/lib/preview.test.ts`.

### Task 10: Sveltia CMS admin and live preview — done
`public/admin/{index.html,config.yml,preview.js}`. Test: `test/cms-config.test.ts` (block types and fields match
the schemas; every folder exists; GitHub backend on `main`).

### Task 11: Event rollover — replaced
First built as a cron Worker that rebuilt the site when a concert fell off. Replaced on 2026-11-09 by the in-browser
rollover (`src/lib/rollover.ts`); no Worker, cron or deploy hook.

### Task 12: Go live on Cloudflare — done
Worker `seoso` on Workers Builds (production branch `main`, build variable `SITE_URL`); Sveltia CMS Authenticator
Worker + GitHub OAuth App under `kellycreativetech`; `backend.base_url` in `config.yml` points at the
authenticator. Setup and secret locations are in `README.md`.
