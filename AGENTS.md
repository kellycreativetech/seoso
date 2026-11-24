# SEOSO — agent guide

Website for the **Southeastern Ohio Symphony Orchestra** (SEOSO): an **Astro** site in the repo root, content as
Markdown/JSON edited in **Sveltia CMS**, styled with **daisyUI 5 on Tailwind CSS 4**, hosted on **Cloudflare
Workers**. `README.md` covers hosting and editor setup; this file is the rules.

Read this whole file before changing anything, and **keep it accurate**: when a change makes anything here wrong
(a path, a command, a rule), fix this file in the same commit.

## Stack

| Piece | What | Where |
| --- | --- | --- |
| Framework | Astro 7.4.2 (pinned exactly), every page prerendered | `astro.config.mjs` |
| On-demand route | `/api/preview` only (`prerender = false`) — the CMS live preview | `src/pages/api/preview.astro` |
| Hosting | Cloudflare Worker `seoso` (static assets + the preview route), deployed by Workers Builds from `main`; every other branch gets a public, noindexed Preview URL | `wrangler.jsonc`, `@astrojs/cloudflare` |
| CMS | Sveltia CMS 0.253.1 (pinned, loaded from unpkg), GitHub backend, commits straight to `main` | `public/admin/` |
| CMS sign-in | Sveltia CMS Authenticator Worker + GitHub OAuth App (not in this repo) | `backend.base_url` in `config.yml` |
| Styling | Tailwind 4 (Vite plugin) + daisyUI 5 plugin; fonts self-hosted via Fontsource | `src/styles/global.css` |
| Markdown | `marked` (raw HTML is escaped) | `src/lib/markdown.ts` |
| Icons | `@lucide/astro` | |
| Lightbox | PhotoSwipe 5.4.4 (pinned), loaded only on pages with a gallery or video block | `src/lib/lightbox.ts` |
| Tests | Vitest 5 + Astro Container API (component rendering) | `test/` |

No React, Vue or Svelte in the site. The only React is the copy Sveltia bundles (`CMS.React`), used by
`public/admin/preview.js`.

## Layout

```
seoso/
├── astro.config.mjs        static output, file-format URLs (/about), Cloudflare adapter (skipped under Vitest)
├── site-url.mjs            SITE_URL (required on Cloudflare builds; localhost otherwise); isPreviewBuild()
├── wrangler.jsonc          Worker "seoso": assets from dist/, server entry for /api/preview
├── public/
│   ├── favicon.svg/.ico    owner's clef mark; icons/ holds the PNG set + site.webmanifest
│   ├── _redirects          /home → /; /awards-and-accolades, /symphony-in-action, /videos → /our-history#… (301)
│   └── admin/              Sveltia CMS: index.html, config.yml, preview.js
├── src/
│   ├── content/            ALL CONTENT — pages/, events/, news/, venues/, snippets/, settings/*.json
│   ├── assets/uploads/     images (CMS uploads land here; optimized at build)
│   ├── content.config.ts   collection schemas (build fails on invalid content)
│   ├── components/
│   │   ├── PageBuilder.astro      section wrappers + background tones; expands snippets
│   │   ├── PageView.astro         a page entry inside SiteLayout
│   │   ├── sections/              one component per block; SectionRenderer.astro maps `type` → component
│   │   ├── detail/                EventDetail, PostDetail, DetailHeader
│   │   ├── site/                  SiteHeader, SiteDrawer (mobile nav), SiteFooter, NavLink, NavBehavior, Logo
│   │   └── ui/                    Container, ButtonLink, Eyebrow, TextLink, SmartLink, Media, Heading
│   ├── layouts/            BaseLayout (head/meta), SiteLayout (header, drawer, footer)
│   ├── lib/                events (the "past" rule), rollover (browser drop-off), lightbox (photo/video overlay),
│   │                       dates (Eastern Time), sections (block schemas), preview (preview validation),
│   │                       feeds (.ics), links, inline (heading Markdown), markdown, site-data, event-data
│   ├── pages/              routes (below) + api/preview.astro + admin/preview.css.ts + events.ics.ts
│   └── styles/global.css   imports, @plugin blocks, @theme tokens — nothing else
├── test/                   lib/, components/, cms-config, preview-sync, smoke, review-fixes
└── docs/superpowers/       design spec and implementation plans
```

