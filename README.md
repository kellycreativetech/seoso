# SEOSO site (Astro + Sveltia CMS on Cloudflare)

The Southeastern Ohio Symphony Orchestra website. Content lives in this repo as Markdown/JSON and is edited in
Sveltia CMS at `/admin`. The site is prerendered by Astro and served by Cloudflare Workers.

## Commands (run in `site/`)

| Task | Command |
| --- | --- |
| Develop | `npm run dev` → http://localhost:4321 (CMS at /admin/, choose “Work with Local Repository”) |
| Test | `npm test` (vitest) |
| Type check | `npm run check` |
| Build | `npm run build` → `dist/` |
| Run the built Worker locally | `npm run preview` → http://localhost:8787 |
| Re-import from Sanity (discards CMS edits!) | `npm run migrate -- --force` |

## How it fits together

- **Content:** `src/content/` — `pages/` (ordered `sections` lists in frontmatter), `events/`, `news/`, `venues/`,
  `snippets/` (reusable blocks), `settings/` (`site.json`, `navigation.json`, `footer.json`). Schemas:
  `src/content.config.ts` and `src/lib/sections.ts`. The build fails on invalid content.
- **Images:** `src/assets/uploads/`, referenced relative to the content file (`../../assets/uploads/…`) and
  optimized at build.
- **Page blocks:** one Astro component per block in `src/components/sections/`, chosen by `SectionRenderer.astro`.
  `PageBuilder.astro` sets black/white backgrounds (home page alternates). To add a block: schema in
  `lib/sections.ts` → component + case in `SectionRenderer.astro` → type in `public/admin/config.yml` (pages and
  snippets share it) → `npm test` (`test/cms-config.test.ts` checks they match).
- **CMS:** `public/admin/config.yml` (Sveltia CMS, pinned version in `index.html`). Editors commit straight to
  the branch in `backend.branch`.
- **Live preview:** `public/admin/preview.js` posts the entry being edited to `/api/preview`
  (`src/pages/api/preview.astro`, the only on-demand route), which renders it with the real components and the
  site CSS (`/admin/preview.css`). Same-origin POST only.
- **Events:** an event is past from midnight Eastern on the day after it ends (`src/lib/events.ts`). Each build
  publishes `/events.json` (with `nextRollover`) and `/events.ics` (calendar feed).
- **Rollover:** `../workers/rollover/` runs daily just after midnight Eastern and calls the deploy hook only when
  a concert has fallen off since the last build.

## Hosting and secrets

| What | Where |
| --- | --- |
| Site Worker `seoso` | Cloudflare Workers Builds, root `site`, build `npm run build`, deploy `npx wrangler deploy`, production branch `main`. Build variable `SITE_URL`. |
| CMS sign-in | Sveltia CMS Authenticator Worker + a GitHub OAuth App owned by `kellycreativetech`. Secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and variable `ALLOWED_DOMAINS` live on that Worker. Its URL is `backend.base_url` in `public/admin/config.yml`. |
| Rollover Worker `seoso-rollover` | Workers Builds, root `workers/rollover`. Variable `SITE_URL`, secret `DEPLOY_HOOK_URL` (the site's deploy hook). |

No secret belongs in this repository.

## Editors

Anyone with **Write** access to `kellycreativetech/seoso` on GitHub can sign in at `/admin`. Sanity is frozen:
content edited there after the migration must be copied over by hand.
