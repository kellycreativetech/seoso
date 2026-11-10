import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test, vi } from "vitest";

// The content store isn't loaded in unit tests; give the preview page the settings it reads.
vi.mock("astro:content", () => {
  const entries: Record<string, { data: unknown }> = {
    "site/site": { data: { title: "SEOSO", homePage: "home", social: [], logo: null } },
    "navigation/navigation": { data: { items: [] } },
    "footer/footer": { data: { links: [], note: null } },
  };
  return {
    getEntry: async (collection: string, id: string) => entries[`${collection}/${id}`],
    getCollection: async () => [],
  };
});
import { parsePreview } from "../../src/lib/preview";
import PreviewPage from "../../src/pages/api/preview.astro";

describe("parsePreview", () => {
  test("keeps valid blocks with their original positions and counts the rest", () => {
    const result = parsePreview("pages", {
      title: "T",
      sections: [{ type: "hero", heading: "Hi" }, { type: "textMedia", mediaSide: "left" }, { type: "richText", body: "x" }],
    });
    expect(result.kind).toBe("sections");
    if (result.kind !== "sections") return;
    expect(result.sections.map((s) => s.type)).toEqual(["hero", "richText"]);
    expect(result.sourceIndexes).toEqual([0, 2]);
    expect(result.invalid).toBe(1);
  });
  test("an unknown collection is rejected", () => {
    expect(parsePreview("nope", {}).kind).toBe("error");
  });
  test("an event needs a title and a start date", () => {
    expect(parsePreview("events", { title: "Concert", start: "2026-12-09T00:00:00Z" }).kind).toBe("event");
    expect(parsePreview("events", { title: "Concert" }).kind).toBe("error");
  });
});

async function post(body: unknown, origin = "http://localhost:4321") {
  const container = await AstroContainer.create();
  const request = new Request("http://localhost:4321/api/preview", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return container.renderToResponse(PreviewPage, { request });
}

describe("/api/preview", () => {
  test("renders a page with escaped headings and key paths", async () => {
    const res = await post({ collection: "pages", data: { title: "T", sections: [{ type: "hero", heading: "Hi <b>" }] } });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Hi &lt;b&gt;");
    expect(html).toContain('data-key-path="sections.0"');
  });
  test("a half-filled block shows a notice instead of a blank pane", async () => {
    const html = await (
      await post({ collection: "pages", data: { title: "T", sections: [{ type: "hero", heading: "Hi" }, { type: "textMedia" }] } })
    ).text();
    expect(html).toContain("1 block couldn’t be previewed");
    expect(html).toContain("Hi");
  });
  test("unsaved uploads (blob: URLs) are shown as-is", async () => {
    const html = await (
      await post({ collection: "pages", data: { title: "T", sections: [{ type: "hero", heading: "Hi", image: { src: "blob:https://x/123", alt: "" } }] } })
    ).text();
    expect(html).toContain('src="blob:https://x/123"');
  });
  test("other sites can't use the preview", async () => {
    expect((await post({ collection: "pages", data: {} }, "https://evil.example")).status).toBe(403);
  });
  test("bad requests are rejected", async () => {
    expect((await post({ collection: "nope", data: {} })).status).toBe(400);
    expect((await post("{not json")).status).toBe(400);
  });
});
