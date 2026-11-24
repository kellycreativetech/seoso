# Simple text column + architecture gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Simple text column block (and move About onto it), complete share tags and a favicon, make CMS
image fields safe, serve AVIF/WebP `<picture>` images, type-check in the build, and turn on noindexed branch
previews — with AGENTS.md kept accurate.

**Architecture:** One `pages` collection; `simpleText` is a new section type rendered by
`SimpleText.astro` through `SectionRenderer`. Share tags live in `BaseLayout`; preview-build detection is a pure
helper beside `siteUrl` surfaced to components via a Vite `define`. `ui/Media.astro` switches optimized images to
Astro's `<Picture>`.

**Tech Stack:** Astro 7.4.2, Tailwind 4 + daisyUI 5, Sveltia CMS 0.253.1, Vitest 5, Wrangler 4.

**Spec:** `docs/superpowers/specs/2026-11-24-simple-text-and-architecture-gaps-design.md`

## Global Constraints

- AGENTS.md rules: daisyUI Blueprint workflow for UI (setup → rules → syntax → quality inspector), semantic colors
  only, static class strings (`Record`/ternary), no authored CSS, square corners.
- Each task: `npm test`, `npm run check`, `npm run build` pass; AGENTS.md/README updated in the same commit when a
  fact they state changes.
- Live preview must keep working: after component changes POST a sample to `/api/preview`.
- Stage only the files a task touches (never `git add -A`); work on branch `feat/simple-text-and-gaps`.
- Restart any dev server after schema changes (stale content cache).

## Review Focus

- A Simple text column with only title + body (no eyebrow, intro, image) → renders cleanly, no empty wrappers.
- A Simple text column that is *not* first on the page → title is `h2`, image lazy.
- An image smaller than a variant's largest width → no upscaled `srcset` entries.
- A build on branch `main` vs `feature-x` vs local (no `WORKERS_CI_BRANCH`) → noindex only on `feature-x`.
- CMS preview of an entry with an unsaved `blob:` image → still a plain `<img>`, not `<Picture>`.

---

### Task 1: Simple text column block + About

**Files:** Create `src/components/sections/SimpleText.astro`. Modify `src/lib/sections.ts`,
`src/components/sections/SectionRenderer.astro`, `src/components/PageBuilder.astro` (nothing if default mode
already treats unknown types as base), `public/admin/config.yml` (pages + snippets `types`),
`src/content/pages/about.md`, `src/content/pages/kitchen-sink.md`, `AGENTS.md`. Test:
`test/components/sections-new.test.ts`, `test/lib/sections.test.ts`.

**Interfaces — Produces:** section `{ type: "simpleText"; anchorId?; eyebrow?; title: string; intro?; image?: {src, alt}; body: string }`;
`"simpleText"` appended to `SECTION_TYPES` before `"snippet"`.

- [ ] **Step 1: Failing tests**
  - `previewSectionSchema.parse({ type: "simpleText", title: "T", body: "B" })` succeeds; without `title` throws;
    `image: { src: "", alt: "" }` → `image` null.
  - Render `SimpleText` `{ title: "Da *capo*", intro: "Lead", body: "Para", eyebrow: "About" }, isFirst: true` →
    contains `<h1`, `<em>capo</em>`, `data-theme="seoso-dark"`, `max-w-[62ch] md:col-span-8 md:col-start-4`,
    `<p>Para</p>`, no `border-t-2`.
  - Same with `isFirst: false` → `<h2`; with only title + body → no `<img`, no element containing `Lead`.
- [ ] **Step 2:** `npx vitest run test/components/sections-new.test.ts test/lib/sections.test.ts` → FAIL.
- [ ] **Step 3: Implement.** Schema via `makeSectionSchema` (title `z.string()`, body `z.string()`, image
  `optionalImage`, rest `text`). Component: `<section>` black band (`bg-neutral text-neutral-content` with
  `data-theme="seoso-dark"`) reusing the text-width Masthead classes (gapless `md:grid-cols-12`, copy
  `grid grid-cols-1 gap-6 max-w-[62ch] md:col-span-8 md:col-start-4`, heading/lead classes = Hero `layout.text`),
  then `<Section>` body with the same grid: optional `Media` (variant `media`, `sizes="(min-width: 48rem) 62ch, 100vw"`,
  eager when first) and `<Markdown value={body} />`. Props `{ section, index, isFirst }`; pass `isFirst` in
  `SectionRenderer`. CMS type: label "Simple text column", fields eyebrow, title (required, heading hint), intro
  (text), image (object of `*imageFields`, optional), body (same widget as Rich text body), `*anchorId`.
