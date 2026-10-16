# SEOSO — agent guide

Website for the **Southeastern Ohio Symphony Orchestra** (SEOSO). A monorepo with a standalone
Sanity Studio and a Next.js frontend styled with daisyUI 5 on Tailwind CSS 4.

Read this whole file before changing anything. `web/AGENTS.md` adds Next.js-version rules that also apply.

## Layout

```
seoso/
├── studio/   Sanity Studio (standalone, NOT embedded in Next.js) — project cerintdw, dataset production
│   ├── schemaTypes/{documents,blocks,objects}/
│   ├── structure.ts        sidebar + Site Settings singleton
│   └── sanity.cli.ts       TypeGen config (writes ../web/src/sanity/types.ts)
└── web/      Next.js 16 App Router + daisyUI 5 + Tailwind 4
    └── src/
        ├── app/            routes (see "Routes")
        ├── components/
        │   ├── PageBuilder.tsx   maps Sanity section `_type` → component
        │   ├── sections/         one component per page-builder block
        │   ├── site/             header, drawer (mobile nav), footer, nav behavior
        │   ├── detail/           event/news detail header
        │   ├── text/             Portable Text renderers (HeadingText, InlineRichText, RichText)
        │   └── ui/               Container, ButtonLink, Eyebrow, TextLink, SmartLink, SanityImage
        ├── lib/            dates (Eastern Time), listing-page helper
        └── sanity/         client, env, image, metadata, queries, types (generated)
```

## Commands

| Task | Where | Command |
| --- | --- | --- |
| Run site + Studio together | root | `npm run start` (concurrently; see README.md) |
| Run the site | `web/` | `npm run dev` → http://localhost:3000 |
| Run the Studio | `studio/` | `npm run dev` → http://localhost:3333 |
| Regenerate types | `studio/` | `npm run typegen` (after any schema **or** query change) |
| Deploy schema (for MCP/Content Lake) | `studio/` | `npx sanity schemas deploy` |
| Deploy hosted Studio | `studio/` | `npx sanity deploy` → https://seoso.sanity.studio (appId pinned in `sanity.cli.ts`) |
| Deploy the site | root | `npm run deploy:web` → https://seoso.netlify.app (project `seoso`) |
| Check web | `web/` | `npx tsc --noEmit && npm run lint && npm run build` |
| Format web | `web/` | `npm run format` (Prettier, 120 cols) |

**Netlify (monorepo):** config lives in the **root** `netlify.toml` (`base = "web"`, `publish = "web/.next"`) and
declares `@netlify/plugin-nextjs` explicitly — framework detection reads the root `package.json` and would otherwise
skip the Next.js adapter, so every route 404s. Deploy from the repo root (the CLI resolves paths from the git root);
a healthy deploy hashes ~50 files **and 1 function**. `web/next.config.ts` pins `turbopack.root` /
`outputFileTracingRoot` to `web/` because the root lockfile would otherwise be taken as the workspace root. When
connecting the GitHub repo in Netlify, leave the base directory to `netlify.toml`.

`next dev` regenerates route types; if `tsc` complains about `PageProps<"/…">` or deleted routes,
run `rm -rf .next && npx next typegen`.

## Definition of done

1. `npm run typegen` (studio) if schema or queries changed, then no `any`/casts added to paper over types.
2. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass in `web/`.
3. Schema changes: `npx sanity schema validate` passes and `npx sanity schemas deploy` has been run.
4. UI changes: run the daisyUI Blueprint Quality Inspector (see below) until it reports no errors, then
   look at the rendered page at a desktop **and** a mobile width (light and dark).
5. Smoke-test every route you touched with `curl -s -o /dev/null -w '%{http_code}'` and by clicking
   through with client-side navigation.

## Design system (keep this look)

The homepage design is the reference for every page. It came from this brief — honor it:

- **Classy**, with a best-practice typographic scale; works on all screen sizes.
- **Colors: black, white, and the logo blue only.** No glassy/frosted cards, no gradients-as-decoration,
  no rounded "SaaS" cards, no shadows. Square corners everywhere.
- **Display type:** Newsreader — a variable Google serif with true italics. Italic words in headings are
  set in the serif italic (often in logo blue on black).
- **Body type:** Source Sans 3 — a humanist sans. 18px body.
- Black "stage" sections (header, masthead, highlight bands, detail headers, footer) alternate with
  white content sections. Content sits on a 12-column measure, max width 74rem.