## Commands (repo root)

| Task | Command |
| --- | --- |
| Develop | `npm run dev` → http://localhost:4321 (CMS at `/admin/`, "Work with Local Repository") |
| Test | `npm test` |
| Type check | `npm run check` |
| Build | `npm run build` → `dist/` (runs `astro check` first, so type errors fail the build) |
| Run the built Worker | `npm run preview` → http://localhost:8787 |

Node version: `.node-version` (24). Cloudflare commands use `npx wrangler` (this repo has `wrangler.jsonc`).

**Restart `npm run dev` after changing a schema** (`src/lib/sections.ts`, `src/content.config.ts`). A running dev
server keeps entries it parsed under the old schema and silently drops new fields (e.g. a new block option has no
effect on an existing page) until it restarts. Cloudflare builds are unaffected (fresh checkout, no cache).

## Definition of done

1. `npm test`, `npm run check` and `npm run build` all pass.
2. UI changes: run the daisyUI Blueprint Quality Inspector (below) until it reports no errors, then look at the
   rendered page at a desktop **and** a mobile width, light and dark.
3. Component, schema or CMS changes: **check the CMS live preview still works** (see "Live preview").
4. Smoke-test every route you touched with `curl -s -o /dev/null -w '%{http_code}'`.
5. This file and `README.md` still describe the code.

## Routes

| URL | Source |
| --- | --- |
| `/` | the page named by `homePage` in `src/content/settings/site.json` (rendered with tone rotation) |
| `/[slug]` | `src/content/pages/<slug>.md` (except the home page; `events`, `news`, `admin`, `api` are reserved) |
| `/events`, `/news` | the `events` / `news` pages; dedicated routes so they coexist with the detail routes |
| `/events/[slug]`, `/news/[slug]` | an event / a news post |
| `/events.ics` | the season calendar feed (subscribe/download links on upcoming lists) |
| `/admin/`, `/admin/preview.css` | the CMS and the site CSS for its preview pane |
| `/api/preview` | on-demand, POST, same origin only — the live preview renderer |

Links resolve through `src/lib/links.ts` (`page: "home"` → `/`, `page: x` → `/x`, else `href`). If you add a
route, update it there too.

## Head, sharing and search

