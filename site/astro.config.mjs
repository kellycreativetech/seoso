// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { siteUrl } from "./site-url.mjs";

// Every page is prerendered; only /api/preview renders on demand (it opts out with `prerender = false`).
// Vitest renders components with the Container API and doesn't need (and conflicts with) the Cloudflare adapter.
export default defineConfig({
  site: siteUrl(process.env),
  output: "static",
  // Same URLs as the current site (/about, not /about/): emit about.html, which Cloudflare serves at /about.
  build: { format: "file" },
  trailingSlash: "never",
  adapter: process.env.VITEST ? undefined : cloudflare({ imageService: "compile" }),
  vite: { plugins: [tailwindcss()] },
});
