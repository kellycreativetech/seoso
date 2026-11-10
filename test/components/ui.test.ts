import { expect, test } from "vitest";
import ButtonLink from "../../src/components/ui/ButtonLink.astro";
import Heading from "../../src/components/ui/Heading.astro";
import { render } from "../helpers";

test("external buttons open safely", async () => {
  const html = await render(ButtonLink, { link: { label: "Buy now", href: "https://www.bonfire.com/im-with-the-symphony/" }, variant: "brand" });
  expect(html).toContain('href="https://www.bonfire.com/im-with-the-symphony/"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain("Buy now");
});
test("a page button links to the page path", async () => {
  const html = await render(ButtonLink, { link: { label: "Donate", page: "donate" }, variant: "brand" });
  expect(html).toContain('href="/donate"');
  expect(html).not.toContain("noopener");
});
test("a button with no destination renders nothing", async () => {
  expect((await render(ButtonLink, { link: { label: "x" }, variant: "brand" })).trim()).toBe("");
});
test("Heading renders inline Markdown safely", async () => {
  expect(await render(Heading, { text: "Celebrate *Your* <Symphony>" })).toBe("Celebrate <em>Your</em> &lt;Symphony&gt;");
});
