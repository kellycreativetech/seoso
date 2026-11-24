import { describe, expect, test } from "vitest";
import { renderInline } from "../src/lib/inline";
import { previewSectionSchema } from "../src/lib/sections";
import { isPreviewBuild, siteUrl } from "../site-url.mjs";

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
  const parsed = previewSectionSchema.parse({ type: "hero", heading: "Hi", image: { src: "/src/assets/uploads/a.jpg", alt: "" } });
  expect(parsed.type === "hero" && parsed.image?.src).toBe("../../assets/uploads/a.jpg");
});

test("**bold** in a heading reads as plain text, not broken italics", () => {
  expect(renderInline("**Free** concerts for *all*")).toBe("Free concerts for <em>all</em>");
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

describe("preview builds (Cloudflare branch previews) are kept out of search", () => {
  test("local builds are not previews", () => expect(isPreviewBuild({})).toBe(false));
  test("the production branch is not a preview", () => expect(isPreviewBuild({ WORKERS_CI_BRANCH: "main" })).toBe(false));
  test("any other branch is a preview", () => expect(isPreviewBuild({ WORKERS_CI_BRANCH: "feature-x" })).toBe(true));
});