- Page-builder section backgrounds are set in `PageBuilder.tsx`, not in the section components: a "stage" section's
  wrapper gets `data-theme="seoso-dark"` + `bg-neutral`, which scopes the dark palette onto pure black so any
  section's `base-*` colors read correctly on black. Default: masthead and highlight bands are stage. The home page
  passes `rotateTones`: the first two sections are black, then base / black alternate. Sections that can land on
  either tone (e.g. `HighlightBand`) must use `base-*` colors and the `brandOnBase` / `outlineOnBase` buttons.
- Navigation mirrors the top level of seoso.org: Home, About SEOSO, Events, Contact, plus a Donate button.

Implementation of those decisions:

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#13a9e1` logo blue | Graphic use, buttons, italic emphasis/eyebrows **on black** |
| `secondary` | `#0a6d93` (dark theme `#3dbdee`) | Blue for small text and links **on white** (contrast) |
| `neutral` / `neutral-content` | `#000` / `#fff` | All black stage sections (identical in both themes) |
| `base-100/200/300`, `base-content` | white → rules `#dfe3e6`, ink `#0a0a0a` | Page surfaces, rules, text |
| Radius | `0` for selector/field/box | Square corners |
| `--border` | `1.5px` | Button/outline weight |
| `--depth` / `--noise` | `0` / `0` | Flat, no glass |

Type scale (major third on 18px), defined as Tailwind `@theme` tokens in `web/src/app/globals.css`:
`text-small` 0.889rem · `text-body` 1.125rem · `text-lead` 1.406rem · `text-title` 1.758rem ·
`text-h3` 2.197rem · `text-h2` 2.747rem · `text-h1` 3.433rem · `text-display` 5.4rem · `text-figure` 13rem.
Step sizes up with breakpoints (`text-h3 sm:text-h2`); **never** use viewport-scaled (`vw`/`clamp`) font sizes.

Recurring patterns — reuse the components rather than restyling:

- **Eyebrow** (`ui/Eyebrow`): small uppercase, `tracking-[0.14em]`, blue. `tone="brand"` on black.
- **Section header** (`sections/SectionHeader`): eyebrow, serif heading (cols 1–7), optional note (cols 9–12).
- **Rules:** a `border-t-2 border-base-content` heads every list/grid; `border-base-300` between rows.
- **Buttons** (`ui/ButtonLink`): uppercase, `tracking-[0.1em]`, `brand` (blue fill) first, `outlineOnDark` second.
- **Text links** (`ui/TextLink`): `link link-secondary`, semibold, offset underline.
- **Events list** (`sections/EventList`): programme layout — date | what | where, year rows in blue italic.

There are two themes: `seoso` (default) and `seoso-dark` (`prefersdark`). Both are defined in `globals.css`.
Do not add a theme switcher or more themes unless asked.

## daisyUI rules (mandatory)

daisyUI 5 is installed as a package (`@plugin "daisyui"` in `globals.css`); there is no `tailwind.config.js`.
Two daisyUI MCP servers are configured: `daisyui` (free docs, GitMCP) and `daisyui-blueprint` (licensed,
project-scoped). **Use the Blueprint workflow for any UI work:**

1. `daisyui_setup_expert` (workflowId + `projectRoot: /Users/kaseykelly/Sites/seoso/web`) →
   `daisyui_rules_enforcer`.
2. For a brand-new page type, also `daisyui_creative_director` → `daisyui_page_architect`.
3. `daisyui_component_syntax_expert` for every component you will write or change (it returns batches —
   keep calling until no IDs remain).
4. Write the code, then `daisyui_quality_inspector` with `auditIntent: "fix_changes"` and the changed files
   (paths relative to `web/`). Fix every **error**; rerun once. Then complete its manual review with real
   observations from the rendered page.

Blueprint keeps workflow state per server process; all calls for one workflow must go through the same session.

Hard rules (from Blueprint + daisyUI llms.txt):

- Use daisyUI component classes first (`navbar`, `menu`, `drawer`, `btn`, `link`, `list`/`list-row`,
  `footer`, `breadcrumbs`, …); Tailwind utilities for layout, spacing and responsive behavior.
- **Semantic colors only** (`bg-neutral`, `text-secondary`, `border-base-300`, `text-base-content/70`).
  No raw palette colors (`text-gray-600`), no `dark:` variants, no `bg-[var(--x)]`, no new `:root` vars.
  New colors go into both daisyUI themes as tokens.
