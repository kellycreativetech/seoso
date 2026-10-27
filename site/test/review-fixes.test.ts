import { describe, expect, test, vi } from "vitest";
import { renderInline } from "../src/lib/inline";
import { buildNow } from "../src/lib/now";
import { previewSectionSchema } from "../src/lib/sections";
import { siteUrl } from "../site-url.mjs";

describe("blank text the CMS saves is treated as empty", () => {
  test('anchorId "" and heading "" become null', () => {
    const parsed = previewSectionSchema.parse({ type: "richText", body: "x", anchorId: "", heading: "", eyebrow: "" });
    expect(parsed.type === "richText" && [parsed.anchorId, parsed.heading, parsed.eyebrow]).toEqual([null, null, null]);
  });
  test("a blank news footer link is no link", () => {
    const parsed = previewSectionSchema.parse({ type: "newsList", limit: 1, footerLink: { label: "", page: "", href: "" } });
    expect(parsed.type === "newsList" && parsed.footerLink).toBeFalsy();
  });
});

describe("a half-filled Text + Media block doesn't break the build", () => {
  test("image chosen but none uploaded → no media", () => {
    const parsed = previewSectionSchema.safeParse({ type: "textMedia", body: "x", media: { kind: "image" } });
    expect(parsed.success && parsed.data.type === "textMedia" && parsed.data.media).toBeFalsy();
  });
  test("video chosen but no ID → no media", () => {
    const parsed = previewSectionSchema.safeParse({ type: "textMedia", body: "x", media: { kind: "video", youtubeId: "", title: "" } });
    expect(parsed.success && parsed.data.type === "textMedia" && parsed.data.media).toBeFalsy();
  });
});

test("an image picked from the media library (absolute path) is stored relative", () => {
  const parsed = previewSectionSchema.parse({ type: "hero", heading: "Hi", image: { src: "/site/src/assets/uploads/a.jpg", alt: "" } });
  expect(parsed.type === "hero" && parsed.image?.src).toBe("../../assets/uploads/a.jpg");
});

test("**bold** in a heading reads as plain text, not broken italics", () => {
  expect(renderInline("**Free** concerts for *all*")).toBe("Free concerts for <em>all</em>");
});

test("one build uses one 'now'; on-demand renders use the request time", () => {
  expect(buildNow(true)).toBe(buildNow(true));
  expect(buildNow(false)).not.toBe(buildNow(true));
});

describe("SITE_URL", () => {
  test("used when set", () => {
    expect(siteUrl({ SITE_URL: "https://seoso.example.workers.dev" })).toBe("https://seoso.example.workers.dev");
  });
  test("missing on a Cloudflare build fails loudly", () => {
    expect(() => siteUrl({ WORKERS_CI: "1" })).toThrow(/SITE_URL/);
  });
  test("local development falls back to localhost", () => {
    expect(siteUrl({})).toBe("http://localhost:4321");
  });
});

test("the build time is read when the first page renders, not when the module loads", async () => {
  // Cloudflare's runtime (where Astro prerenders) reports 1970 for code that runs at module load.
  vi.useFakeTimers();
  vi.setSystemTime(new Date("1970-01-01T00:00:00Z"));
  vi.resetModules();
  const { buildNow: freshBuildNow } = await import("../src/lib/now");
  vi.setSystemTime(new Date("2026-10-27T05:00:00Z"));
  expect(freshBuildNow(true).toISOString()).toBe("2026-10-27T05:00:00.000Z");
  vi.useRealTimers();
});
