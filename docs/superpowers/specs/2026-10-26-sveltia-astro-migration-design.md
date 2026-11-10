# SEOSO: Astro + Sveltia CMS on Cloudflare Workers — design

Status: built and live · Branch: `main` · First written 2026-10-26, revised 2026-11-09 to match the code.

## Why

SEOSO is a small nonprofit orchestra. The site has to be **free (or nearly)** to run, keep content **in the Git
repo as Markdown/JSON**, and give non-technical editors a CMS with an **accurate live preview** and
**page-building blocks**.

Success: the Astro site served from Cloudflare, Sveltia CMS at `/admin` that editors sign in to with GitHub,
editors able to build a landing page by stacking blocks, and the preview pane looking like the real page.

## Goals

1. **Astro static site** in the repo root using the SEOSO design system (daisyUI 5 + Tailwind 4, the `seoso` /
   `seoso-dark` themes, type scale, black "stage" / white alternation, homepage tone rotation — see `AGENTS.md`).
2. **Sveltia CMS** at `/admin`, GitHub backend, signing in through the **Sveltia CMS Authenticator** on
   Cloudflare Workers.
3. **Hosting on Cloudflare Workers + Workers Builds** (free plan), building from the private
   `kellycreativetech/seoso` GitHub repo.
4. **Page builder in frontmatter:** a page is a Markdown file whose frontmatter has an ordered `sections` list;
   list order = order on the page. Editors add, remove and drag-reorder blocks in the CMS.
5. **Live preview** in the CMS's right pane rendering the real section components with the real site CSS.
6. **A landing-page component kit** (below).
7. **Site-wide editable data** in the CMS: navigation, footer, contact details, social links, Donate link, and
   **Snippets** (reusable content blocks).
8. **No rebuild when a concert ends:** past concerts drop off upcoming lists in the visitor's browser.

## Non-goals

- A custom domain (seoso.org) — a later step.
- Multiple languages, search, comments, forms beyond `mailto:`, e-commerce.
- Editorial workflow (drafts as pull requests). Editors commit directly (Sveltia "simple" workflow).

## Anti-goals (a failure even if it technically works)

- The preview pane drifting from the real site (a second, hand-maintained copy of the markup).
- Visitors downloading a JavaScript framework to read a static page. Every public page is prerendered plain HTML;
  only small interactive bits (mobile nav, dropdowns, the event rollover) ship JS. Event lists are printed in the
  HTML, not loaded by script.
- Any secret (OAuth client secret, API token) committed to the repo.
- A CMS so open-ended that editors can break the design (free-form colors, arbitrary CSS, unbounded layouts).

## Decisions (by the owner)

- **Hosting:** Cloudflare Workers with static assets and **Workers Builds** (Git integration), not Cloudflare
  Pages: the Astro Cloudflare adapter (v13+) supports only Workers, and the live preview needs one on-demand route.
  Static asset requests are free and unlimited; 3,000 build minutes/month.
- **CMS:** Sveltia CMS on the GitHub backend, signing in through the Sveltia CMS Authenticator Worker.
  **Framework:** Astro.
- **Event rollover: "the day after the event."** An event counts as past from **00:00 America/New_York on the day
  after it ends** (its end, or its start if it has no end) — `pastAt()` in `src/lib/events.ts`, the one rule.
  - Pages are rendered with every event that is upcoming at build time. Each upcoming row carries
    `data-past-at` (the `pastAt` instant, absolute, so the visitor's time zone doesn't matter).
  - A small script (`src/lib/rollover.ts`) compares those instants with the browser clock: it hides past rows,
    reapplies the block's `limit` (rows beyond it are printed but start hidden), hides year headings left empty and
    shows the "New dates are coming soon" message when nothing is left. Event pages hide the ticket button the
    same way (`data-show-until` / `data-show-from`). The server computes the same initial state, so nothing jumps.
  - Every event stays in the HTML for search engines. No Worker, cron or rebuild is needed when a concert ends;
    "past" lists change on the next build (any CMS save triggers one).
