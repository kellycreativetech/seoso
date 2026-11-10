import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import BaseLayout from "../src/layouts/BaseLayout.astro";

test("BaseLayout renders the document shell with title and slot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "SEOSO" },
    slots: { default: "<p>hi</p>" },
  });
  expect(html).toContain("<title>SEOSO</title>");
  expect(html).toContain('lang="en"');
  expect(html).toContain("<p>hi</p>");
});
