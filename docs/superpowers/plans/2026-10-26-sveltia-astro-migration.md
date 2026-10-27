# SEOSO on Astro + Sveltia CMS (Cloudflare Workers) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the SEOSO site as a static Astro site whose content lives in the repo and is edited in Sveltia CMS with an accurate live preview, deployed free on Cloudflare Workers, with all Sanity content migrated.

**Architecture:** A new `site/` Astro project, prerendered except one on-demand route (`/api/preview`) that renders CMS entries with the real `.astro` components through Astro's Container API. Content is Markdown/JSON validated by Astro content-collection schemas; pages are ordered `sections` lists in frontmatter. A separate cron Worker (`workers/rollover/`) reads the built `/events.json` and triggers a rebuild only when a concert is due to fall off.

**Tech Stack:** Astro 7.4.2 (pinned exactly), @astrojs/cloudflare 14.x, Tailwind CSS 4.3 + daisyUI 5.7 (Vite plugin), @sveltia/cms 0.253.1 (pinned, loaded from unpkg), marked (Markdown), yaml, vitest 5, wrangler 4, @fontsource-variable/newsreader + @fontsource-variable/source-sans-3.

**Spec:** `docs/superpowers/specs/2026-10-26-sveltia-astro-migration-design.md`

## Global Constraints

- Work on branch `sveltia`. Do not modify `web/`, `studio/`, `netlify.toml`, or anything on `main`.
- All new code lives under `site/` and `workers/rollover/`; `site/` is the Workers Builds root directory.
- Pin `astro` to exactly `7.4.2` (Container API is experimental: "subject to breaking changes, even in minor or patch releases").
- Every public route is prerendered; only `src/pages/api/preview.ts` sets `export const prerender = false`.
- No React, Vue or Svelte in the site's code. The only React is Sveltia's bundled `CMS.React`, used through HTM in `public/admin/preview.js`.
- Visual design = current site (see `AGENTS.md` "Design system" and the components in `web/src/components/`): daisyUI 5 semantic colors only, `seoso` / `seoso-dark` themes copied from `web/src/app/globals.css`, square corners, no shadows, no authored CSS selectors, static class strings (`Record<Variant, string>`, never pass-through `class` props), Newsreader + Source Sans 3.
- Section background tones: masthead (`hero`) and `highlightBand` are "stage" by default; the home page alternates (first two stage, then base/stage…). Stage wrapper = `data-theme="seoso-dark"` + `bg-neutral text-base-content`.
- Event dates are stored in UTC (ISO strings) and always displayed in `America/New_York`.
- An event is past from 00:00 America/New_York on the day after its end date (start date if no end).
- No secret in the repo. Secrets (OAuth client ID/secret, deploy hook URL) live only in Cloudflare.
- Headings are inline Markdown: `*x*` → `<em>`, `~~x~~` → `<s>`; everything else escaped.
- Follow the daisyUI Blueprint workflow (`AGENTS.md`) for every UI task, with `projectRoot: /Users/kaseykelly/Sites/seoso/site`.
- Content paths in the CMS config are relative to the repo root (e.g. `site/src/content/pages`).

## Review Focus

1. Editor text containing `<`, `&`, quotes or stray `*` in headings, labels and alt text → escaped, never injected as HTML (site and preview). Test in Task 2 and Task 9.
2. Events on DST-change days, late-evening events whose UTC date is the next day, and events with an end on a later day → fall off at the right midnight. Test in Task 2.
3. Sections saved with optional fields blank (no image, empty card list, no buttons) → render without crashing or empty wrappers. Test in Task 6 and Task 7.
4. A Snippet that includes itself, or a page referencing a deleted snippet → renders the rest of the page, no loop, no 500. Test in Task 3.
5. Preview of an entry with an unsaved upload (`blob:` URL) or a half-filled block that fails schema validation → preview still renders what it can and shows a small inline notice, never a blank pane. Test in Task 9.

---

### Task 1: Scaffold `site/` and the design system

**Files:**
- Create: `site/package.json`, `site/astro.config.mjs`, `site/wrangler.jsonc`, `site/tsconfig.json`, `site/vitest.config.ts`, `site/.node-version` (`24`), `site/src/styles/global.css`, `site/src/layouts/BaseLayout.astro`, `site/src/pages/index.astro` (temporary), `site/test/smoke.test.ts`, `site/.gitignore`

**Interfaces:**
- Produces: `BaseLayout.astro` props `{ title: string; description?: string; image?: string; noIndex?: boolean }` with a default slot; `global.css` with the two daisyUI themes and the type-scale `@theme` tokens copied verbatim from `web/src/app/globals.css`; npm scripts `dev`, `build`, `preview` (`wrangler dev`), `test` (`vitest run`), `check` (`astro check`).

