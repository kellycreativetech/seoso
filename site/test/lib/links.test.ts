import { expect, test } from "vitest";
import { isExternal, resolveHref } from "../../src/lib/links";

test("the home page resolves to /", () => {
  expect(resolveHref({ label: "Home", page: "home" })).toBe("/");
});
test("a chosen page wins over a typed href", () => {
  expect(resolveHref({ label: "About", page: "about", href: "/x" })).toBe("/about");
});
test("external URLs pass through", () => {
  const url = "https://www.bonfire.com/im-with-the-symphony/";
  expect(resolveHref({ label: "Shop", href: url })).toBe(url);
  expect(isExternal(url)).toBe(true);
  expect(isExternal("/events")).toBe(false);
});
test("a link with neither page nor href resolves to null", () => {
  expect(resolveHref({ label: "Nothing" })).toBeNull();
});
