import { expect, test } from "vitest";
import EventList from "../../src/components/sections/EventList.astro";
import Gallery from "../../src/components/sections/Gallery.astro";
import Hero from "../../src/components/sections/Hero.astro";
import HighlightBand from "../../src/components/sections/HighlightBand.astro";
import RichText from "../../src/components/sections/RichText.astro";
import Video from "../../src/components/sections/Video.astro";
import { previewSectionSchema } from "../../src/lib/sections";
import { render } from "../helpers";

test("hero heading sets italic words as emphasis", async () => {
  const html = await render(Hero, { section: { type: "hero", heading: "Celebrate *Your* Symphony!", buttons: [] }, index: 0, isFirst: true });
  expect(html).toContain("<em>Your</em>");
  expect(html).toMatch(/<h1[^>]*>/);
});
test("a later hero uses h2", async () => {
  const html = await render(Hero, { section: { type: "hero", heading: "Hi", buttons: [] }, index: 2, isFirst: false });
  expect(html).toMatch(/<h2[^>]*>/);
  expect(html).not.toMatch(/<h1[^>]*>/);
});
test("highlight band columns depend on the figure", async () => {
  const copyOnly = await render(HighlightBand, { section: { type: "highlightBand", heading: "Band", buttons: [] }, index: 0 });
  expect(copyOnly).toContain("md:col-span-8");
  const withFigure = await render(HighlightBand, {
    section: { type: "highlightBand", heading: "Band", buttons: [], figure: { src: "/x.png", alt: "Shirts" } },
    index: 0,
  });
  expect(withFigure).toContain("md:col-span-7 md:col-start-6");
  expect(withFigure).toContain('alt="Shirts"');
});
test("event list: programme rows with year headings and venue", async () => {
  const html = await render(EventList, {
    events: [
      { slug: "a", title: "String ensemble", start: new Date("2026-10-20T23:00:00Z"), venue: { name: "Crossroads Library", city: "Cambridge" } },
      { slug: "b", title: "Symphony orchestra", start: new Date("2027-04-20T23:00:00Z") },
    ],
  });
  expect(html).toContain('href="/events/a"');
  expect(html).toContain("Crossroads Library");
  expect(html).toContain(">2026<");
  expect(html).toContain(">2027<");
  expect(html).toContain("7 pm");
});
test("an empty gallery renders nothing", async () => {
  // The lightbox script tag may still be emitted; it does nothing without a [data-lightbox] container.
  expect(await render(Gallery, { section: { type: "gallery", images: [] }, index: 0 })).not.toMatch(/<section|<ul/);
});
test("videos show a black-and-white YouTube thumbnail that opens the lightbox", async () => {
  const html = await render(Video, { section: { type: "video", videos: [{ youtubeId: "Wvj1FS44Jok", title: "Instruments" }] }, index: 0 });
  expect(html).toMatch(/data-lightbox/);
  // Without JavaScript the link still plays the video on YouTube.
  expect(html).toMatch(/<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=Wvj1FS44Jok"[^>]*data-youtube-id="Wvj1FS44Jok"/);
  expect(html).toContain('src="https://i.ytimg.com/vi/Wvj1FS44Jok/hqdefault.jpg"');
  expect(html).toContain('aria-label="Play video: Instruments"');
  expect(html).toMatch(/<a[^>]*class="[^"]*grayscale/);
  expect(html).not.toContain("<iframe");
});

test("gallery photos are black-and-white thumbnails linking to the full image for the lightbox", async () => {
  const html = await render(Gallery, {
    section: { type: "gallery", images: [{ src: "https://example.com/a.jpg", alt: "A concert" }] },
    index: 0,
  });
  expect(html).toMatch(/<ul[^>]*data-lightbox/);
  expect(html).toMatch(/<a[^>]*href="https:\/\/example\.com\/a\.jpg"[^>]*data-pswp-width="\d+"[^>]*data-pswp-height="\d+"/);
  expect(html).toMatch(/<a[^>]*class="[^"]*grayscale/);
  expect(html).toContain('alt="A concert"');
});
test("rich text renders Markdown and escapes raw HTML", async () => {
  const html = await render(RichText, { section: { type: "richText", body: "Hello **there** <script>x</script>" }, index: 0 });
  expect(html).toContain("<strong>there</strong>");
  expect(html).not.toContain("<script>x");
});

test("hero width defaults to wide; a blank CMS value counts as wide", () => {
  const parse = (width: unknown) => previewSectionSchema.parse({ type: "hero", heading: "Hi", width });
  expect(parse(undefined)).toMatchObject({ width: "wide" });
  expect(parse("")).toMatchObject({ width: "wide" });
  expect(parse("text")).toMatchObject({ width: "text" });
});

test("a hero set to the text width lines up with the long-form text column", async () => {
  const text = await render(Hero, { section: { type: "hero", heading: "Da *capo*", buttons: [], width: "text" }, index: 0, isFirst: true });
  const wide = await render(Hero, { section: { type: "hero", heading: "Da *capo*", buttons: [], width: "wide" }, index: 0, isFirst: true });
  expect(text).toContain("max-w-[62ch] md:col-span-8 md:col-start-4");
  expect(wide).not.toContain("md:col-start-4");
});

test("rich text without a heading has no top rule", async () => {
  const bare = await render(RichText, { section: { type: "richText", body: "Text" }, index: 0 });
  const headed = await render(RichText, { section: { type: "richText", heading: "Milestones", body: "Text" }, index: 0 });
  expect(bare).not.toContain("border-t-2");
  expect(headed).toContain("border-t-2");
});