- [ ] **Step 1: Write the failing test** — `test/smoke.test.ts` renders `BaseLayout` through `experimental_AstroContainer` with `{ title: "SEOSO" }` and a slot `<p>hi</p>`; assert the HTML contains `<title>SEOSO</title>`, `lang="en"` and `<p>hi</p>`. Use `getViteConfig` from `astro/config` in `vitest.config.ts`.
- [ ] **Step 2: Run** `cd site && npm test` — Expected: FAIL (no project / module not found).
- [ ] **Step 3: Implement** the files above. `astro.config.mjs`: `output: "static"`, `adapter: cloudflare({ imageService: "compile" })`, `vite.plugins: [tailwindcss()]`, `site` read from `process.env.SITE_URL` with fallback `http://localhost:4321`. `wrangler.jsonc`: `name: "seoso"`, `main: "@astrojs/cloudflare/entrypoints/server"`, `assets: { directory: "./dist", binding: "ASSETS" }`, `compatibility_flags: ["nodejs_compat"]`, current `compatibility_date`. Fonts via Fontsource imports in `global.css`.
- [ ] **Step 4: Run** `npm test && npm run build` — Expected: PASS; `dist/index.html` exists.
- [ ] **Step 5: Commit** `feat(site): scaffold Astro site with SEOSO design tokens`

### Task 2: Shared rules — event timing, dates, inline headings, links

**Files:**
- Create: `site/src/lib/events.ts`, `site/src/lib/dates.ts`, `site/src/lib/inline.ts`, `site/src/lib/links.ts`
- Test: `site/test/lib/events.test.ts`, `site/test/lib/inline.test.ts`, `site/test/lib/links.test.ts`

**Interfaces:**
- Produces:
  - `type EventTimes = { start: Date; end?: Date | null }`
  - `pastAt(e: EventTimes): Date` · `isPast(e: EventTimes, now: Date): boolean` · `nextRollover(events: EventTimes[], now: Date): Date | null` (earliest `pastAt` among events not yet past)
  - `dates.ts`: `formatTime`, `eventDateParts`, `formatDate` — same names and outputs as `web/src/lib/dates.ts` (port it)
  - `renderInline(md: string): string`
  - `type Link = { label: string; href?: string; page?: string }` · `resolveHref(link: Link): string | null` (`page: "home"` → `/`, `page: x` → `/x`, else `href`, else `null`) · `isExternal(href: string): boolean`

- [ ] **Step 1: Write the failing tests**

```ts
// events.test.ts
expect(pastAt({ start: new Date("2026-10-20T23:00:00Z") }).toISOString()).toBe("2026-10-21T04:00:00.000Z");
expect(pastAt({ start: new Date("2026-11-01T18:00:00Z") }).toISOString()).toBe("2026-11-02T05:00:00.000Z"); // DST ends
expect(pastAt({ start: new Date("2027-03-13T23:00:00Z") }).toISOString()).toBe("2027-03-14T05:00:00.000Z"); // DST starts
expect(pastAt({ start: new Date("2026-12-09T03:30:00Z") }).toISOString()).toBe("2026-12-09T05:00:00.000Z"); // 10:30pm ET Dec 8
expect(pastAt({ start: new Date("2026-12-09T03:00:00Z"), end: new Date("2026-12-09T06:00:00Z") }).toISOString()).toBe("2026-12-10T05:00:00.000Z");
const e = { start: new Date("2026-10-20T23:00:00Z") };
expect(isPast(e, new Date("2026-10-21T03:59:59.999Z"))).toBe(false);
expect(isPast(e, new Date("2026-10-21T04:00:00Z"))).toBe(true);
expect(nextRollover([e, { start: new Date("2026-11-11T15:15:00Z") }], new Date("2026-10-22T00:00:00Z"))?.toISOString()).toBe("2026-11-12T05:00:00.000Z");
expect(nextRollover([e], new Date("2026-10-22T00:00:00Z"))).toBeNull();
// inline.test.ts
expect(renderInline("I’m with the ~~band~~ *Symphony*")).toBe("I’m with the <s>band</s> <em>Symphony</em>");
expect(renderInline(`<b>"A" & 'B'</b>`)).toBe("&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;");
expect(renderInline("5 * 3 = 15")).toBe("5 * 3 = 15");
// links.test.ts
expect(resolveHref({ label: "Home", page: "home" })).toBe("/");
expect(resolveHref({ label: "About", page: "about", href: "/x" })).toBe("/about");
expect(resolveHref({ label: "Shop", href: "https://www.bonfire.com/im-with-the-symphony/" })).toBe("https://www.bonfire.com/im-with-the-symphony/");
expect(resolveHref({ label: "Nothing" })).toBeNull();
```

