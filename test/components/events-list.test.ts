import { expect, test, vi } from "vitest";
import EventsList from "../../src/components/sections/EventsList.astro";
import { render } from "../helpers";

vi.mock("astro:content", () => ({ getCollection: async () => [], getEntry: async () => undefined }));

test("upcoming lists offer the calendar as a subscription and as a download", async () => {
  const html = await render(EventsList, { section: { type: "eventsList", scope: "upcoming" }, index: 0 });
  expect(html).toMatch(/href="webcal:\/\/[^"]+\/events\.ics"/);
  expect(html).toMatch(/href="https?:\/\/[^"]+\/events\.ics"[^>]*download/);
});