- **Calendar feed:** the build publishes `/events.ics` (all events, with venue address and a link to the event
  page); upcoming lists offer "Subscribe to the season calendar" (`webcal://`) and a download link. The feed is
  for subscribers; pages don't read it.
- **Components are plain Astro (`.astro`)** — no React, Vue or Svelte in the site's own code.
- **Preview is rendered by the site itself:** one on-demand route, `/api/preview`, renders the edited entry with the
  real Astro components and returns HTML. All other routes are prerendered. The CMS registers one short preview
  script (`public/admin/preview.js`, using the React that Sveltia already bundles; no install, no build step) that
  sends the entry to that route and shows the returned HTML. Preview refreshes after a 300 ms pause in typing.

## Constraints

- Free tier limits: Workers Builds 3,000 build minutes/month, 1 concurrent build, 20-minute timeout; static assets
  free; Workers requests 100,000/day (preview route, authenticator).
- Every editor needs a GitHub account with **Write** access to `kellycreativetech/seoso`.
- Sveltia CMS is pre-1.0 (pinned in `public/admin/index.html`); `registerPreviewTemplate` takes a React component
  (`CMS.React`), rendered in a preview frame that inherits no admin styles (`CMS.registerPreviewStyle`).
  Click-to-highlight uses `data-key-path` attributes on rendered elements.
- Astro is pinned exactly (`7.4.2`); tests render components with the Container API, which is experimental.
- Event dates are stored in UTC and always displayed in America/New_York.
- Project rules in `AGENTS.md` apply: daisyUI Blueprint workflow for UI, semantic colors only, no authored CSS
  selectors, static class strings, square corners, no shadows.

## Architecture

```
seoso/                            Workers Builds root directory = repo root
├── astro.config.mjs              static pages + @astrojs/cloudflare (for /api/preview), Tailwind 4 via Vite
├── wrangler.jsonc                Worker "seoso": static assets from dist/ + the server entry
├── public/admin/                 Sveltia CMS: index.html, config.yml, preview.js (no build step)
└── src/
    ├── content/                  ALL CONTENT (edited by the CMS)
    │   ├── pages/*.md            frontmatter: title, seo, sections[]
    │   ├── events/*.md           title, start, end, venue (relation), summary, admission, tickets + body
    │   ├── news/*.md             date, excerpt, summary, facts[] + body
    │   ├── venues/*.md           name, city, address, directions, website
    │   ├── snippets/*.md         name, sections[] (reusable blocks)
    │   └── settings/             site.json, navigation.json, footer.json
    ├── assets/uploads/           images (optimized by astro:assets)
    ├── content.config.ts         zod schemas for every collection (build fails on bad content)
    ├── components/sections/      one Astro component per block (used by pages AND /api/preview)
    ├── components/site/          header, drawer, footer, nav behavior
    ├── pages/                    routes; api/preview.astro (on-demand); events.ics.ts; admin/preview.css.ts
    └── lib/                      events.ts (the "past" rule), rollover.ts (browser drop-off), sections.ts, preview.ts …
```

### Routes

`/` (the page named by `settings/site.json` `homePage`), `/[slug]`, `/events`, `/events/[slug]`, `/news`,
`/news/[slug]`, `/admin`, `/admin/preview.css`, `/events.ics`, and the on-demand `/api/preview` (POST only,
same origin). `/home` → `/` (301) is in `public/_redirects`.

## Content model

Frontmatter is plain YAML. Inline formatting in headings is **inline Markdown** (`I’m with the ~~band~~
*Symphony*`): `*…*` renders as the serif italic and `~~…~~` as `<s>`. Rich text fields are Markdown.

### Pages (`folder` collection)

```yaml
title: About SEOSO
seo: { title, description, image, noIndex }
sections:
  - type: hero
    eyebrow: About SEOSO
    heading: From the *Beginning*
    lead: …
  - type: textMedia
    …
```

