import { describe, expect, test } from "vitest";
import Media from "../../src/components/ui/Media.astro";
import ButtonLink from "../../src/components/ui/ButtonLink.astro";
import Heading from "../../src/components/ui/Heading.astro";
import { render } from "../helpers";

test("external buttons open safely", async () => {
  const html = await render(ButtonLink, { link: { label: "Buy now", href: "https://www.bonfire.com/im-with-the-symphony/" }, variant: "brand" });
  expect(html).toContain('href="https://www.bonfire.com/im-with-the-symphony/"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain("Buy now");
});
test("a page button links to the page path", async () => {
  const html = await render(ButtonLink, { link: { label: "Donate", page: "donate" }, variant: "brand" });
  expect(html).toContain('href="/donate"');
  expect(html).not.toContain("noopener");
});
test("a button with no destination renders nothing", async () => {
  expect((await render(ButtonLink, { link: { label: "x" }, variant: "brand" })).trim()).toBe("");
});
test("Heading renders inline Markdown safely", async () => {
  expect(await render(Heading, { text: "Celebrate *Your* <Symphony>" })).toBe("Celebrate <em>Your</em> &lt;Symphony&gt;");
});

describe("Media", () => {
  const photo = { src: "/src/assets/uploads/a.jpg", width: 1000, height: 750, format: "jpg" };
  test("optimized images are a <picture> with AVIF and WebP sources", async () => {
    const html = await render(Media, { src: photo, alt: "Hall", width: 600, height: 450, variant: "gallery" });
    expect(html).toContain("<picture");
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain('alt="Hall"');
  });
  test("srcset never asks for a width larger than the source image", async () => {
    const html = await render(Media, { src: photo, alt: "", width: 1920, height: 672, variant: "hero" });
    const widths = [...html.matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBeLessThanOrEqual(1000);
  });
  test("a source smaller than the requested size keeps its own shape instead of being cropped", async () => {
    const small = { src: "/src/assets/uploads/b.jpg", width: 500, height: 375, format: "jpg" };
    const html = await render(Media, { src: small, alt: "", width: 1240, height: 827, variant: "media" });
    const [, w, h] = html.match(/<img[^>]* width="(\d+)" height="(\d+)"/) ?? [];
    expect(Number(w) / Number(h)).toBeCloseTo(4 / 3, 2);
  });
  test("<picture> is one box, so its <source> children never become grid or flex items", async () => {
    const html = await render(Media, { src: photo, alt: "", width: 600, height: 450, variant: "gallery" });
    expect(html).toMatch(/<picture class="block">/);
  });
  test("SVG uploads pass through untouched (converting them would fail the build)", async () => {
    const svg = { src: "/src/assets/uploads/sponsor.svg", width: 300, height: 100, format: "svg" };
    const html = await render(Media, { src: svg, alt: "Sponsor", width: 320, height: 112, variant: "sponsor" });
    expect(html).not.toContain("<picture");
    expect(html).toMatch(/<img[^>]*src="[^"]*sponsor\.svg"/);
    expect(html).toContain('alt="Sponsor"');
  });
  test("WebP sources (every CMS upload) fall back to WebP, not heavy PNG", async () => {
    const webp = { src: "/src/assets/uploads/c.webp", width: 2000, height: 1500, format: "webp" };
    const html = await render(Media, { src: webp, alt: "", width: 600, height: 450, variant: "gallery" });
    const img = html.match(/<img[^>]*>/)?.[0] ?? "";
    expect(img).toMatch(/f=webp|\.webp/);
    expect(img).not.toMatch(/f=png|\.png/);
  });
  test("plain URLs (CMS preview uploads, YouTube thumbnails) stay a simple <img>", async () => {
    const html = await render(Media, { src: "blob:https://x/1", alt: "New", width: 600, height: 450, variant: "gallery" });
    expect(html).toContain('<img src="blob:https://x/1"');
    expect(html).not.toContain("<picture");
  });
});