- **No authored CSS selectors.** `globals.css` holds only imports, `@plugin` blocks, and `@theme` tokens.
  Effects (e.g. the masthead photo fade) are arbitrary utilities in markup: `[mask-image:linear-gradient(...)]`.
- **Static class strings only.** Never build class names with template literals or pass-through `className`
  props. Use a `Record<Variant, string>` of complete strings (see `ButtonLink`, `Eyebrow`) or a ternary
  between two complete strings. `Container` takes no `className` — put layout classes on a child div.
- A daisyUI part must live in the same component as its root (e.g. `drawer-side` with `drawer` → `SiteDrawer`).
- `list-disc`/`list-decimal` read as daisyUI `list` variants — use `[list-style-type:disc]`.
- Icons: `lucide-react` (already installed). Icon-only controls need `aria-label`.
- Hero/first-viewport images: `priority`, not lazy. Everything below the fold: `loading="lazy"`.

daisyUI gotchas we hit:

- `.list .list-row > *` forces `grid-row-start: 1`. To wrap a cell to a second row on mobile use
  `list-col-wrap` (and `md:row-start-1` to bring it back). `list-row` also sets `word-break: break-word`,
  so add `break-normal` to numerals that must not split.
- Do not use `after:` utilities on `list-row` — Tailwind's `after:` adds `content`, turning the last row's
  pseudo-element into a grid item. Use `border-b border-base-300` instead.
- The `drawer` checkbox and `<details>` dropdowns stay open across client navigations (the layout persists);
  `site/NavBehavior.tsx` closes them on route change, link click, outside click and Escape.

## Sanity rules (mandatory)

Use the `sanity-best-practices` skill (`npx skills add sanity-io/agent-toolkit --skill sanity-best-practices -y`
if missing). Sanity MCP (`https://mcp.sanity.io`) is configured; pass `projectId: cerintdw`, `dataset: production`.

- **Studio is standalone.** Never embed it in Next.js (`next-sanity/studio`). The local Studio schema is the
  source of truth; deploy it with `npx sanity schemas deploy` before using MCP content tools.
- **File names:** kebab-case for schema files and non-component modules (`events-section.ts`, `listing-page.tsx`);
  each exports a named const matching the schema type (`export const eventsSection`). React component files
  stay PascalCase to match the component (`EventsSection.tsx`).
- Always `defineType` / `defineField` / `defineArrayMember`; every document/object gets an icon imported from
  its own subpath (`@sanity/icons/Calendar`, never the package root).
- Model data, not presentation (`isNamedProgram`, not `italicTitle`). Reusable things are documents with
  references (`venue`, `author`); page-specific things are objects.
- Let Sanity generate `_id`s. The only fixed ID is the `settings` singleton (enforced in `structure.ts` and
  `sanity.config.ts` — not creatable from "New document", no delete/duplicate).
- Never delete a field that holds data — deprecate (`deprecated`, `readOnly`, `hidden`) and migrate.
- **Queries live in `web/src/sanity/queries.ts`, wrapped in `defineQuery`.** Project only what components need,
  always include `_key` for arrays, and reuse the `IMAGE`, `LINK`, `SEO` fragments. Results are typed via
  TypeGen (`*_QUERY_RESULT`); don't add generics or casts.
- **Always fetch with `sanityFetch` from `@/sanity/live`** (never `client.fetch` in pages/components) so content is
  live-updated and previewable. `const { data } = await sanityFetch({ query, params })`.
  - `generateMetadata`: pass `stega: false`. `generateStaticParams`: `perspective: "published", stega: false`.
  - Time-based filters take a `$now` param (see `EventsSection`), never GROQ `now()`, so results stay cacheable;
    `revalidate = 3600` in the root layout rolls them over hourly.

### Live preview (Visual Editing)

- **Flow:** Studio Presentation tool → `/api/draft-mode/enable` (validates a signed secret) → Next.js draft mode →
  `sanityFetch` returns drafts with stega → `<VisualEditing />` draws click-to-edit overlays; `<SanityLive />`
  streams changes. Outside the Studio, an **Exit preview** button calls `/api/draft-mode/disable`.
- **Token:** `SANITY_API_READ_TOKEN` (viewer role) — `web/.env.local` locally, a **secret** Netlify env var in
  production (production, deploy-preview, branch-deploy contexts). Only `web/src/sanity/token.ts` reads it.
- **Studio config:** `studio/presentation/resolve.ts` maps routes → documents (`mainDocuments`) and documents →
  pages (`locations`). Update both when adding a route or document type. The local Studio previews
  `localhost:3000`; the hosted Studio previews `seoso.netlify.app`. CORS allows both (with credentials).
