import { describe, expect, test } from "vitest";
import PageBuilder from "../../src/components/PageBuilder.astro";
import type { Section } from "../../src/lib/sections";
import { render, sectionWrappers } from "../helpers";

const text = (body: string): Section => ({ type: "richText", body });
const isStage = (wrapper: string) => wrapper.includes('data-theme="seoso-dark"');

describe("PageBuilder tones", () => {
  test("home page rotation: first two black, then alternating", async () => {
    const html = await render(PageBuilder, { sections: ["a", "b", "c", "d", "e"].map(text), rotateTones: true });
    expect(sectionWrappers(html).map(isStage)).toEqual([true, true, false, true, false]);
  });
  test("default: masthead and highlight bands are black", async () => {
    const sections: Section[] = [{ type: "hero", heading: "Hi", buttons: [] }, text("x"), { type: "highlightBand", heading: "Band", buttons: [] }];
    const html = await render(PageBuilder, { sections });
    expect(sectionWrappers(html).map(isStage)).toEqual([true, false, true]);
  });
  test("preview mode tags each section with its key path", async () => {
    const html = await render(PageBuilder, { sections: [text("a"), text("b")], preview: true });
    expect(html).toContain('data-key-path="sections.0"');
    expect(html).toContain('data-key-path="sections.1"');
  });
  test("outside preview there are no key paths", async () => {
    const html = await render(PageBuilder, { sections: [text("a")] });
    expect(html).not.toContain("data-key-path");
  });
  test("a snippet expands in place and keeps its block's key path", async () => {
    const snippets = new Map<string, Section[]>([["appeal", [text("one"), text("two")]]]);
    const html = await render(PageBuilder, { sections: [{ type: "snippet", snippet: "appeal" }, text("after")], snippets, preview: true });
    expect(sectionWrappers(html)).toHaveLength(3);
    expect(html.match(/data-key-path="sections.0"/g)).toHaveLength(2);
  });
});