- [ ] **Step 2: Run** `npm test -- lib` — Expected: FAIL (modules missing).
- [ ] **Step 3: Implement.** `pastAt`: take the ET calendar date of `end ?? start` via `Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" })`, add one day, return the UTC instant of 00:00 ET on that date (try UTC 04:00, use 05:00 if ET hour isn't 0). `renderInline`: escape HTML first, then replace `~~(.+?)~~` and `\*(\S(?:.*?\S)?)\*` only.
- [ ] **Step 4: Run** `npm test -- lib` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(site): event rollover rule, ET dates, inline headings, links`

### Task 3: Content schemas and section model

**Files:**
- Create: `site/src/content.config.ts`, `site/src/lib/sections.ts`, `site/test/fixtures/` (one valid page, one invalid), `site/test/lib/sections.test.ts`
- Create empty dirs with `.gitkeep`: `site/src/content/{pages,events,news,venues,snippets,settings}`, `site/src/assets/uploads`

**Interfaces:**
- Consumes: `Link` from Task 2.
- Produces:
  - `SECTION_TYPES = ["hero","eventsList","highlightBand","newsList","richText","people","contacts","venues","gallery","video","textMedia","cardGrid","testimonials","ctaBand","faq","stats","logos","snippet"] as const`
  - `sectionSchema(image)` — zod discriminated union on `type`; every section has optional `anchorId`; image fields `{ src: image(); alt: string }`; buttons `Link[]` max 2. Fields per type (camelCase): hero `{eyebrow?, heading, lead?, buttons?, image?}`; eventsList `{eyebrow?, heading?, note?, scope: "upcoming"|"past", limit?, footerLink?, disclaimer?}`; highlightBand `{figure?, eyebrow?, heading, body?, buttons?}`; newsList `{eyebrow?, heading?, limit, footerLink?}`; richText `{eyebrow?, heading?, body}`; people `{eyebrow?, heading?, intro?, people: {name, role?, email?}[]}`; contacts `{eyebrow?, heading?, intro?, contacts: {purpose, name?, email?, phone?}[]}`; venues `{eyebrow?, heading?, intro?}`; gallery `{eyebrow?, heading?, images: image[]}`; video `{eyebrow?, heading?, videos: {youtubeId, title}[]}`; textMedia `{eyebrow?, heading?, body, buttons?, mediaSide: "left"|"right", media?: {kind:"image", image} | {kind:"video", youtubeId, title}}`; cardGrid `{eyebrow?, heading?, intro?, columns: 2|3|4, cards: {title, text?, image?, link?}[]}`; testimonials `{eyebrow?, heading?, quotes: {quote, name, role?, photo?}[] (1–3)}`; ctaBand `{heading, text?, buttons}`; faq `{eyebrow?, heading?, items: {question, answer}[]}`; stats `{eyebrow?, heading?, stats: {value, label}[] (2–4)}`; logos `{eyebrow?, heading?, logos: {image, name, href?}[]}`; snippet `{snippet: string}`
  - `type Section` · `expandSnippets(sections: Section[], snippets: Map<string, Section[]>): { section: Section; sourceIndex: number }[]` (snippet items replaced by that snippet's sections, all tagged with the snippet item's index; nested `snippet` items and unknown slugs dropped)
  - Collections: `pages` `{title, seo?:{title?,description?,image?,noIndex?}, sections}` (slug = filename); `events` `{title, isNamedProgram?, start, end?, venue?: string (venue slug), summary?, admission?, tickets?: Link}` + Markdown body; `news` `{title, date, excerpt?, summary?, facts?: {label,value}[], image?}` + body; `venues` `{name, city, address?, directions?, website?}`; `snippets` `{name, sections}`; `settings` (file loader per JSON): `site` `{title, tagline?, logo?, defaultSeoImage?, donateLink?: Link, mailingAddress?, email?, social?: {platform, url}[], homePage: string}`, `navigation` `{items: (Link & {children?: Link[]})[]}`, `footer` `{links: Link[], note?}`

- [ ] **Step 1: Write the failing tests** — valid fixture parses with `sectionSchema` for every type in `SECTION_TYPES` (one minimal object each); `{type:"hero"}` without `heading` fails; `textMedia` with `mediaSide: "top"` fails; `expandSnippets([{type:"snippet",snippet:"appeal"},{type:"richText",body:"x"}], new Map([["appeal",[{type:"ctaBand",heading:"Give",buttons:[]},{type:"snippet",snippet:"appeal"}]]]))` returns `[{section:{type:"ctaBand",…},sourceIndex:0},{section:{type:"richText",…},sourceIndex:1}]`; unknown slug `"gone"` yields only the other sections.
- [ ] **Step 2: Run** `npm test -- sections` — Expected: FAIL.
- [ ] **Step 3: Implement** `sections.ts` and `content.config.ts` (glob loaders on `src/content/<name>/**/*.md`, `file()` loaders for the three settings JSON files). Schema functions take Astro's `image` helper so the same schema validates build content; export a variant that accepts `z.string()` for image `src` for preview use (Task 9).
- [ ] **Step 4: Run** `npm test -- sections && npm run check` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(site): content collections and page-section schema`

### Task 4: Migrate content from Sanity

**Files:**
- Create: `site/scripts/sanity-transform.ts`, `site/scripts/migrate-from-sanity.ts`, `site/test/scripts/sanity-transform.test.ts`
- Generates: `site/src/content/**`, `site/src/assets/uploads/**`

**Interfaces:**
- Consumes: `Section`, `Link` shapes from Tasks 2–3.
- Produces: `portableTextToMarkdown(blocks: PtBlock[]): string` · `headingToInline(blocks: PtBlock[] | null): string` · `transformLink(l: SanityLink, ctx: Ctx): Link` · `transformSection(s: SanityBlock, ctx: Ctx): Section` where `Ctx = { slugById: Map<string,{type:"page"|"event"|"post"; slug:string}>; imagePath(ref: string): string }`. CLI: `npm run migrate [-- --force]`.

- [ ] **Step 1: Write the failing tests** (fixtures copied from real document shapes in the Sanity query results):
  - heading `[{children:[{text:"I’m with the ",marks:[]},{text:"band",marks:["strike-through"]},{text:" ",marks:[]},{text:"Symphony",marks:["em"]}]}]` → `"I’m with the ~~band~~ *Symphony*"`
  - block content with `strong`, `em`, a link markDef, bullet list and `h3` → expected Markdown string (`**…**`, `*…*`, `[text](url)`, `- item`, `### …`)
  - link `{linkType:"internal", internal:{_ref:"MkzIlesDIMzd9qSpNEMIer"}, label:"Donate"}` with ctx mapping that ref to page `donate` → `{label:"Donate", page:"donate"}`; internal ref to an event → `{label, href:"/events/<slug>"}`; external `#season` → `{label, href:"#season"}`
  - Sanity `eventsSection` → `{type:"eventsList", scope:"upcoming", limit:5, …}`; `highlightBand` with `figure` image → `{type:"highlightBand", figure:{src:"<path>", alt:"…"}, buttons:[…]}`; `textSection` → `richText`; `contactSection` → `contacts`; `newsSection` → `newsList`; `videoSection` → `video`; `gallerySection` → `gallery`; `venuesSection` → `venues`; `peopleSection` → `people`.
- [ ] **Step 2: Run** `npm test -- sanity-transform` — Expected: FAIL.
- [ ] **Step 3: Implement.** Query `https://cerintdw.apicdn.sanity.io/v2025-02-19/data/query/production` (published perspective, no token). Download each referenced image asset to `src/assets/uploads/<slugified-original-filename>-<first 8 of asset id hash>.<ext>`; image paths in frontmatter are relative to the Markdown file (`../../assets/uploads/…`). Files: `pages/<slug>.md`, `events/<slug>.md`, `news/<slug>.md`, `venues/<slug>.md`, `settings/{site,navigation,footer}.json`. Refuse to write if any target exists unless `--force`. Drop Sanity hotspot/crop (components set object-position).
- [ ] **Step 4: Run** `npm test -- sanity-transform && npm run migrate && npm run build`
  Expected: tests PASS; script prints `pages 11, events 35, venues 10, news 5, images 32, settings 3`; build succeeds (schemas accept every file).
- [ ] **Step 5: List unpublished drafts** — `cd studio && npx sanity documents query '*[_id in path("drafts.**")]{_id,_type,title}'` (uses the owner's CLI login). Save the output in the task report for the owner; do not migrate drafts.
- [ ] **Step 6: Commit** `feat(site): migrate published Sanity content to Markdown`
- [ ] **Step 7: Tell the owner** that Sanity is now frozen: editors should stop editing in the Sanity Studio; later Sanity edits are copied by hand.

### Task 5: Page chrome and PageBuilder

**Files:**
- Create: `site/src/components/ui/{Container,ButtonLink,Eyebrow,TextLink,SmartLink,Media,Heading}.astro`, `site/src/components/site/{SiteHeader,SiteDrawer,SiteFooter,NavBehavior}.astro`, `site/src/components/PageBuilder.astro`, `site/src/components/sections/SectionRenderer.astro`, `site/test/components/page-builder.test.ts`, `site/test/components/ui.test.ts`
- Modify: `site/src/layouts/BaseLayout.astro` (header + footer from `settings`)

**Interfaces:**
- Consumes: `Section`, `expandSnippets`, `resolveHref`, `isExternal`, `renderInline`.
- Produces:
  - `PageBuilder.astro` props `{ sections: Section[]; rotateTones?: boolean; preview?: boolean }`. Tone per expanded index `i`: rotate → `i < 2 || i % 2 === 1` stage; default → `hero`/`highlightBand` stage. In `preview` mode each wrapper gets `data-key-path="sections.<sourceIndex>"`.
  - `SectionRenderer.astro` props `{ section: Section }` — switch on `type` (sections added in Tasks 6–7; unknown type renders nothing).
  - `Media.astro` props `{ src: ImageMetadata | string; alt: string; width: number; height: number; variant: MediaVariant; loading?: "lazy" | "eager" }` — `astro:assets` `<Image>` for `ImageMetadata`, plain `<img>` for strings (preview). `MediaVariant` is a `Record` of complete class strings.
  - `ButtonLink.astro` variants `brand | brandBlock | brandOnBase | outlineOnBase | outlineOnDark | outlineOnDarkSmall` (class strings copied from `web/src/components/ui/ButtonLink.tsx`); props `{ link: Link; variant }`.
  - `Heading.astro` props `{ text: string }` → `<Fragment set:html={renderInline(text)} />`.

- [ ] **Step 1: Write the failing tests** — PageBuilder with 5 dummy richText sections and `rotateTones` → wrappers 0,1,3 have `data-theme="seoso-dark"`, 2 and 4 don't; without rotate, `[hero, richText, highlightBand]` → stage, base, stage; `preview` adds `data-key-path="sections.0"`…; ButtonLink with `https://…` href renders `rel="noopener noreferrer"`; ButtonLink with `{label:"x"}` (no href) renders nothing.
- [ ] **Step 2: Run** `npm test -- components` — Expected: FAIL.
- [ ] **Step 3: Implement** by porting the matching `web/src/components/**` files to Astro (same markup and classes; drop all stega/Sanity code). Mobile drawer and dropdown closing: port `NavBehavior.tsx` as an inline `<script>`.
- [ ] **Step 4: Run** `npm test -- components` — Expected: PASS.
- [ ] **Step 5: Blueprint** — setup → rules → component syntax for `navbar`, `menu`, `drawer`, `dropdown`, `footer`, `button`, `link` → quality inspector `fix_changes` on the new files until no errors.
- [ ] **Step 6: Commit** `feat(site): layout chrome and page builder`

### Task 6: Port the existing ten sections

**Files:**
- Create: `site/src/components/sections/{Hero,EventsList,EventRow,HighlightBand,NewsList,PostFeature,RichText,People,Contacts,Venues,Gallery,Video,SectionHeader,Section}.astro`
- Modify: `SectionRenderer.astro` (add cases)
- Test: `site/test/components/sections-existing.test.ts`

**Interfaces:**
- Consumes: Task 5 UI components; `getCollection` for events/news/venues; `isPast`, `eventDateParts` for lists; `settings` for contacts.
- Produces: one component per existing type, props = that section's schema object (plus `isFirst` for `hero`). `EventsList` filters with `isPast(e, now)` where `now = new Date()` at build/render time.

- [ ] **Step 1: Write the failing tests** — Hero with `heading: "Celebrate *Your* Symphony!"` renders `<em` around `Your`; HighlightBand without `figure` uses the copy-only column (`md:col-span-8`) and with `figure` uses `md:col-span-7 md:col-start-6`; EventsList `scope:"upcoming"` given fixtures (one past, one future, relative to a fixed `now` prop) shows only the future one; Gallery with `images: []` renders nothing; Video renders a `youtube-nocookie.com/embed/<id>` iframe with a `title`.
- [ ] **Step 2: Run** `npm test -- sections-existing` — Expected: FAIL.
- [ ] **Step 3: Implement** by porting `web/src/components/sections/*.tsx` markup and classes. `EventsList` takes an optional `now?: Date` prop (tests) defaulting to `new Date()`.
- [ ] **Step 4: Run** tests — Expected: PASS.
- [ ] **Step 5: Blueprint + visual parity** — quality inspector on the new files; then screenshot each route of `npm run build && npm run preview` against https://seoso.netlify.app at 1440px and 500px, light and dark; fix differences.
- [ ] **Step 6: Commit** `feat(site): port existing page sections`

### Task 7: New landing-page sections

**Files:**
- Create: `site/src/components/sections/{TextMedia,CardGrid,Testimonials,CtaBand,Faq,Stats,Logos}.astro`
- Modify: `SectionRenderer.astro`
- Create: `site/src/content/pages/kitchen-sink.md` (`seo.noIndex: true`; one of every section type) — the visual test page
- Test: `site/test/components/sections-new.test.ts`

**Interfaces:**
- Consumes: Task 5 UI components, `SectionHeader`, `Media`, `ButtonLink`.
- Produces: one component per new type. Layout rules: **TextMedia** — `md:grid-cols-3`, media `md:col-span-1`, text `md:col-span-2`; `mediaSide:"left"` puts media first at `md:` and above; on mobile media always stacks **after** the text (`order-*` classes from a Record). **CardGrid** — `columns` maps to `md:grid-cols-2|3|4` via Record, one column on mobile, `border-t-2 border-base-content` rule above the grid. **Faq** — daisyUI `collapse` on native `<details>`. Stats/Logos/Testimonials follow the same section header + rule pattern.

- [ ] **Step 1: Write the failing tests** — TextMedia `mediaSide:"left"` → media element has `md:order-first`; `"right"` → `md:order-last`; no `media` → text spans full width (`md:col-span-3`); `media.kind:"video"` renders the nocookie iframe; CardGrid `columns:4` → `md:grid-cols-4`; `cards: []` renders nothing; Testimonials quote text `"<script>"` is escaped; Faq renders one `<details class="collapse` per item.
- [ ] **Step 2: Run** `npm test -- sections-new` — Expected: FAIL.
- [ ] **Step 3: Implement** the components (Blueprint component syntax for `collapse`, `card` not used — square bordered cells per design).
- [ ] **Step 4: Run** tests — Expected: PASS.
- [ ] **Step 5: Blueprint + visual check** of `/kitchen-sink` at 1440/500px, light/dark.
- [ ] **Step 6: Commit** `feat(site): landing-page section kit`

### Task 8: Routes, redirects, events feeds

**Files:**
- Create: `site/src/pages/{index.astro,[slug].astro,404.astro}`, `site/src/pages/events/{index.astro,[slug].astro}`, `site/src/pages/news/{index.astro,[slug].astro}`, `site/src/components/detail/{EventDetail,PostDetail,DetailHeader}.astro`, `site/src/pages/events.json.ts`, `site/src/pages/events.ics.ts`, `site/src/lib/feeds.ts`, `site/public/_redirects`
- Test: `site/test/lib/feeds.test.ts`
- Delete: temporary `site/src/pages/index.astro` content from Task 1 (replaced)

**Interfaces:**
- Consumes: collections, `PageBuilder`, `pastAt`, `isPast`, `nextRollover`.
- Produces:
  - `buildEventsFeed(events: {slug,title,start,end?}[], now: Date): { builtAt: string; nextRollover: string | null; events: {slug,title,start,end:string|null}[] }`
  - `buildIcs(events: {slug,title,start,end?,venue?:{name,address?,city}}[], siteUrl: string): string` (RFC 5545, `CRLF`, `PRODID:-//SEOSO//Season//EN`, `X-WR-CALNAME:SEOSO Concerts`, one `VEVENT` per event with `UID:<slug>@seoso`, `DTSTART`/`DTEND` in UTC `Z` form, `URL:<siteUrl>/events/<slug>`; events without `end` get `DTEND` = start + 2h)
  - Home = page whose slug is `settings.site.homePage`, rendered with `rotateTones`; `/home` → `/` 301 in `_redirects`. `/events` page shows a "Subscribe to the season calendar" link (`webcal://<host>/events.ics`) plus a download link.
  - `<DetailHeader>` + body for event/news detail, as in `web/src/components/detail/DetailHeader.tsx` and the current detail routes.

- [ ] **Step 1: Write the failing tests** — `buildEventsFeed` with one past and one future event at `now = 2026-10-22T00:00Z` → `nextRollover = "2026-11-12T05:00:00.000Z"` for the 2026-11-11 event, `builtAt = now`; no future events → `nextRollover: null`; `buildIcs` with 2 events → contains exactly 2 `BEGIN:VEVENT`, lines end with `\r\n`, a title with a comma is escaped as `\,`.
- [ ] **Step 2: Run** `npm test -- feeds` — Expected: FAIL.
- [ ] **Step 3: Implement** routes and feeds (all prerendered; `getStaticPaths` from collections, excluding the home slug from `[slug]`).
- [ ] **Step 4: Run** `npm test && npm run build && npm run preview`, then `curl -s -o /dev/null -w '%{http_code}'` for `/`, `/about`, `/events`, `/news`, `/contact`, `/directions`, `/kitchen-sink`, one `/events/<slug>`, one `/news/<slug>`, `/events.json`, `/events.ics` → all `200`; `/home` → `301`; `/nope` → `404`.
- [ ] **Step 5: Blueprint** on the new route/detail files; check `/events/<slug>` and `/news/<slug>` at both widths and themes.
- [ ] **Step 6: Commit** `feat(site): routes, redirects, events.json and events.ics`

### Task 9: Preview rendering route

**Files:**
- Create: `site/src/lib/preview.ts`, `site/src/pages/api/preview.ts`, `site/src/components/PreviewDocument.astro`, `site/src/pages/admin/preview.css.ts`
- Test: `site/test/lib/preview.test.ts`

**Interfaces:**
- Consumes: `sectionSchema` (string-image variant), `PageBuilder`, `EventDetail`, `PostDetail`, BaseLayout pieces.
- Produces:
  - `renderPreview(collection: "pages"|"snippets"|"events"|"news", data: unknown, opts: { slug?: string }): Promise<string>` — validates; on validation failure renders the sections that do parse and prepends a small `role="status"` notice listing the invalid ones (never throws for bad input).
  - `POST /api/preview` (prerender false): body `{ collection, data, slug? }`; `403` unless the `Origin` header equals the site origin (or `http://localhost:4321` in dev); `400` for malformed JSON or unknown collection; otherwise `200 text/html` from `renderPreview`. Rendered with `preview: true` (adds `data-key-path`).
  - `GET /admin/preview.css` (prerendered) returns the compiled `global.css` (`import css from "../../styles/global.css?inline"`).

- [ ] **Step 1: Write the failing tests** — `renderPreview("pages", {title:"T", sections:[{type:"hero",heading:"Hi <b>"}]})` contains `Hi &lt;b&gt;` and `data-key-path="sections.0"`; a section with `type:"textMedia"` and missing `body` → output contains the other sections and the notice text `1 block couldn’t be previewed`; an image `src: "blob:https://x/123"` is rendered as `<img src="blob:https://x/123"`; the endpoint handler returns `403` for `Origin: https://evil.example` and `400` for `{collection:"nope"}`.
- [ ] **Step 2: Run** `npm test -- preview` — Expected: FAIL.
- [ ] **Step 3: Implement** with `experimental_AstroContainer.create()` inside `renderPreview` (no framework renderers needed).
- [ ] **Step 4: Run** tests, then `npm run build && npm run preview` and `curl -X POST -H 'Origin: http://localhost:8787' …/api/preview` with a page payload → HTML with the hero. (Use the `wrangler dev` port as the allowed dev origin too.)
- [ ] **Step 5: Commit** `feat(site): on-demand preview renderer`

### Task 10: Sveltia CMS admin and live preview

**Files:**
- Create: `site/public/admin/index.html`, `site/public/admin/config.yml`, `site/public/admin/preview.js`
- Test: `site/test/cms-config.test.ts`

**Interfaces:**
- Consumes: `SECTION_TYPES` and field names from Task 3; `/api/preview` and `/admin/preview.css` from Task 9.
- Produces: CMS with collections **Pages**, **Events**, **News**, **Venues**, **Snippets** (folder collections, `create: true`, slug from title) and **Site settings** (files collection: Site, Navigation, Footer). `backend: { name: github, repo: kellycreativetech/seoso, branch: sveltia, base_url: <AUTH_URL placeholder> }`; `media_folder: site/src/assets/uploads`, `public_folder: ../../assets/uploads`; `publish_mode: simple`. Pages/Snippets `sections` = list widget with `types` (typeKey `type`), one type per `SECTION_TYPES` entry with plain-language labels, hints and `summary`; `collapsed: auto`. Links = object `{label, page (relation → pages, optional), href (string, hint "/events, #season or https://…")}`. Event `venue` = relation → venues; Snippet block = relation → snippets.
  - `preview.js`: `CMS.registerPreviewStyle("/admin/preview.css")`; for each of pages/snippets/events/news `CMS.registerPreviewTemplate(name, Component)` where `Component` (HTM + `CMS.React`) serializes `entry.get("data")`, swaps image paths for `getAsset(path)?.toString()`, debounces 300 ms, POSTs to `/api/preview`, and renders the HTML into a container.

- [ ] **Step 1: Write the failing test** — parse `config.yml` with `yaml`; assert the set of `types[].name` under the Pages `sections` field equals `SECTION_TYPES` and the same for Snippets; every `folder` path exists; every field `name` used in each section type exists in that type's zod schema (walk the schema shape).
- [ ] **Step 2: Run** `npm test -- cms-config` — Expected: FAIL.
- [ ] **Step 3: Implement** the three admin files. `index.html` loads `https://unpkg.com/@sveltia/cms@0.253.1/dist/sveltia-cms.js` then `preview.js`.
- [ ] **Step 4: Run** the test — Expected: PASS.
- [ ] **Step 5: Local CMS check** — `npm run build && npm run preview`, open `/admin` in Chrome, choose "Work with Local Repository" (repo root), confirm: no config errors; each collection lists the migrated entries; editing the home page heading updates the right-hand preview within ~1 s and looks like `/`; adding a Text + Media block and dragging it above Events reorders the preview; clicking a block in the preview highlights its fields. Discard the test edits (`git checkout site/src/content`).
- [ ] **Step 6: Commit** `feat(site): Sveltia CMS config and live preview`

### Task 11: Rollover Worker

**Files:**
- Create: `workers/rollover/{package.json,wrangler.jsonc,tsconfig.json,src/index.ts,src/should-build.ts,test/should-build.test.ts}`

**Interfaces:**
- Consumes: `/events.json` shape from Task 8 (`builtAt`, `nextRollover`).
- Produces: `shouldBuild(feed: { builtAt: string; nextRollover: string | null }, now: Date): boolean` — true iff `nextRollover` is set, `now ≥ nextRollover` and `builtAt < nextRollover`. `scheduled` handler: one `fetch(env.SITE_URL + "/events.json")`; if `shouldBuild`, one `POST env.DEPLOY_HOOK_URL`; logs one line either way; non-200 feed → log and exit. `wrangler.jsonc`: `name: "seoso-rollover"`, `triggers.crons: ["10 4 * * *", "10 5 * * *"]`, `vars.SITE_URL` set at deploy; `DEPLOY_HOOK_URL` is a secret.

- [ ] **Step 1: Write the failing tests** — `shouldBuild({builtAt:"2026-11-11T20:00:00Z", nextRollover:"2026-11-12T05:00:00Z"}, new Date("2026-11-12T05:10:00Z"))` → `true`; same with `now = 2026-11-12T04:10:00Z` → `false`; `builtAt:"2026-11-12T05:11:00Z"` (already rebuilt) → `false`; `nextRollover:null` → `false`.
- [ ] **Step 2: Run** `cd workers/rollover && npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** `should-build.ts` and `index.ts`.
- [ ] **Step 4: Run** tests — Expected: PASS; `npx wrangler deploy --dry-run` succeeds.
- [ ] **Step 5: Commit** `feat: rollover worker that rebuilds when an event falls off`

### Task 12: Go live on Cloudflare (owner + agent together)

**Files:**
- Modify: `site/public/admin/config.yml` (`base_url`), `site/wrangler.jsonc` / Workers Builds env (`SITE_URL`)
- Create: `site/README.md` (stack, commands, CMS, deploy, rollover, secrets locations), add a short "New stack (sveltia branch)" section to root `AGENTS.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the live development URL and a working hosted CMS.

- [ ] **Step 1: Ask the owner to push** the `sveltia` branch (or approve the agent pushing it).
- [ ] **Step 2: Owner — site Worker.** Cloudflare dashboard → Workers & Pages → Create → Import a repository → GitHub → `kellycreativetech/seoso`. Project name `seoso`; production branch `sveltia`; root directory `site`; build command `npm run build`; deploy command `npx wrangler deploy`. Build variable `SITE_URL = https://seoso.<subdomain>.workers.dev`. Owner reports the URL. Agent verifies with `curl` (all Task 8 routes → expected codes).
- [ ] **Step 3: Owner — authenticator.** Deploy `sveltia/sveltia-cms-auth` with its "Deploy to Cloudflare" button. Create a GitHub OAuth App under **kellycreativetech → Settings → Developer settings → OAuth Apps**: homepage = site URL, callback = `https://sveltia-cms-auth.<subdomain>.workers.dev/callback`. In the Worker's Settings → Variables and Secrets add secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and variable `ALLOWED_DOMAINS = seoso.<subdomain>.workers.dev`. Owner reports only the Worker URL (not the secrets).
- [ ] **Step 4: Agent** sets `base_url` in `config.yml` to the authenticator URL, writes the README/AGENTS notes, commits `chore(site): point CMS at Cloudflare authenticator`, owner approves the push; wait for the build to finish.
- [ ] **Step 5: Owner — deploy hook + rollover.** `seoso` Worker → Settings → Builds → Deploy hooks → create one for branch `sveltia`. Create a second Workers Builds project from the same repo: name `seoso-rollover`, root `workers/rollover`, deploy `npx wrangler deploy`; add secret `DEPLOY_HOOK_URL` (the hook URL) and variable `SITE_URL`. Agent verifies `/events.json` and checks the rollover Worker log after its first cron run (or a manual "Trigger scheduled event").
- [ ] **Step 6: Acceptance** — owner signs in at `<site>/admin` with GitHub, edits the home page heading, sees the preview update, saves; agent confirms the commit on `sveltia`, the build, and the change on the live URL within a few minutes; `/events.ics` imports into a calendar app.
- [ ] **Step 7: Commit** any doc fixes found during acceptance.
