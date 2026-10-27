import { describe, expect, test } from "vitest";
import { SECTION_TYPES, expandSnippets, previewSectionSchema, type Section } from "../../src/lib/sections";

const img = { src: "../../assets/uploads/a.jpg", alt: "A" };
const link = { label: "Go", page: "about" };
const minimal: Record<(typeof SECTION_TYPES)[number], object> = {
  hero: { heading: "Hi" },
  eventsList: { scope: "upcoming" },
  highlightBand: { heading: "Shirts", figure: img, buttons: [link] },
  newsList: { limit: 1 },
  richText: { body: "Text" },
  people: { people: [{ name: "Ann" }] },
  contacts: { contacts: [{ purpose: "Booking" }] },
  venues: { venues: ["john-mcintire-library"] },
  gallery: { images: [img] },
  video: { videos: [{ youtubeId: "abc", title: "Clip" }] },
  textMedia: { body: "Text", mediaSide: "left", media: { kind: "image", image: img } },
  cardGrid: { columns: 3, cards: [{ title: "Card" }] },
  testimonials: { quotes: [{ quote: "Lovely", name: "Ann" }] },
  ctaBand: { heading: "Give", buttons: [link] },
  faq: { items: [{ question: "Q", answer: "A" }] },
  stats: { stats: [{ value: "50", label: "years" }, { value: "5", label: "concerts" }] },
  logos: { logos: [{ image: img, name: "Sponsor" }] },
  snippet: { snippet: "appeal" },
};

describe("section schema", () => {
  test.each(SECTION_TYPES)("a minimal %s parses", (type) => {
    expect(previewSectionSchema.safeParse({ type, ...minimal[type] }).success).toBe(true);
  });
  test("a hero needs a heading", () => {
    expect(previewSectionSchema.safeParse({ type: "hero" }).success).toBe(false);
  });
  test("text + media only goes left or right", () => {
    expect(previewSectionSchema.safeParse({ type: "textMedia", body: "x", mediaSide: "top" }).success).toBe(false);
  });
  test("a venues block keeps its chosen venues in order", () => {
    const parsed = previewSectionSchema.parse({ type: "venues", venues: ["b", "a"] });
    expect(parsed.type === "venues" && parsed.venues).toEqual(["b", "a"]);
  });
  test("an unknown block type is rejected", () => {
    expect(previewSectionSchema.safeParse({ type: "marquee" }).success).toBe(false);
  });
});

describe("expandSnippets", () => {
  const cta: Section = { type: "ctaBand", heading: "Give", buttons: [] };
  const text: Section = { type: "richText", body: "x" };
  test("replaces a snippet with its sections and drops a snippet nested inside it", () => {
    const snippets = new Map<string, Section[]>([["appeal", [cta, { type: "snippet", snippet: "appeal" }]]]);
    expect(expandSnippets([{ type: "snippet", snippet: "appeal" }, text], snippets)).toEqual([
      { section: cta, sourceIndex: 0 },
      { section: text, sourceIndex: 1 },
    ]);
  });
  test("a deleted snippet renders nothing and keeps the rest of the page", () => {
    expect(expandSnippets([{ type: "snippet", snippet: "gone" }, text], new Map())).toEqual([
      { section: text, sourceIndex: 1 },
    ]);
  });
});
