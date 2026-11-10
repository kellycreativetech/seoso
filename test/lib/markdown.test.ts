import { expect, test } from "vitest";
import { renderMarkdown, renderMarkdownInline } from "../../src/lib/markdown";

test("paragraphs, emphasis, links and lists", () => {
  const html = renderMarkdown("**Free** concerts.\n\n- Strings\n- [Winds](https://example.org)");
  expect(html).toContain("<p><strong>Free</strong> concerts.</p>");
  expect(html).toContain("<li>Strings</li>");
  expect(html).toContain('<a href="https://example.org">Winds</a>');
});
test("raw HTML in Markdown is escaped", () => {
  expect(renderMarkdown("Hi <script>alert(1)</script>")).not.toContain("<script>");
  expect(renderMarkdownInline("<img src=x onerror=alert(1)>")).not.toContain("<img");
});
test("inline Markdown has no paragraph wrapper", () => {
  expect(renderMarkdownInline("**Every concert is free.** Five")).toBe("<strong>Every concert is free.</strong> Five");
});
