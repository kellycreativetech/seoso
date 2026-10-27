# SEOSO: move from Sanity + Next.js (Netlify) to Sveltia CMS + Astro (Cloudflare Workers)

Status: draft for approval · Branch: `sveltia` · Date: 2026-10-26

## Why

SEOSO is a small nonprofit orchestra. The current stack (Sanity Content Lake + Next.js on Netlify) works, but it
depends on two hosted services, and Netlify's free plan can't build a private GitHub org repo. The owner wants
a stack that is **free (or nearly)**, keeps content **in the Git repo as Markdown/JSON**, and gives
non-technical editors a CMS with an **accurate live preview** and **page-building blocks**.

Success: a live development URL serving the Astro site, a hosted Sveltia CMS at `/admin` that the owner can sign
in to with GitHub, all current content migrated, editors able to build a landing page by stacking blocks, and the
preview pane looking like the real page.

## Goals

1. **Astro static site** that reproduces the current design exactly (daisyUI 5 + Tailwind 4, the `seoso` /
   `seoso-dark` themes, type scale, black "stage" / white alternation, homepage tone rotation — see `AGENTS.md`
   "Design system").
2. **Sveltia CMS** at `/admin`, GitHub backend, signing in through the **Sveltia CMS Authenticator** on
   Cloudflare Workers.
3. **Hosting on Cloudflare Workers + Workers Builds** (free plan), building from the private `kellycreativetech/seoso` GitHub repo.
4. **Content migrated from Sanity** (published versions) into Markdown/JSON in the repo, with images downloaded
   into the repo.
5. **Page builder in frontmatter:** a page is a Markdown file whose frontmatter has an ordered `sections` list;
   list order = order on the page. Editors add, remove and drag-reorder blocks in the CMS.
6. **Live preview** in the CMS's right pane rendering the real section components with the real site CSS.
7. **A landing-page component kit** (below), including a new **Text + Media** block.
8. **Site-wide editable data** in the CMS: navigation, footer, contact details, social links, Donate link, and
   **Snippets** (reusable content blocks).

## Non-goals

- Decommissioning Sanity, the Next.js app (`web/`, `studio/`) or the Netlify site. They stay untouched on `main`
  until a separate cutover step.
- A custom domain (seoso.org). The deliverable is the `*.workers.dev` development URL.
- Multiple languages, search, comments, forms beyond `mailto:`, e-commerce.
- Editorial workflow (drafts as pull requests). Editors commit directly (Sveltia "simple" workflow).

## Anti-goals (a failure even if it technically works)

- The preview pane drifting from the real site (a second, hand-maintained copy of the markup).
- Visitors downloading a JavaScript framework to read a static page. Every public page is prerendered plain HTML;
  only small interactive bits (mobile nav, dropdowns) ship JS. Event lists are printed in the HTML, not loaded by
  script.
- Any secret (OAuth client secret, API token) committed to the repo.
- Losing or silently altering content during migration.
- A CMS so open-ended that editors can break the design (free-form colors, arbitrary CSS, unbounded layouts).

## Decisions made (by the owner)

