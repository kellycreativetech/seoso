import { expect, test, vi } from "vitest";
import EventDetail from "../../src/components/detail/EventDetail.astro";
import EventList from "../../src/components/sections/EventList.astro";
import EventsList from "../../src/components/sections/EventsList.astro";
import { pastAt } from "../../src/lib/events";
import { render } from "../helpers";

vi.mock("astro:content", () => ({ getCollection: async () => [], getEntry: async () => undefined }));

test("upcoming lists offer the calendar as a subscription and as a download", async () => {
  const html = await render(EventsList, { section: { type: "eventsList", scope: "upcoming" }, index: 0 });
  expect(html).toMatch(/href="webcal:\/\/[^"]+\/events\.ics"/);
  expect(html).toMatch(/href="https?:\/\/[^"]+\/events\.ics"[^>]*download/);
});

// Far-future dates so the render-time "now" never makes them past.
const future = [1, 2, 3, 4].map((month) => ({
  slug: `concert-${month}`,
  title: `Concert ${month}`,
  start: new Date(Date.UTC(2099, month, 10, 23)),
}));

test("each event row carries the instant it drops off, for the browser to compare with its clock", async () => {
  const html = await render(EventList, { events: future, upcoming: true });
  for (const event of future) expect(html).toContain(`data-past-at="${pastAt(event).toISOString()}"`);
});

test("every upcoming event is in the HTML; rows beyond the limit start hidden", async () => {
  const html = await render(EventList, { events: future, upcoming: true, limit: 3 });
  const rows = [...html.matchAll(/<li[^>]*data-past-at[^>]*>/g)].map((m) => m[0]);
  expect(rows).toHaveLength(4);
  expect(rows.map((row) => /\shidden(\s|>|=)/.test(row))).toEqual([false, false, false, true]);
  expect(html).toMatch(/<ol[^>]*data-rollover[^>]*data-limit="3"/);
});

test("an event page hides its ticket button in the browser once the event has passed", async () => {
  const event = { ...future[0], tickets: "https://example.com/tickets" };
  const html = await render(EventDetail, { event });
  expect(html).toMatch(new RegExp(`data-show-until="${pastAt(event).toISOString()}"[^>]*>[\\s\\S]*Get tickets`));
});

test("past lists don't take part in the rollover", async () => {
  const html = await render(EventList, { events: future });
  expect(html).not.toContain("data-rollover");
  expect(html).not.toContain("data-past-at");
});
