# SEOSO website

Website for the Southeastern Ohio Symphony Orchestra.

| Folder | What it is | Local URL | Live URL |
| --- | --- | --- | --- |
| `web/` | The public site (Next.js + daisyUI) | http://localhost:3000 | https://seoso.netlify.app |
| `studio/` | The CMS (Sanity Studio) | http://localhost:3333 | https://seoso.sanity.studio |

Content lives in Sanity (project `cerintdw`, dataset `production`), so the local site and Studio show the same content as the live ones.

## First-time setup

You need **Node.js 22.12 or newer** (`node --version`).

1. **Install everything** from this folder. This installs the root tools, then `studio/` and `web/`:

   ```bash
   npm install
   ```

2. **Create `web/.env.local`** from the template:

   ```bash
   cp web/.env.example web/.env.local
   ```

   Then set `SANITY_API_READ_TOKEN` to a **Viewer** token. Without it the site won't start.
   - Create one at [sanity.io/manage](https://www.sanity.io/manage) → SEOSO → API → Tokens → *Add API token* (Viewer), or
   - run `npx sanity tokens add "local preview" --role viewer` inside `studio/`.

   This file holds a secret and is ignored by git. Never commit it.

3. **Log in to Sanity** once, so the Studio and CLI know who you are:

   ```bash
   cd studio && npx sanity login
   ```

## Run it locally

```bash
npm run start
```

This starts both apps in one terminal (output is labelled `[web]` and `[studio]`):

- Site: http://localhost:3000
- Studio: http://localhost:3333

Press **Ctrl-C** to stop both. If one fails to start, the other stops too; check the output for the error.
The most common cause is something already using port 3000 or 3333.

To run just one:

```bash
npm run dev --prefix web      # site only
npm run dev --prefix studio   # Studio only
```

### Live preview

In the local Studio, open **Presentation** in the top bar to edit with a live preview of the local site.
Click any text or section on the page to edit it. Drafts show in the preview before you publish.

## Everyday commands

Run these from this folder:

| Command | What it does |
| --- | --- |
| `npm run start` | Run the site and Studio locally |
| `npm run typegen` | Regenerate TypeScript types after changing the schema or a query |
| `npm run check` | Typegen, type-check, lint and production-build the site |
| `npm run deploy:studio` | Publish the Studio to https://seoso.sanity.studio |
| `npm run deploy:web` | Build and publish the site to https://seoso.netlify.app (needs `npx netlify-cli login` once; config in `netlify.toml`) |

**Publishing content doesn't need a deploy.** Content published in the Studio appears on the live site right away.
Deploy only after changing code.

## Project layout

```
seoso/
├── studio/          Sanity Studio: content model (schemaTypes/), sidebar (structure.ts),
│                    live preview routes (presentation/)
├── web/             Next.js site: pages (src/app/), sections (src/components/),
│                    Sanity queries and client (src/sanity/)
├── AGENTS.md        Detailed conventions: design system, daisyUI and Sanity rules, content model
└── package.json     Root scripts (this README)
```

Read [AGENTS.md](AGENTS.md) before changing code. It covers the design rules, how to add a page section,
and what to check before you're done. AI coding agents read it automatically.