- **Hosting:** Cloudflare + GitHub, with the Sveltia CMS Authenticator Worker on the same Cloudflare account.
  The owner chose "Cloudflare Pages"; because the Astro Cloudflare adapter (v13+) supports only **Cloudflare
  Workers with static assets** (Cloudflare's successor to Pages), the site is deployed as a Worker with
  **Workers Builds** (Git integration). Same account, same free tier class: static asset requests free and
  unlimited, 3,000 build minutes/month, deploy hooks available.
- **CMS:** Sveltia CMS. **Framework:** Astro.
- **Event rollover: "the day after the event."** An event counts as past from **00:00 America/New_York on the day
  after it ends** (its end date, or its start date if it has no end). The site rebuilds **only when an event is due
  to fall off**, not on a fixed schedule:
  - Each build publishes a small `/events.json` with `builtAt`, `nextRollover` (the next midnight at which a listed
    upcoming event becomes past) and a minimal list of events (slug, title, start, end).
  - A tiny Cloudflare Worker with a cron trigger runs once a day just after midnight Eastern, fetches
    `/events.json`, and calls the Workers Builds deploy hook **only if** `now ≥ nextRollover` and `builtAt < nextRollover`.
    Otherwise it exits without building. Expected cost: one small fetch a day, and roughly one build per concert
    day.
  - The build and the Worker use the same rule (one shared definition), so they can't disagree.
  - Keep Worker traffic minimal: `events.json` stays small (no bodies/images) and the Worker makes at most one
    fetch and one hook call per run.
- **Calendar feed:** the build also publishes `/events.ics` (all events, with venue address and a link to the event
  page) and the Events page offers a "Subscribe to the season calendar" link (`webcal://` + download). The feed is
  a subscriber feature; it is not used to render pages.
- **Sanity is frozen after the migration.** The script is run to produce the initial content; from then on the
  repo (edited through Sveltia) is the source of truth. Editors are told to stop editing in Sanity once the
  migration lands. Any later Sanity edits are copied over by hand. The old Next.js site stays up unchanged until
  cutover.
- **Components are plain Astro (`.astro`)** — no React, Vue or Svelte in the site's own code. The owner
  prefers the least configuration and dislikes React; an instant, server-free preview is not required.
- **Preview is rendered by the site itself:** one on-demand server route, `/api/preview`, renders the edited
  entry with the real Astro components (Astro Container API) and returns HTML. All other routes stay prerendered
  (static). The CMS registers one short preview script (HTM syntax with the React that Sveltia already bundles; no
  install, no build step) that sends the entry to that route and shows the returned HTML. Preview refreshes after
  a short pause in typing; that delay is accepted.

## Constraints

- Free tier limits: Workers Builds 3,000 build minutes/month, 1 concurrent build, 20-minute timeout; static assets
  free; Workers requests 100,000/day (preview route, authenticator, rollover cron).
- Every editor needs a GitHub account with **Write** access to `kellycreativetech/seoso` (today: Kasey Kelly,
  Bethany Kelly, Rachel Elliott Hodge).
- Sveltia CMS is pre-1.0; `registerPreviewTemplate` takes a React component (HTM/JSX/`h()`; `CMS.React` is
  available), runs in a sandboxed iframe that inherits no admin styles (use `CMS.registerPreviewStyle`).
  Click-to-highlight needs `data-key-path` attributes on rendered elements.
- Astro's Container API is still labeled experimental. Only the preview route depends on it; if an Astro upgrade
  breaks it, the live site is unaffected. Pin the Astro version and note this in the project docs.
- Cloudflare free tier for the preview route (Workers: 100,000 requests a day) — far above what
  editors generate.
- Event dates are stored in UTC and always displayed in America/New_York (as today).
- Project rules in `AGENTS.md` still apply where they make sense: daisyUI Blueprint workflow for UI, semantic colors
  only, no authored CSS selectors, static class strings, square corners, no shadows.

## Architecture

```
seoso/
├── site/                         NEW — Astro project (Workers Builds root directory)
│   ├── astro.config.mjs          static pages + @astrojs/cloudflare (for /api/preview only), Tailwind 4 via Vite
│   ├── public/admin/             Sveltia CMS: index.html, config.yml, preview.js (no build step)
│   ├── src/
│   │   ├── content/              ALL CONTENT (edited by the CMS)
│   │   │   ├── pages/*.md        frontmatter: title, slug, seo, sections[] (+ optional body)
│   │   │   ├── events/*.md       start, end, venue (relation), summary, admission, tickets, body
│   │   │   ├── news/*.md         date, excerpt, summary, facts[], body
│   │   │   ├── venues/*.md       city, address, directions, website
│   │   │   ├── snippets/*.md     name, sections[] (reusable blocks)
│   │   │   └── settings/         site.json, navigation.json, footer.json
│   │   ├── assets/uploads/       migrated + uploaded images (optimized by astro:assets)
│   │   ├── content.config.ts     zod schemas for every collection (build fails on bad content)
│   │   ├── components/sections/  Astro section components (used by pages AND /api/preview)
│   │   ├── components/site/      header, drawer, footer (Astro + small inline scripts)
│   │   ├── layouts/, pages/      Astro routes; pages/api/preview.ts (on-demand); events.json.ts, events.ics.ts
│   │   └── lib/events.ts         the one "is this event past?" rule (build + Worker)
│   └── scripts/migrate-from-sanity.ts
├── workers/rollover/             cron Worker: reads /events.json, calls the Workers Builds deploy hook when due
├── web/, studio/                 unchanged (Next.js + Sanity) until cutover
└── docs/
```

### Routes (same URLs as today)

`/` (home page = `pages/home.md`), `/[slug]`, `/events`, `/events/[slug]`, `/news`, `/news/[slug]`, `/admin`,
`/events.json`, `/events.ics`, and the on-demand `/api/preview` (not linked, POST only).
The 308 redirect from `/home` → `/` and any other redirects go in `site/public/_redirects`.

## Content model

Frontmatter uses plain YAML. Inline formatting in headings is **inline Markdown** (`I’m with the ~~band~~
*Symphony*`) instead of Portable Text; headings render `*…*` as the serif italic and `~~…~~` as `<s>`. Rich text
fields are Markdown.

### Pages (`folder` collection)

```yaml
title: About SEOSO
slug: about
seo: { title, description, image, noIndex }
sections:
  - type: hero
    eyebrow: About SEOSO
    heading: From the *Beginning*
    lead: …
  - type: textMedia
    …
```

The CMS uses a **list widget with `types`** (`typeKey: type`) so each block has its own form, an icon-like label,
and a summary line in the collapsed list. Order in the list = order on the page.

### Section kit (≈15 blocks)

Existing blocks, ported 1:1: **Hero/Masthead** (optional photo), **Events list** (upcoming/past, limit),
**Highlight band** (optional square figure image, eyebrow, heading with italic/strike, body, ≤2 buttons),
**News list** (latest N), **Rich text**, **People** (name/role/email), **Contacts** (pulls address/email from
settings), **Venues**, **Gallery**, **Video** (YouTube IDs, youtube-nocookie).

New blocks:
- **Text + Media:** eyebrow, heading, Markdown body (a few paragraphs), buttons (≤2); media = image (with alt) **or**
  YouTube video; media column 1/3 width, `left` or `right`; stacks on mobile (media first or text first — builder
  picks a sensible default and exposes it only if cheap).
- **Card grid:** heading, intro, 2/3/4 columns, cards with image (optional), title, text, link.
- **Testimonials:** 1–3 quotes, each with quote, name, role, optional photo.
- **Call to action band:** short heading, line of text, ≤2 buttons (lighter than Highlight band).
- **FAQ:** question/answer pairs (daisyUI `collapse`, native `<details>`).
- **Stats / figures:** 2–4 big numbers with labels (e.g. "50 years", "5 free concerts").
- **Sponsors / logos:** heading, logo images with optional links.
- **Snippet:** a relation to a Snippet entry; its sections render in place.

Each block offers the same small, fixed set of options — no free-form styling. Background tone stays automatic
(`PageBuilder` logic: masthead and highlight bands are black; the home page alternates — as today). Each block
gets an optional `anchorId`.

### Events, News, Venues

Folder collections mirroring the Sanity fields (see `studio/schemaTypes/documents/`). Events reference venues via
a **relation widget** (by venue slug). News posts keep `excerpt`, rich `summary`, `facts[]` (label/value) and
body. Sanity `author`/`category` have no documents, so they are dropped.

### Site settings (`files` collection, one entry per file)

- `settings/site.json` — site title, tagline, logo, default SEO image, Donate link, mailing address, email, social
  links, home page (relation, default `home`).
- `settings/navigation.json` — main nav tree (label, link, optional dropdown children).
- `settings/footer.json` — footer nav links, footer tagline/notes.

Links everywhere use one shape: `label` + `href`, where `href` is either a site path (`/events`), an anchor
(`#season`), an external URL, or an internal entry chosen through a relation widget. The builder picks the
simplest Sveltia-supported way to offer "pick a page" without losing free-form URLs.

### Snippets

Folder collection `snippets/*.md` with `name` and the same `sections` list as pages. A page includes one with the
Snippet block. Useful for things like "Donate appeal" or "Season sponsors" used on several pages.

## Live preview

- `registerPreviewTemplate` for **pages**, **snippets**, **events** and **news**. Each template debounces edits,
  POSTs the entry's data (with image paths resolved through `getAsset`, so unsaved uploads show) to
  `/api/preview`, and injects the returned HTML into the preview iframe.
- `/api/preview` validates the payload against the same content schemas, renders it with the same layout and
  section components as the real page (including header/footer for realism), and returns HTML. It renders with
  data from the deployed build for anything the entry references (events lists, news lists, venues, snippets,
  navigation). It accepts requests only from the site's own origin and returns nothing sensitive.
- `registerPreviewStyle` loads the site's compiled CSS from a stable path (e.g. `/admin/preview.css`), so fonts,
  themes and spacing match.
- Section components emit `data-key-path` attributes (only in preview mode) so clicking a block highlights its
  fields.
- Local development: `astro dev` serves both the site and `/api/preview`; the local CMS uses Sveltia's local-repo
  workflow.

## Hosting, sign-in and secrets

- **Cloudflare Worker** `seoso` (static assets + the on-demand preview route), connected to the GitHub repo through
  Workers Builds; root directory `site`, build `npm run build`, deploy `npx wrangler deploy`. During development
  the **production branch is `sveltia`**, so the development URL is `https://seoso.<account-subdomain>.workers.dev`.
  At cutover it switches to `main`.
- **Rollover Worker** (`workers/rollover/`): daily cron just after midnight Eastern (two UTC cron entries to
  cover daylight-saving time; the second run is a no-op because the first build moved `nextRollover` forward).
  Calls the Workers Builds deploy hook only when due. The deploy hook URL and the site URL are Worker secrets/vars, not in
  the repo.
- **Sveltia CMS Authenticator** Worker deployed to the same Cloudflare account.
- **GitHub OAuth App** owned by the `kellycreativetech` org, callback = the Worker's `/callback` URL.
- **Secrets live only in Cloudflare**, never in the repo: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Worker
  secrets) and `ALLOWED_DOMAINS` (the workers.dev host). The repo only holds the public Worker URL as `base_url` in
  `site/public/admin/config.yml`.
