import { describe, expect, test } from "vitest";
import {
  type Ctx,
  headingToInline,
  portableTextToMarkdown,
  slugify,
  transformLink,
  transformSection,
} from "../../scripts/sanity-transform";

const span = (text: string, marks: string[] = []) => ({ _type: "span", text, marks });
const block = (children: object[], extra: object = {}) => ({ _type: "block", style: "normal", markDefs: [], children, ...extra });

const ctx: Ctx = {
  docs: new Map([
    ["MkzIlesDIMzd9qSpNEMIer", { type: "page", slug: "donate" }],
    ["JvPYpz8fI9X3Uqv2Wunf0G", { type: "page", slug: "home" }],
    ["EV1", { type: "event", slug: "string-ensemble-2026-10-20" }],
    ["PO1", { type: "post", slug: "march-23rd-concert" }],
    ["VE1", { type: "venue", slug: "john-mcintire-library" }],
  ]),
  imagePath: (ref) => `../../assets/uploads/${ref}.jpg`,
};

describe("headings", () => {
  test("italic and strikethrough become inline Markdown", () => {
    const heading = [block([span("I’m with the "), span("band", ["strike-through"]), span(" "), span("Symphony", ["em"])])];
    expect(headingToInline(heading)).toBe("I’m with the ~~band~~ *Symphony*");
  });
  test("an empty heading is an empty string", () => {
    expect(headingToInline(null)).toBe("");
  });
});

describe("rich text", () => {
  test("paragraphs, bold, italic, links, lists and subheadings", () => {
    const blocks = [
      block([span("Free", ["strong"]), span(" concerts, "), span("always", ["em"]), span(".")]),
      block([span("Email "), span("us", ["k1"]), span(".")], { markDefs: [{ _key: "k1", _type: "link", href: "mailto:info@seoso.org" }] }),
      block([span("Strings")], { listItem: "bullet", level: 1 }),
      block([span("Winds")], { listItem: "bullet", level: 1 }),
      block([span("History")], { style: "h2" }),
    ];
    expect(portableTextToMarkdown(blocks)).toBe(
      "**Free** concerts, *always*.\n\nEmail [us](mailto:info@seoso.org).\n\n- Strings\n- Winds\n\n## History",
    );
  });
});

describe("links", () => {
  test("an internal page link keeps the page", () => {
    const l = { _type: "link", linkType: "internal", internal: { _ref: "MkzIlesDIMzd9qSpNEMIer" }, label: "Donate" };
    expect(transformLink(l, ctx)).toEqual({ label: "Donate", page: "donate" });
  });
  test("an internal event or post link becomes its path", () => {
    expect(transformLink({ linkType: "internal", internal: { _ref: "EV1" }, label: "Go" }, ctx)).toEqual({
      label: "Go",
      href: "/events/string-ensemble-2026-10-20",
    });
    expect(transformLink({ linkType: "internal", internal: { _ref: "PO1" }, label: "Read" }, ctx)).toEqual({
      label: "Read",
      href: "/news/march-23rd-concert",
    });
  });
  test("an external link or anchor stays as typed", () => {
    expect(transformLink({ linkType: "external", url: "#season", label: "See the season" }, ctx)).toEqual({
      label: "See the season",
      href: "#season",
    });
  });
});

describe("sections", () => {
  const heading = [block([span("2026–2027 "), span("Season", ["em"])])];
  test("eventsSection → eventsList", () => {
    const s = { _type: "eventsSection", heading, scope: "upcoming", limit: 5, anchorId: "season", note: [block([span("Free", ["strong"])])] };
    expect(transformSection(s, ctx)).toEqual({
      type: "eventsList",
      heading: "2026–2027 *Season*",
      scope: "upcoming",
      limit: 5,
      anchorId: "season",
      note: "**Free**",
    });
  });
  test("highlightBand keeps its figure image and buttons", () => {
    const s = {
      _type: "highlightBand",
      heading,
      figure: { _type: "image", alt: "Two shirts", asset: { _ref: "image-abc-1100x1100-png" } },
      actions: [{ linkType: "external", url: "https://www.bonfire.com/im-with-the-symphony/", label: "Buy now" }],
    };
    expect(transformSection(s, ctx)).toEqual({
      type: "highlightBand",
      heading: "2026–2027 *Season*",
      figure: { src: "../../assets/uploads/image-abc-1100x1100-png.jpg", alt: "Two shirts" },
      buttons: [{ label: "Buy now", href: "https://www.bonfire.com/im-with-the-symphony/" }],
    });
  });
  test.each([
    ["textSection", "richText"],
    ["contactSection", "contacts"],
    ["newsSection", "newsList"],
    ["videoSection", "video"],
    ["gallerySection", "gallery"],
    ["peopleSection", "people"],
  ])("%s → %s", (from, to) => {
    expect(transformSection({ _type: from, heading, body: [block([span("x")])] }, ctx).type).toBe(to);
  });
  test("venuesSection keeps its venues as slugs, in order", () => {
    const s = { _type: "venuesSection", heading, venues: [{ _ref: "VE1" }] };
    expect(transformSection(s, ctx)).toMatchObject({ type: "venues", venues: ["john-mcintire-library"] });
  });
});

test("slugify", () => {
  expect(slugify("Venues & Directions — Zanesville’s Library")).toBe("venues-directions-zanesvilles-library");
});