- [ ] **Step 4:** Tests pass; `npm test` (cms-config confirms CMS ↔ schema).
- [ ] **Step 5: Content.** `about.md`: replace hero + richText with one `simpleText` (eyebrow "About SEOSO",
  title "DA *CAPO*", intro = old lead, body = old richText body), keep the highlightBand. Add one `simpleText`
  example to `kitchen-sink.md`.
- [ ] **Step 6: Visual + preview.** Blueprint (syntax: none new beyond existing classes) + quality inspector on
  `SimpleText.astro`; build, serve, screenshot `/about` at 1280 and 500: title band and body column start at the
  same x as before (368px at 1280). POST a `simpleText` sample to `/api/preview` → HTML has the title and body.
- [ ] **Step 7: Commit** `feat: Simple text column block; About uses it` (+ AGENTS.md blocks list/content model).

### Task 2: Share tags, preview noindex, favicon

**Files:** Modify `site-url.mjs`, `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/layouts/SiteLayout.astro`;
create `public/favicon.svg` (owner's file, verbatim), `public/favicon.ico`, `public/icons/icon-192.png`,
`public/icons/icon-512.png`, `public/icons/apple-touch-icon.png` (180), `public/icons/site.webmanifest`.
Test: `test/review-fixes.test.ts` (siteUrl tests live there), `test/smoke.test.ts`.

**Interfaces — Produces:** `isPreviewBuild(env: Record<string, string | undefined>): boolean` in `site-url.mjs`
(true iff `env.WORKERS_CI_BRANCH` is set and ≠ `"main"`); `astro.config.mjs` defines
`import.meta.env.SEOSO_NOINDEX_ALL` (boolean) from it. `BaseLayout` props add `canonical: string`,
`siteName: string`, `imageAlt?: string`.

- [ ] **Step 1: Failing tests** — `isPreviewBuild({})` false; `({ WORKERS_CI_BRANCH: "main" })` false;
  `({ WORKERS_CI_BRANCH: "feature-x" })` true. Render `BaseLayout` with `{ title: "About | SEOSO", canonical:
  "https://seoso.example/about", siteName: "SEOSO", image: "https://seoso.example/a.webp" }` → contains
  `rel="canonical" href="https://seoso.example/about"`, `og:title" content="About | SEOSO"`, `og:url`,
  `og:site_name" content="SEOSO"`, `og:type" content="website"`, `og:image:width" content="1200"`,
  `og:image:height" content="630"`, `og:image:alt" content="About | SEOSO"`, `twitter:card" content="summary_large_image"`,
  `rel="icon" href="/favicon.svg"`, `rel="manifest" href="/icons/site.webmanifest"`; no `robots`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.** Canonical in `SiteLayout`: `new URL(Astro.url.pathname, Astro.site).href` with any
  trailing `.html` stripped (home → `/`). `og:description` mirrors description. robots `noindex` when
  `noIndex || import.meta.env.SEOSO_NOINDEX_ALL`. Head icon links: `favicon.ico` (sizes="32x32"), `favicon.svg`
  (type image/svg+xml), apple-touch-icon, manifest. Icons: render the SVG to PNG at 32/180/192/512 with headless
  Chrome; `.ico` = one 32px PNG entry (ICO header + PNG bytes). Manifest: name/short_name "SEOSO", icons 192/512,
  `theme_color`/`background_color` `#000000`, `display` `browser`.
- [ ] **Step 4:** tests pass; build; `grep` built `index.html` and `about.html` for canonical (`/` and `/about`).
  `WORKERS_CI_BRANCH=x SITE_URL=https://x npm run build` → every page has `noindex`; plain build → only
  `kitchen-sink.html` and `404.html`.
- [ ] **Step 5: Commit** `feat: full share tags, favicon set, noindex on preview builds` (+ AGENTS.md).

### Task 3: CMS image safety

**Files:** Modify `public/admin/config.yml`, `AGENTS.md`. Test: `test/cms-config.test.ts`.

- [ ] **Step 1: Failing test** — walk every field (recursively through `fields`, `types`, list `field`) in
  `config.yml`; every `widget: image` has `choose_url: false`. Also `config.media_libraries.default.config` matches
  `{ slugify_filename: true, transformations: { raster_image: { format: "webp", quality: 90, width: 2560, height: 2560 }, svg: { optimize: true } } }`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** add `choose_url: false` to the `imageFields` anchor and the inline image fields; add
  `media_libraries`. Check the Sveltia 0.253.1 docs/changelog for each key; drop any that 0.253.1 rejects and
  record it.
- [ ] **Step 4:** tests pass; run the skill's `cms-local-test.mjs` (Playwright in the scratchpad, cached
  Chromium) against `npm run dev` on `#/collections/pages/entries/about` → no console errors, Pages listed,
  preview shows the Simple text column; image chooser has no "Enter URL".
