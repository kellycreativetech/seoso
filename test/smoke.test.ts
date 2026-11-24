import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import BaseLayout from "../src/layouts/BaseLayout.astro";

const props = { title: "About | SEOSO", canonical: "https://seoso.example/about", siteName: "SEOSO" };
const render = async (extra: Record<string, unknown> = {}) =>
  (await AstroContainer.create()).renderToString(BaseLayout, { props: { ...props, ...extra }, slots: { default: "<p>hi</p>" } });

test("BaseLayout renders the document shell with title and slot", async () => {
  const html = await render();
  expect(html).toContain("<title>About | SEOSO</title>");
  expect(html).toContain('lang="en"');
  expect(html).toContain("<p>hi</p>");
});

test("every page declares its canonical URL and Open Graph basics", async () => {
  const html = await render({ description: "Free concerts" });
  expect(html).toContain('<link rel="canonical" href="https://seoso.example/about"');
  expect(html).toContain('<meta property="og:title" content="About | SEOSO"');
  expect(html).toContain('<meta property="og:description" content="Free concerts"');
  expect(html).toContain('<meta property="og:url" content="https://seoso.example/about"');
  expect(html).toContain('<meta property="og:site_name" content="SEOSO"');
  expect(html).toContain('<meta property="og:type" content="website"');
  expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
  expect(html).not.toContain('name="robots"');
});

test("a share image carries its size and alt text", async () => {
  const html = await render({ image: "https://seoso.example/a.webp" });
  expect(html).toContain('<meta property="og:image" content="https://seoso.example/a.webp"');
  expect(html).toContain('<meta property="og:image:width" content="1200"');
  expect(html).toContain('<meta property="og:image:height" content="630"');
  expect(html).toContain('<meta property="og:image:alt" content="About | SEOSO"');
});

test("the favicon set and web manifest are linked", async () => {
  const html = await render();
  expect(html).toContain('<link rel="icon" href="/favicon.ico" sizes="32x32"');
  expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml"');
  expect(html).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"');
  expect(html).toContain('<link rel="manifest" href="/icons/site.webmanifest"');
});

test("noIndex pages ask search engines to stay away", async () => {
  expect(await render({ noIndex: true })).toContain('<meta name="robots" content="noindex"');
});