The CMS uses a **list widget with `types`** (`typeKey: type`) so each block has its own form and a summary line in
the collapsed list. Order in the list = order on the page.

### Section kit

**Hero/Masthead** (optional photo), **Events list** (upcoming/past, limit), **Highlight band** (optional square
figure, heading with italic/strike, body, ≤2 buttons), **News list** (latest N), **Rich text**, **People**,
**Contacts** (pulls address/email from settings), **Venues**, **Gallery**, **Video** (YouTube, youtube-nocookie),
**Text + Media** (image or video beside text, left or right), **Card grid** (2/3/4 columns), **Testimonials**
(1–3), **Call to action band**, **FAQ** (native `<details>`), **Stats** (2–4 figures), **Logos**, and **Snippet**
(a relation to a Snippet entry; its sections render in place).

Each block offers a small, fixed set of options — no free-form styling. Background tone is automatic
(`PageBuilder.astro`: masthead and highlight bands are black; the home page alternates). Each block has an
optional `anchorId`.

### Events, News, Venues

Folder collections. Events reference venues via a **relation widget** (by venue slug). News posts have `excerpt`,
rich `summary`, `facts[]` (label/value) and body.

### Site settings (`files` collection, one entry per file)

- `settings/site.json` — title, tagline, logo, default SEO image, Donate link, mailing address, email, social
  links, home page (relation).
- `settings/navigation.json` — main nav tree (label, link, optional dropdown children).
- `settings/footer.json` — footer links and note.

Links use one shape: `label` + either `page` (a relation to a page) or `href` (a site path, `#anchor`, `mailto:` or
a full URL).

### Snippets

`snippets/*.md` with `name` and the same `sections` list as pages, included on a page with the Snippet block.

## Live preview

- `public/admin/preview.js` registers a preview template for **pages**, **snippets**, **events** and **news**.
  Each debounces edits, POSTs `{ collection, slug, data }` (image paths resolved through `getAsset`, so unsaved
  uploads show) to `/api/preview`, and injects the returned HTML.
- `/api/preview` (`src/pages/api/preview.astro`) validates the payload (`src/lib/preview.ts`, never throws: a
  half-filled block is skipped and counted in a notice), renders it with the same header, footer, `PageBuilder`,
  `EventDetail` and `PostDetail` as the real page, and returns HTML. It uses the deployed build's data for anything
  the entry references (events, news, venues, snippets, navigation). Same-origin POST only; nothing private.
- `registerPreviewStyle` loads the site's compiled CSS from `/admin/preview.css`.
- In preview mode `PageBuilder` adds `data-key-path` to each block so clicking it highlights its fields.
- Scripts in the returned HTML don't run in the preview pane; the server already renders the current state.
- Local development: `npm run dev` serves the site and `/api/preview`; the CMS uses Sveltia's local-repo workflow.

## Hosting, sign-in and secrets

- **Cloudflare Worker** `seoso` (static assets + the preview route), connected to the GitHub repo through Workers
  Builds; root directory = repo root, build `npm run build`, deploy `npx wrangler deploy`, production branch
  `main`. Build variable `SITE_URL`.
- **Sveltia CMS Authenticator** Worker on the same Cloudflare account, with a **GitHub OAuth App** owned by
  `kellycreativetech` (callback = the Worker's `/callback`). Secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and
  variable `ALLOWED_DOMAINS` live only on that Worker. The repo holds only its public URL (`backend.base_url`).
- The CMS commits straight to `main`; each commit triggers a build.

## Verification (definition of done)

- `npm test`, `npm run check` and `npm run build` pass; content schemas validate every file.
- daisyUI Blueprint Quality Inspector passes for changed components; rendered pages checked at desktop + mobile,
  light + dark.
- Every route returns the expected status code.
- An editor signs in to `/admin`, edits a page, sees the preview update, saves, and the change appears after the
  Cloudflare build.