- [ ] **Step 5: Commit** `feat: CMS image fields refuse URLs; uploads convert to WebP` (+ AGENTS.md CMS rules).

### Task 4: Responsive `<picture>` images

**Files:** Modify `src/components/ui/Media.astro`, `AGENTS.md`. Test: `test/components/ui.test.ts`.

**Interfaces — Produces:** `Media` props unchanged (`sizes` stays an optional override). Internal
`widthsFor: Record<Variant, number[]>`.

- [ ] **Step 1: Failing tests** — render `Media` with an `ImageMetadata` fixture (`{ src: "/a.jpg", width: 1000,
  height: 750, format: "jpg" }`), variant `gallery` → contains `<picture`, `type="image/avif"`, `type="image/webp"`,
  and no srcset width above `1000w`. String src (`blob:https://x/1`) → plain `<img src="blob:https://x/1"`, no
  `<picture`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** `<Picture formats={["avif", "webp"]} widths={widthsFor[variant].filter(w => w <= src.width)} sizes={sizes ?? defaultSizes[variant]} …>`;
  classes stay on the `<img>`; add `pictureAttributes` (e.g. `class="contents"`) where a variant's `<img>` is a
  grid/flex item. Widths: hero 640/1024/1440/1920; figure 400/800; gallery 400/600/900; video 480; card 400/720/1080;
  media 480/800/1200; portrait 112/224; sponsor 160/320; logo 160/320.
- [ ] **Step 4:** tests pass; build; screenshot `/`, `/our-history`, `/kitchen-sink`, `/directions` at 1280 and
  500, compare with `main` screenshots (no layout change; hero mask intact); Blueprint inspector on `Media.astro`.
- [ ] **Step 5: Commit** `feat: AVIF/WebP picture images with layout sizes` (+ AGENTS.md image rules).

### Task 5: Build check, branch previews, docs

**Files:** Modify `package.json`, `wrangler.jsonc`, `AGENTS.md`, `README.md`.

- [ ] **Step 1:** `"build": "astro check && astro build"`; `wrangler.jsonc` add `"workers_dev": true`,
  `"preview_urls": true`; `npx wrangler deploy --dry-run` succeeds.
- [ ] **Step 2:** measure contrast (WCAG) for: base-content/base-100, base-content/70 on base-100, secondary on
  base-100, primary on neutral, neutral-content/90 on neutral, secondary (dark) on base-100 (dark), primary-content
  on primary — both themes; record the table in AGENTS.md design section; flag any pair under 4.5:1.
- [ ] **Step 3:** AGENTS.md: commands (build runs check), stack/hosting (preview URLs, noindex, owner dashboard
  step: enable non-production branch builds, `SITE_URL` for all branches), dev-server gotcha. README hosting
  table.
- [ ] **Step 4:** `npm test && npm run build`. Commit `chore: type-check in build, branch preview URLs, contrast docs`.
