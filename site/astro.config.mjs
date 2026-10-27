// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Every page is prerendered; only /api/preview renders on demand (it opts out with `prerender = false`).
// Vitest renders components with the Container API and doesn't need (and conflicts with) the Cloudflare adapter.
export default defineConfig({
  site: process.env.SITE_URL ?? "http://localhost:4321",
  output: "static",
  adapter: process.env.VITEST ? undefined : cloudflare({ imageService: "compile" }),
  vite: { plugins: [tailwindcss()] },
});
