import { expect, test } from "vitest";
import { renderInline } from "../../src/lib/inline";

test("italic and strikethrough", () => {
  expect(renderInline("I’m with the ~~band~~ *Symphony*")).toBe("I’m with the <s>band</s> <em>Symphony</em>");
});
test("HTML is escaped, never injected", () => {
  expect(renderInline(`<b>"A" & 'B'</b>`)).toBe("&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;");
});
test("a lone asterisk stays literal", () => {
  expect(renderInline("5 * 3 = 15")).toBe("5 * 3 = 15");
});
