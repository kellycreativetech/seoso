# SEOSO site (Astro + Sveltia CMS on Cloudflare)

The Southeastern Ohio Symphony Orchestra website. Content lives in this repo as Markdown/JSON and is edited in
Sveltia CMS at `/admin`. The site is prerendered by Astro and served by Cloudflare Workers. Rules for changing the
code are in `AGENTS.md`.

## Commands (repo root)

| Task | Command |
| --- | --- |
| Develop | `npm run dev` → http://localhost:4321 (CMS at /admin/, choose “Work with Local Repository”) |
| Test | `npm test` (vitest) |
| Type check | `npm run check` |
| Build | `npm run build` → `dist/` |
| Run the built Worker locally | `npm run preview` → http://localhost:8787 |

## How it fits together

- **Content:** `src/content/` — `pages/` (ordered `sections` lists in frontmatter), `events/`, `news/`, `venues/`,
  `snippets/` (reusable blocks), `settings/` (`site.json`, `navigation.json`, `footer.json`). Schemas:
  `src/content.config.ts` and `src/lib/sections.ts`. The build fails on invalid content.
- **Images:** `src/assets/uploads/`, referenced relative to the content file (`../../assets/uploads/…`) and
  optimized at build.
- **Page blocks:** one Astro component per block in `src/components/sections/`, chosen by `SectionRenderer.astro`.
  `PageBuilder.astro` sets black/white backgrounds (the home page alternates). Gallery and video blocks open in a
  PhotoSwipe overlay (`src/lib/lightbox.ts`).
- **CMS:** `public/admin/config.yml` (Sveltia CMS, pinned version in `index.html`). Editors commit straight to
  `main`; every commit triggers a Cloudflare build.
- **Live preview:** `public/admin/preview.js` posts the entry being edited to `/api/preview`
  (`src/pages/api/preview.astro`, the only on-demand route), which renders it with the real components and the
  site CSS (`/admin/preview.css`). Same-origin POST only. See “Live preview” in `AGENTS.md` before changing it.
- **Events:** an event is past from midnight Eastern on the day after it ends (`src/lib/events.ts`). Upcoming
  lists include every upcoming event and the visitor's browser hides the ones that have passed
  (`src/lib/rollover.ts`), so nothing needs to rebuild when a concert ends. Each build publishes `/events.ics`
  (calendar feed).

## Hosting and secrets

| What | Where |
| --- | --- |
| Site Worker `seoso` | Cloudflare Workers Builds from `kellycreativetech/seoso`, root directory = repo root, build `npm run build`, deploy `npx wrangler deploy`, production branch `main`. Build variable `SITE_URL`. |
| CMS sign-in | Sveltia CMS Authenticator Worker + a GitHub OAuth App owned by `kellycreativetech`. Secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and variable `ALLOWED_DOMAINS` live on that Worker. Its URL is `backend.base_url` in `public/admin/config.yml`. |

No secret belongs in this repository.

## Editors

Anyone with **Write** access to `kellycreativetech/seoso` on GitHub can sign in at `/admin`.