- `layouts/BaseLayout.astro` writes the title, description, `<link rel="canonical">` (production URL from
  `SITE_URL`, no `.html` or trailing slash), `og:title/description/url/site_name/type`, `og:image` (1200×630, from
  the page's `seo.image` or `site.defaultSeoImage`) with width, height and alt (= the page title),
  `twitter:card summary_large_image`, and the favicon/manifest links.
- `noindex` is opt-in per page (`seo.noIndex`; today `kitchen-sink` and `404`). **Branch-preview builds**
  (`WORKERS_CI_BRANCH` set and not `main`, see `isPreviewBuild` in `site-url.mjs`) noindex every page via the
  `import.meta.env.SEOSO_NOINDEX_ALL` define in `astro.config.mjs`.
- Icons come from the owner's `public/favicon.svg` (the treble clef, cropped by design). Regenerate the PNGs with
  `sips -s format png -z <n> <n> public/favicon.svg` (headless Chrome renders them wrongly); `favicon.ico` wraps
  the 32px PNG.

## Content model

- **Pages** (`pages/*.md`): `title`, `seo`, `sections` — an ordered list of blocks; list order = page order.
- **Snippets** (`snippets/*.md`): `name`, `sections` — reusable blocks, included with the `snippet` block.
- **Events** (`events/*.md`): `title`, `isNamedProgram`, `start`, `end`, `venue` (venue slug), `summary`,
  `admission`, `tickets` (URL), `image`, `seo`, Markdown body. Times are stored in UTC and **always displayed in America/New_York**
  (`src/lib/dates.ts`); the CMS enters them in Eastern time.
- **News** (`news/*.md`): `title`, `date`, `excerpt`, `summary`, `facts` (label/value), `image`, `seo`, body.
- **Venues** (`venues/*.md`): `name`, `city`, `address`, `directions`, `website`, `image`.
- **Settings**: `site.json` — `title`, `organizationName`, `tagline`, `description`, `logo`, `defaultSeoImage`,
  `homePage`, `donateLink`, `mailingAddress`, `email`, `social`; `navigation.json` — `items` (links with
  `children`); `footer.json` — `links`, `note`.
- **Blocks** (`SECTION_TYPES` in `src/lib/sections.ts`): hero, eventsList, highlightBand, newsList, richText,
  people, contacts, venues, gallery, video, textMedia, cardGrid, testimonials, ctaBand, faq, stats, logos,
  simpleText, snippet.
- **Text pages** use the **Simple text column** block (`simpleText`, `sections/SimpleText.astro`): eyebrow,
  `title`, `intro`, optional `image`, Markdown `body`. It draws its own black title band over a white body, both in
  the long-form text column (cols 4–11, 62ch); the title is the page's `h1` when the block is first. There is one
  page type (Pages) — no separate "basic page" collection. `about` uses it; `donate` keeps a Masthead because of
  its buttons.
- Headings are one line of inline Markdown: `*italic*` and `~~strike~~` only (`src/lib/inline.ts`).
- **Image output** (`ui/Media.astro`, used for every content image): optimized images render as `<picture>`
  (AVIF + WebP sources, widths per variant in `widthsFor`, never above the source width, default `sizes` per
  variant in `defaultSizes`; callers pass `sizes` when a variant sits in another layout). `<picture>` is `block`
  — never `contents`, which turns its `<source>` children into grid/flex items and adds gaps. A source smaller
  than the requested size keeps its own shape (as `<Image>` did). Plain URLs (CMS preview `blob:` uploads,
  YouTube thumbnails) stay `<img>`. Gallery full-size links and share images use `getImage`.
- Images: referenced relative to the content file (`../../assets/uploads/…`). The CMS media library may save the
  repo path (`/src/assets/uploads/…`); `normalizeUploadPath` converts it.
- `src/content/pages/kitchen-sink.md` (`noIndex`) shows one of every block — use it for visual checks.

**Adding or changing a block:** schema in `src/lib/sections.ts` → component in `src/components/sections/` → case
in `SectionRenderer.astro` → type and fields in `public/admin/config.yml` (`pages` and `snippets` both list it)
→ `npm test` (`test/cms-config.test.ts` checks the CMS offers exactly the schema's types and fields) → check the
live preview.

## Live preview (must keep working)

The CMS preview pane shows the entry being edited rendered by **the real Astro components** — there is no second
copy of the markup. Keep it that way: do not add React (or any other) preview components.

**How it works:**
1. `public/admin/preview.js` (plain browser JS, no build step) registers a preview template for the `pages`,
   `snippets`, `events` and `news` collections. On edit (300 ms debounce) it POSTs
   `{ collection, slug, data }` to `/api/preview`, with image paths resolved through `getAsset` so unsaved
   uploads show.
2. `src/pages/api/preview.astro` validates the data with `parsePreview` (`src/lib/preview.ts`; never throws,
   counts half-filled blocks), renders it with `SiteHeader`, `PageBuilder` / `EventDetail` / `PostDetail` and
   `SiteFooter`, and returns HTML.
3. `CMS.registerPreviewStyle("/admin/preview.css")` loads the site's compiled CSS (`src/pages/admin/preview.css.ts`).
4. `PageBuilder` with `preview` adds `data-key-path="sections.N"` so clicking a block highlights its fields.
5. Scripts inside the returned HTML don't run in the pane; the server renders the state as of the request. (So
   the lightbox doesn't open in the preview; gallery and video thumbnails are plain links there.)

**Keep `public/admin/preview.js` in sync.** It is not type-checked or bundled, so it is easy to forget. When you
change any of the following, update `preview.js` in the same commit:

| You change… | Then update in `preview.js` |
| --- | --- |
| Which collections have a preview (`parsePreview` cases, `api/preview.astro`) | the collection list passed to `registerPreviewTemplate` |
| A collection's name or folder in `config.yml` | the collection list |
| The upload folder (`media_folder`, `UPLOADS_ABSOLUTE` in `sections.ts`) | the `UPLOADS` prefixes |
| The `/api/preview` request shape or URL | the `fetch` body/URL |
| The CSS route `/admin/preview.css` | `registerPreviewStyle` |

Changing a section or detail **component's markup** does not need a `preview.js` change (the preview renders the
real component), but it does need a preview check, because the component also renders in preview mode:
- images may be plain URLs, including `blob:` uploads (use `ui/Media.astro`, never assume `ImageMetadata`);
- data may be half-filled (optional fields blank, lists empty) — render nothing rather than throw;
- the block must not depend on browser JS to look right.

`test/preview-sync.test.ts` fails if the collections in `preview.js`, `parsePreview` and `config.yml` drift, or if
the upload prefixes disagree. It cannot see markup — **after any component change, open the CMS preview**
(`npm run dev` → `/admin/` → local repository) **for a page using that block, an event and a news post**, or at
least POST a sample to `/api/preview` (`-H 'Origin: http://localhost:4321'`) and read the HTML.

## Event rollover (no rebuilds)

- An event is past from **midnight America/New_York on the day after it ends** (its start if no end):
  `pastAt()` in `src/lib/events.ts` — the only definition. Don't add another.
- Pages are prerendered, so "now" is the build time. Upcoming lists print **every** upcoming event; each row has
  `data-past-at` (the `pastAt` instant). `src/lib/rollover.ts` runs in the browser (an Astro `<script>` in
  `EventsList.astro` / `EventDetail.astro`) and hides rows whose instant has passed, reapplies the block's
  `limit` (rows beyond it are printed but start `hidden`), hides empty year headings, and shows the
  `[data-rollover-empty]` message when nothing is left. Event pages switch `[data-show-until]` /
  `[data-show-from]` elements (ticket button, "coming soon" vs "has taken place").
- The server computes the initial state with the same `rolloverVisibility()` function, so nothing jumps. Keep it
  that way: if you change row markup in `EventList.astro`, keep year rows and event rows as direct `li` children
  of the `[data-rollover]` list.
- "Past" lists and breadcrumbs only update on the next build (any CMS save triggers one).

## Design system (keep this look)

The homepage is the reference for every page:

- **Classy**, with a best-practice typographic scale; works on all screen sizes.
- **Colors: black, white, and the logo blue only.** No glassy/frosted cards, no gradients-as-decoration, no rounded
  "SaaS" cards, no shadows. Square corners everywhere.
- **Display type:** Newsreader (variable serif with true italics). Italic words in headings are set in the serif
  italic (often in logo blue on black). **Body type:** Source Sans 3, 18px.
- Black "stage" sections (header, masthead, highlight bands, detail headers, footer) alternate with white content
  sections. Content sits on a 12-column measure, max width 74rem (`ui/Container.astro`).
- Section backgrounds are set in `PageBuilder.astro`, not in section components: a "stage" wrapper gets
  `data-theme="seoso-dark"` + `bg-neutral`, which scopes the dark palette onto pure black. Default: `hero` and
  `highlightBand` are stage. The home page (`rotateTones`): first two sections black, then base / black alternate.
  Blocks that can land on either tone must use `base-*` colors and the `brandOnBase` / `outlineOnBase` buttons.
- Navigation comes from `settings/navigation.json`, plus the Donate button from `settings/site.json`.

| Token | `seoso` (light) | `seoso-dark` | Use |
| --- | --- | --- | --- |
| `primary` | `#13a9e1` | `#13a9e1` | Logo blue: buttons, graphic use, italic emphasis/eyebrows **on black** |
| `secondary` | `#0a6d93` | `#3dbdee` | Blue for small text and links **on white** (contrast) |
| `neutral` / `-content` | `#000` / `#fff` | same | Black stage sections |
| `base-100/200/300` | `#fff` / `#f4f6f7` / `#dfe3e6` | `#0b0c0d` / `#141618` / `#262a2d` | Surfaces, rules |
| `base-content` | `#0a0a0a` | `#f4f6f7` | Text |
| Radius / `--border` / `--depth` / `--noise` | `0` / `1.5px` / `0` / `0` | same | Square, flat |

Measured contrast (WCAG 2, text on background; AA needs 4.5:1, large text 3:1):

| Pair | `seoso` | `seoso-dark` |
| --- | --- | --- |
| base-content on base-100 | 19.8:1 | 18.1:1 |
| base-content/70 on base-100 | 7.6:1 | 9.0:1 |
| base-content on base-200 | 18.3:1 | 16.7:1 |
| secondary on base-100 (links, eyebrows) | 5.8:1 | 9.1:1 |
| secondary on base-200 | 5.3:1 | 8.4:1 |
| primary on neutral (italics, eyebrows on black) | 7.8:1 | 7.8:1 |
| neutral-content on neutral | 21.0:1 | 21.0:1 |
| neutral-content/90 on neutral (leads) | 16.7:1 | 16.7:1 |
| primary-content on primary (brand button) | 7.8:1 | 7.8:1 |
| warning-content on warning (CMS preview notice) | **4.2:1** (below AA) | 11.1:1 |

Re-measure any new pair before using it. The light warning pair is only used for the CMS preview's
"couldn't be previewed" notice; darken `--color-warning` in the `seoso` theme if it is ever used on the site.

Type scale (major third on 18px), Tailwind `@theme` tokens in `src/styles/global.css`: `text-small` 0.889rem ·
`text-body` 1.125rem · `text-lead` 1.406rem · `text-title` 1.758rem · `text-h3` 2.197rem · `text-h2` 2.747rem ·
`text-h1` 3.433rem · `text-display` 5.4rem · `text-figure` 13rem. Step sizes up with breakpoints
(`text-h3 sm:text-h2`); **never** use viewport-scaled (`vw`/`clamp`) font sizes.

Recurring patterns — reuse the components rather than restyling:

- **Eyebrow** (`ui/Eyebrow.astro`): small uppercase, `tracking-[0.14em]`; tones `brand` (on black),
  `brandOnLight`, `muted`.
- **Section header** (`sections/SectionHeader.astro`): eyebrow, serif heading (cols 1–7), optional note (cols 9–12).
- **Rules:** a `border-t-2 border-base-content` heads every list/grid; `border-base-300` between rows.
- **Buttons** (`ui/ButtonLink.astro`): uppercase, `tracking-[0.1em]`; variants `brand`, `brandBlock`,
  `brandOnBase`, `outlineOnBase`, `outlineOnDark`, `outlineOnDarkSmall`. Brand first, outline second.
- **Text links** (`ui/TextLink.astro`): `link link-secondary`, semibold, offset underline.
- **Events list** (`sections/EventList.astro`): programme layout — date | what | where, year rows in blue italic.
- **Photos and videos** (`sections/Gallery.astro`, `sections/Video.astro`): black-and-white thumbnails (`grayscale`
  on the link) that open in the PhotoSwipe overlay with next/prev (`src/lib/lightbox.ts`). The list carries
  `data-lightbox`; photo links point at the full-size image with `data-pswp-width`/`-height`; video links point at
  the YouTube watch page with `data-youtube-id` and use YouTube's `hqdefault.jpg` as the thumbnail. Videos play
  through youtube-nocookie and load only while their slide is shown. Without JS every link still works.

Two themes, `seoso` (default) and `seoso-dark` (`prefersdark`), both in `global.css`. Do not add a theme switcher
or more themes unless asked.

## daisyUI rules (mandatory)

daisyUI 5 is installed as a package (`@plugin "daisyui"` in `global.css`); there is no `tailwind.config.js`. Two
daisyUI MCP servers may be configured: `daisyui` (free docs) and `daisyui-blueprint` (licensed). **Use the
Blueprint workflow for UI work** (`projectRoot: /Users/kaseykelly/Sites/seoso`):

1. `daisyui_setup_expert` (workflowId + projectRoot) → `daisyui_rules_enforcer`.
2. For a brand-new page type, also `daisyui_creative_director` → `daisyui_page_architect`.
3. `daisyui_component_syntax_expert` for every component you write or change (keep calling until no IDs remain).
4. Write the code, then `daisyui_quality_inspector` with `auditIntent: "fix_changes"` and the changed files (paths
   relative to the repo root). Fix every **error**; rerun once. Then do its manual review on the rendered page.
   Copy-only or attribute-only changes may skip the inspector; say so in the commit or PR.

Blueprint keeps workflow state per server process; all calls for one workflow go through the same session.

Hard rules:

- daisyUI component classes first (`navbar`, `menu`, `drawer`, `btn`, `link`, `list`/`list-row`, `footer`,
  `breadcrumbs`, `collapse`, …); Tailwind utilities for layout, spacing and responsive behavior.
- **Semantic colors only** (`bg-neutral`, `text-secondary`, `border-base-300`, `text-base-content/70`). No raw
  palette colors (`text-gray-600`), no `dark:` variants, no `bg-[var(--x)]`, no new `:root` vars. New colors go
  into both daisyUI themes as tokens.
- **No authored CSS selectors.** `global.css` holds only imports, `@plugin` blocks and `@theme` tokens. Effects
  are arbitrary utilities in markup (`[mask-image:linear-gradient(...)]`); Markdown element styles are arbitrary
  variants on the wrapper (`sections/Markdown.astro`).
- **Static class strings only.** Never build class names with template literals or pass-through `class` props. Use a
  `Record<Variant, string>` of complete strings (`ButtonLink`, `Eyebrow`) or a ternary between two complete strings.
  `Container` takes no `class` — put layout classes on a child div.
- A daisyUI part lives in the same component as its root (`drawer-side` with `drawer` → `SiteDrawer.astro`).
- `list-disc`/`list-decimal` read as daisyUI `list` variants — use `[list-style-type:disc]`.
- Icons: `@lucide/astro`. Icon-only controls need `aria-label`.
- Hero/first-viewport images load eagerly; everything below the fold `loading="lazy"`.
- Hide things with the `hidden` attribute (Tailwind's preflight enforces it), not with toggled classes.

daisyUI gotchas:

- `.list .list-row > *` forces `grid-row-start: 1`. To wrap a cell to a second row on mobile use `list-col-wrap`
  (and `md:row-start-1` to bring it back). `list-row` sets `word-break: break-word`; add `break-normal` to numerals.
- No `after:` utilities on `list-row` (they add `content` and become a grid item); use `border-b border-base-300`.
- The `drawer` checkbox and `<details>` dropdowns are CSS-only; `site/NavBehavior.astro` closes them on link click,
  outside click and Escape.

## CMS rules

- `public/admin/config.yml` paths are relative to the repo root (`src/content/pages`). Each collection stores
  image paths relative to its folder (`media_folder: ../../assets/uploads`); the top-level `media_folder`
  (`/src/assets/uploads`) is only for the media library.
- Every `widget: image` field has `choose_url: false` (a typed-in remote URL fails the build). Uploads are
  converted in the browser before they are committed (`media_libraries.default.config`): photos, iPhone HEIC
  included, become WebP q90 at most 2560px; SVGs are optimized; file names are slugified. `test/cms-config.test.ts`
  checks both.
- To drive the CMS headlessly (no sign-in), use the `building-astro-sveltia-sites` skill's `cms-local-test.mjs`
  from a scratch folder with Playwright installed next to it, with its `walk('content')` changed to
  `walk('src/content')`, against `npx astro dev` (open `/admin/index.html`).
- Field names must match the schemas in `src/lib/sections.ts` and `src/content.config.ts`. `test/cms-config.test.ts`
  checks block types and fields, that every folder/file exists, the GitHub backend on `main`, and that event times
  are entered in Eastern time and stored as UTC.
- The CMS saves untouched optional fields as `""` (or omits them); schemas treat blanks as empty (`optional()`,
  `blankToNull`). Keep new optional fields on those helpers.
- Sveltia is pinned in `public/admin/index.html` (pre-1.0) — upgrade deliberately and re-check the live preview.
- Never commit secrets. OAuth credentials live on the authenticator Worker; `SITE_URL` is a Workers Builds
  variable.

## Content provenance

Content was imported from the previous seoso.org site and the 2026–27 season PDF; text is verbatim except light
cleanup. Contacts include a personal booking email published on the old site — confirm with SEOSO before
promoting it further.
