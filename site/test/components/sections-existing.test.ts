import { expect, test } from "vitest";
import EventList from "../../src/components/sections/EventList.astro";
import Gallery from "../../src/components/sections/Gallery.astro";
import Hero from "../../src/components/sections/Hero.astro";
import HighlightBand from "../../src/components/sections/HighlightBand.astro";
import RichText from "../../src/components/sections/RichText.astro";
import Video from "../../src/components/sections/Video.astro";
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
  expect((await render(Gallery, { section: { type: "gallery", images: [] }, index: 0 })).trim()).toBe("");
});
test("videos embed through youtube-nocookie with a title", async () => {
  const html = await render(Video, { section: { type: "video", videos: [{ youtubeId: "Wvj1FS44Jok", title: "Instruments" }] }, index: 0 });
  expect(html).toContain('src="https://www.youtube-nocookie.com/embed/Wvj1FS44Jok"');
  expect(html).toContain('title="Instruments"');
});
test("rich text renders Markdown and escapes raw HTML", async () => {
  const html = await render(RichText, { section: { type: "richText", body: "Hello **there** <script>x</script>" }, index: 0 });
  expect(html).toContain("<strong>there</strong>");
  expect(html).not.toContain("<script>x");
});