- **Stega rules:** strings from `sanityFetch` are typed `StegaString` (component props use `StegaBranded<…>` from
  `next-sanity`). Run `stegaClean()` on any value used for logic — comparisons, lookups, `tel:`/IDs
  (see `scope`, `platform`, `phone`). Never let stega reach `<head>`; render text as-is so it stays clickable.
- **Never leave stega characters inside letter-spaced text.** Firefox applies `letter-spacing` to every invisible
  stega character (hundreds per string): tracked labels grow ~900px wide (buttons stretch and stack) and negatively
  tracked headings collapse. Chrome and Safari hide this, so test previews in Firefox. Render tracked CMS strings via
  `StegaText` / `splitStega()` (`web/src/sanity/stega.ts`): the payload moves into a `data-sanity` attribute for the
  same field, so click-to-edit still works. `ButtonLink`, `Eyebrow`, `NavLink` and `HeadingText` already do this;
  use `<StegaText value={…} />` for any new tracked or uppercase label, title or figure. Body copy (no tracking) is fine.
- **Non-text overlays:** `PageBuilder` wraps each section in `data-sanity` (via `dataAttr()` in
  `web/src/sanity/data-attribute.ts`) so sections can be selected and drag-reordered. New section components get
  this for free; add `dataAttr` for any other non-string field you want selectable.
- **Testing without the Studio:** create a secret with `createPreviewSecret` from `@sanity/preview-url-secret`
  (via `npx sanity exec … --with-user-token`), hit `/api/draft-mode/enable?sanity-preview-secret=…`, and reuse the
  cookie. Discard any test drafts afterwards.
- MCP `patch_documents`/`create_documents` write **drafts** — call `publish_documents` afterwards.
- Images: hotspot on, alt text on informative images, `SanityImage` for rendering. Sanity's pipeline does **not**
  apply EXIF orientation — rotate pixels before uploading photos with an orientation flag.
- `next.config.ts` must use the **object** form of `remotePatterns` for `cdn.sanity.io` (the `new URL()` form
  rejects the `?w=` query strings Sanity image URLs carry).
- No video files in Sanity — use YouTube (`videoSection` stores IDs; embeds use youtube-nocookie).

### Content model

- **Documents:** `settings` (singleton: logo, tagline, nav tree, Donate link, footer nav, address, email, social),
  `page` (page builder + SEO), `event` (start/end, venue ref, summary, admission, tickets, body),
  `venue` (city, address, directions, website), `post` (excerpt, rich `summary`, key `facts`, body),
  `author`, `category`.
- **Page sections** (`pageBuilder`): `hero` (masthead; image optional), `eventsSection` (upcoming/past, limit),
  `highlightBand` (big figure + CTA), `newsSection` (latest N posts), `textSection`, `peopleSection`,
  `contactSection` (pulls address/email from settings), `venuesSection`, `gallerySection`, `videoSection`.
- **Objects:** `headingText` (one line, italic-only marks), `headingTextWithStrike` (adds strikethrough; highlight band only), `inlineRichText`, `blockContent`, `link`
  (internal ref to page/post/event or external/path/#anchor), `navItem` (link + dropdown children), `seo`.

Adding a section type: schema in `studio/schemaTypes/blocks/<kebab-name>.ts` → register in `index.ts` and `page-builder.ts` →
projection in `PAGE_FIELDS` → `npm run typegen` → component in `web/src/components/sections/` → case in
`PageBuilder.tsx` → schema deploy.

### Routes

| URL | Source |
| --- | --- |
| `/` | page referenced by `settings.homePage` |
| `/[slug]` | `page` by slug (the home page's own slug 308-redirects to `/`) |
| `/events`, `/news` | the `page` docs with slugs `events` / `news` (dedicated routes so they can coexist with detail routes) |
| `/events/[slug]` | `event` |
| `/news/[slug]` | `post` |

Link `href`s are resolved in GROQ (`LINK` fragment). If you add a route, update that `select()` too.

Event dates are stored in UTC and **always displayed in America/New_York** via `web/src/lib/dates.ts`.

## Content provenance

Content was migrated from seoso.org (WordPress) on 2026-10-01; the 2026–27 season comes from the season PDF
used for the homepage design. Text is verbatim except light cleanup. One legacy photo (`alato pix 078.jpg`) was
truncated at the source and was skipped. Contacts include a personal booking email published on the old site —
confirm with SEOSO before promoting it further.