- The owner performs the dashboard steps that need their GitHub/Cloudflare login (connect repo, deploy the
  Worker, create the OAuth app, paste secrets). Claude gives exact click-paths and values and verifies each step.
- The CMS commits to branch `sveltia` until cutover.

## Migration

- Script `site/scripts/migrate-from-sanity.ts` reads the **published** documents from the public Sanity API
  (no token needed), converts Portable Text → Markdown (headings → inline Markdown), downloads the 32 image
  assets into `src/assets/uploads/` (keeping alt text and hotspot as a focal point where supported), and writes
  the files above. Because Sanity is frozen, it is a **one-time** import: it refuses to overwrite an existing
  content file unless run with `--force` (for re-running during development, before any CMS edits).
- Inventory to verify against: 11 pages, 35 events, 10 venues, 5 news posts, 32 images, the settings singleton.
- 5 unpublished Sanity drafts exist; they are **not** migrated. The public API can't see drafts, so their
  IDs/titles are listed separately with the owner's Sanity CLI login (Claude's call) for the owner to decide.
- Verification: counts match, every page/event/post builds, and a side-by-side screenshot comparison of each route
  against the current Next.js site (light/dark, desktop/mobile).

## Verification (definition of done)

- `astro check` and `astro build` pass; content schemas validate every file.
- daisyUI Blueprint Quality Inspector passes for the new components; rendered pages checked at desktop + mobile,
  light + dark.
- Every route returns 200 on the development URL.
- Owner signs in to `/admin`, edits a page, sees the preview update, saves, and the change appears on the
  development URL after the Cloudflare build.


## Left to the builder

- Exact folder names inside `site/src`, component file names, YAML key names (camelCase, consistent).
- Image handling details (Astro `image()` schema vs. plain paths) as long as images are optimized and editable.
- Whether Text + Media exposes "media first on mobile".
- How the preview CSS file is produced, as long as it is the same CSS as the site.
- CMS field labels, hints, summaries and default values (aim: plain language, sensible defaults, minimal choices).
- Whether small interactive bits use Astro `<script>` tags or a custom element.
- How components receive images in both modes (optimized `astro:assets` at build, plain URLs in preview).
