# Simple text column block + standard-architecture gaps — design

Status: draft for approval · Date: 2026-11-24 · Repo: SEOSO (Astro 7 at the repo root)

## Why

The owner ran the "building Astro + Sveltia sites" audit against this site. Two outcomes:

1. **Text pages.** The standard architecture has a separate "Basic page" type (title, intro, image, body). The
   owner wants that *shape* but not a second page type: one collection, **Pages**, with the basic page offered as
   a block, **Simple text column**, so every page is built the same way and the "Page on this site" link picker
   keeps working everywhere (a picker can point at only one collection).
2. **Gaps** the owner chose to fix: share/SEO tags, CMS image safety, responsive `<picture>` images, build checks,
   branch Preview URLs, and recorded docs (contrast, dev-server gotcha). The favicon waits for an SVG the owner
   will supply.

## Goals

- A `simpleText` block ("Simple text column"): black title band (eyebrow, title, intro) over a white body (optional
  image, Markdown body), all in the same text column as the About page today.
- Pages restructured to use it where it fits.
- Complete sharing tags, safer CMS image fields with upload conversion, AVIF/WebP responsive images, `astro check`
  in the build, public branch Preview URLs, AGENTS.md updated.

## Non-goals

- A second page collection, or any change to URLs, links or the `homePage` setting.
- The favicon set (blocked on the owner's SVG; a follow-up task).
- Buttons in the Simple text column (not asked for).
- Changing the live-preview architecture (it renders real components; nothing in `preview.js` changes for a new
  block).

## Anti-goals

- Visible change to pages not being restructured (other than images now served as `<picture>`).
- A block that looks different from the About page the owner approved on 2026-11-09.
- Breaking the CMS live preview, or the build on Cloudflare (no `SITE_URL` surprises on preview branches).

## Approaches considered (owner picked)

| Approach | Trade-off | Outcome |
| --- | --- | --- |
| Separate "Basic pages" and "Landing pages" collections (the reference) | Matches the standard stack, but every link picker, the home-page setting, routing, preview and tests must handle two collections | Rejected by the owner |
| **One "Pages" collection + a Simple text column block** | Same page type everywhere; the basic-page shape is just a block | **Chosen** |
| Keep Masthead (`width: text`) + Rich text pairs | Already works; editors assemble two blocks and set Width themselves | Superseded |

Look of the block (owner picked **A**): **A. black title band, white body** (matches the site's black-then-white
rhythm and the current About page) over **B. all on white** (quieter, but the only page opening without black).

## Design

### 1. Simple text column block

- **Type key** `simpleText`; **CMS label** "Simple text column"; description "A title, intro, optional image and
  text in one readable column. Use it for text pages."
- **Fields** (camelCase, all optional except title and body):
  - `eyebrow` (string) — *builder's call, kept so About keeps its "About SEOSO" label; every other titled block
    has one.*
  - `title` (string, required; inline Markdown `*italic*` / `~~strike~~` like other headings)
  - `intro` (text)
  - `image` (`{ src, alt }`, optional, same `imageFields` as other blocks)
  - `body` (Markdown, required, same widget as Rich text's body)
  - `anchorId`
- **Rendering** (one component, `src/components/sections/SimpleText.astro`):
  - Title band: a `bg-neutral` section scoped `data-theme="seoso-dark"` *inside the component*, with the same
    gapless 12-column grid and `max-w-[62ch] md:col-span-8 md:col-start-4` column as Masthead `width: text`;
    eyebrow (brand tone), title (same classes as the text-width Masthead heading), intro (serif lead). Title is
    `h1` when the block is first on the page, else `h2` (same rule as Masthead).
  - Body: white (`base`) section with the standard section rhythm, same column; optional image at column width
    (Media, `loading` eager when first block), then the Markdown body (`Markdown` prose variant). No 2px rule.
  - `PageBuilder` treats `simpleText` as a **base** (non-stage) wrapper in default mode, because the block draws
    its own black band. On the home page (`rotateTones`) it follows the rotation like any block — *builder's
    call; nobody uses it there today.*
- **Wiring**: schema in `makeSectionSchema` (`src/lib/sections.ts`) + `SECTION_TYPES`; case in
  `SectionRenderer.astro`; type in `config.yml` for **pages and snippets**; `kitchen-sink.md` gets one example.
  `test/cms-config.test.ts` covers the CMS/schema match. The live preview needs no `preview.js` change (it renders
  real components); verify by POSTing a sample to `/api/preview`.

### 2. Pages restructured

- **about**: Masthead (`width: text`, eyebrow, heading, lead) + Rich text (no heading) → one Simple text column
  (eyebrow "About SEOSO", title "DA *CAPO*", intro = the lead, body = the three paragraphs). The Highlight band
  stays. Must look the same as now.
- **donate**: stays as is — its masthead carries the two donation buttons, which the block doesn't have.
  *(Builder's call; owner can ask for optional buttons later.)*
- All other pages are block pages (events, news, home, contact, directions, board, our-history, kitchen-sink) and
  stay.
- Masthead keeps its `width` option (other mastheads may still want it).

### 3. Share and SEO tags (`BaseLayout` / `SiteLayout`)

- `<link rel="canonical">` = `new URL(Astro.url.pathname, Astro.site)` (no trailing slash, matching
  `trailingSlash: "never"`; the home page is `/`).
- `og:title` (page title, or site name on home), `og:description`, `og:url` (= canonical), `og:site_name`,
  `og:type` `website`, `og:image` + `og:image:width` 1200 + `og:image:height` 630 + `og:image:alt`,
  `twitter:card` `summary_large_image`.
- `og:image:alt` is the page's full title (`<title>` text). *Builder's call:* share images have no alt field today
  (`seo.image` and `defaultSeoImage` are bare images); adding one means a schema change, CMS field change and
  content migration for little gain.
- `noindex` stays opt-in per page (`seo.noIndex`); today only `kitchen-sink`.
- **Preview-branch builds** (`WORKERS_CI_BRANCH` set and not `main`): every page also gets
  `<meta name="robots" content="noindex">`, so public previews stay out of search. Canonical and `og:url` keep
  pointing at production (`SITE_URL`), which is what a preview of a production page should declare. A share image
  added only on that branch may not resolve on its preview's share card until merged. *Builder's call.* Production
  builds are unchanged. Detection lives in one helper next to `site-url.mjs`, with a test.

### 4. CMS image safety (`public/admin/config.yml`)

- `choose_url: false` on every `widget: image` field (the shared `imageFields` anchor plus the three inline ones),
  so editors can't store a remote URL that fails the build.
- `media_libraries.default.config`: `slugify_filename: true`; `transformations.raster_image`: WebP, quality 90,
  max 2560×2560 (converts iPhone HEIC too); `svg: { optimize: true }`. Verify these keys against the pinned
  Sveltia version (0.253.1) before relying on them; drop any it rejects and say so.
- Test: every image field in `config.yml` has `choose_url: false`.

### 5. Responsive images (`ui/Media.astro`)

- Optimized images (`ImageMetadata`) render with Astro's built-in `<Picture>` (`formats={["avif", "webp"]}`,
  fallback format from the source), explicit `widths` per variant, and `sizes` matching the layout. Plain-URL images
  (CMS preview, YouTube thumbnails) stay `<img>`.
- Widths/sizes live in `Media.astro` beside the variant classes (one `Record` per variant), derived from the
  74rem container and each grid; never upscale (cap at the source width). Callers keep the existing `sizes` prop to
  override the variant default where one variant serves two layouts (`card` in `Venues` at ~50vw and `CardGrid`
  at ~25vw). *Builder's call.*
- `<picture>` must not break layouts: classes stay on the `<img>`; where a variant relies on the image being the
  grid/flex item, put layout on `pictureAttributes` (or `contents`). Check every variant visually: hero (mask),
  figure, gallery, video, card, media, portrait, sponsor, logo.
- Gallery full-size links and the share image keep using `getImage`.

### 6. Build checks, previews, docs

- `package.json`: `"build": "astro check && astro build"`.
- `wrangler.jsonc`: `"workers_dev": true`, `"preview_urls": true`. Owner action (dashboard): enable non-production
  branch builds in Workers Builds; the `SITE_URL` build variable must apply to preview builds too (production URL),
  or `site-url.mjs` fails them. Previews are public (owner's choice) but `noindex` (section 3).
- AGENTS.md: the Simple text column (content model, blocks list), share tags, image rules (`<picture>`,
  `choose_url: false`, upload conversion), measured contrast ratios for each text/background pair in both themes,
  "restart `npm run dev` after a schema change" gotcha, preview URLs. README hosting table: previews.

## Constraints

- AGENTS.md rules: daisyUI Blueprint workflow for UI, semantic colors only, static class strings, no authored CSS,
  square corners; live preview must keep working; `npm test`, `npm run check`, `npm run build` pass.
- Sveltia CMS 0.253.1 pinned; Astro 7.4.2 pinned.

## Left to the builder

- Exact widths/`sizes` per Media variant; whether `<Picture>` needs `pictureAttributes` per variant.
- Field hints and labels' wording in the CMS.
- Test names and fixtures.
- Order of tasks (suggested: block → about → images → tags → CMS → build/preview → docs).

## Open (owner)

- Favicon SVG (follow-up once supplied).
