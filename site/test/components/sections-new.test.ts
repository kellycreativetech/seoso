import { describe, expect, test } from "vitest";
import CardGrid from "../../src/components/sections/CardGrid.astro";
import CtaBand from "../../src/components/sections/CtaBand.astro";
import Faq from "../../src/components/sections/Faq.astro";
import Logos from "../../src/components/sections/Logos.astro";
import Stats from "../../src/components/sections/Stats.astro";
import Testimonials from "../../src/components/sections/Testimonials.astro";
import TextMedia from "../../src/components/sections/TextMedia.astro";
import { render } from "../helpers";

const image = { src: "/uploads/hall.jpg", alt: "The hall" };

describe("Text + Media", () => {
  const base = { type: "textMedia", body: "Two paragraphs.", buttons: [] } as const;
  test("media on the left comes first from md up, and after the text on mobile", async () => {
    const html = await render(TextMedia, { section: { ...base, mediaSide: "left", media: { kind: "image", image } }, index: 0 });
    expect(html).toMatch(/class="[^"]*md:order-first[^"]*"[^>]*>\s*<img[^>]*alt="The hall"/);
    expect(html.indexOf("Two paragraphs.")).toBeLessThan(html.indexOf('alt="The hall"'));
  });
  test("media on the right goes last from md up", async () => {
    const html = await render(TextMedia, { section: { ...base, mediaSide: "right", media: { kind: "image", image } }, index: 0 });
    expect(html).toContain("md:order-last");
    expect(html).toContain("md:col-span-1");
    expect(html).toContain("md:col-span-2");
  });
  test("without media the text spans the full row", async () => {
    const html = await render(TextMedia, { section: { ...base, mediaSide: "right" }, index: 0 });
    expect(html).toContain("md:col-span-3");
    expect(html).not.toContain("md:col-span-1");
  });
  test("a video renders the privacy-friendly embed", async () => {
    const html = await render(TextMedia, {
      section: { ...base, mediaSide: "left", media: { kind: "video", youtubeId: "p42o4GpAW5o", title: "SEOSO" } },
      index: 0,
    });
    expect(html).toContain("youtube-nocookie.com/embed/p42o4GpAW5o");
  });
});

describe("Card grid", () => {
  test("column count maps to the grid", async () => {
    const html = await render(CardGrid, { section: { type: "cardGrid", columns: 4, cards: [{ title: "One" }] }, index: 0 });
    expect(html).toContain("md:grid-cols-4");
    expect(html).toContain("One");
  });
  test("no cards renders nothing", async () => {
    expect((await render(CardGrid, { section: { type: "cardGrid", columns: 3, cards: [] }, index: 0 })).trim()).toBe("");
  });
});

test("testimonial quotes are escaped", async () => {
  const html = await render(Testimonials, {
    section: { type: "testimonials", quotes: [{ quote: "<script>alert(1)</script> Lovely", name: "Ann" }] },
    index: 0,
  });
  expect(html).not.toContain("<script>alert");
  expect(html).toContain("&lt;script&gt;");
});

test("FAQ renders one native details collapse per question", async () => {
  const html = await render(Faq, {
    section: { type: "faq", items: [{ question: "Are concerts free?", answer: "Yes." }, { question: "Parking?", answer: "Free lot." }] },
    index: 0,
  });
  expect(html.match(/<details class="collapse/g)).toHaveLength(2);
  expect(html).toContain("Are concerts free?");
});

test("stats use the daisyUI stats hierarchy", async () => {
  const html = await render(Stats, {
    section: { type: "stats", stats: [{ value: "50", label: "years" }, { value: "5", label: "free concerts" }] },
    index: 0,
  });
  expect(html.match(/class="stat-value/g)).toHaveLength(2);
  expect(html).toContain("free concerts");
});

test("a linked sponsor logo opens safely and is named", async () => {
  const html = await render(Logos, {
    section: { type: "logos", logos: [{ image, name: "Muskingum University", href: "https://www.muskingum.edu" }] },
    index: 0,
  });
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain('alt="Muskingum University"');
});

test("CTA band shows its buttons", async () => {
  const html = await render(CtaBand, { section: { type: "ctaBand", heading: "Support *your* symphony", buttons: [{ label: "Donate", page: "donate" }] }, index: 0 });
  expect(html).toContain("<em>your</em>");
  expect(html).toContain('href="/donate"');
});
