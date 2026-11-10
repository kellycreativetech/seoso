import { describe, expect, test } from "vitest";
import { buildEventsFeed, buildIcs } from "../../src/lib/feeds";

const now = new Date("2026-10-22T00:00:00Z");
const past = { slug: "string-ensemble-2026-10-20", title: "String ensemble", start: new Date("2026-10-20T23:00:00Z") };
const soon = { slug: "veterans-day-ceremony-2026-11-11", title: "Veteran’s Day Ceremony", start: new Date("2026-11-11T15:15:00Z") };

describe("events.json", () => {
  test("records when the next concert falls off and when the site was built", () => {
    const feed = buildEventsFeed([past, soon], now);
    expect(feed.builtAt).toBe("2026-10-22T00:00:00.000Z");
    expect(feed.nextRollover).toBe("2026-11-12T05:00:00.000Z");
    expect(feed.events).toEqual([
      { slug: past.slug, title: past.title, start: "2026-10-20T23:00:00.000Z", end: null },
      { slug: soon.slug, title: soon.title, start: "2026-11-11T15:15:00.000Z", end: null },
    ]);
  });
  test("no upcoming concerts → no rollover", () => {
    expect(buildEventsFeed([past], now).nextRollover).toBeNull();
  });
});

describe("events.ics", () => {
  const ics = buildIcs(
    [
      { ...soon, venue: { name: "John and Annie Glenn Museum", city: "New Concord", address: "72 W Main St\nNew Concord, OH 43762" } },
      { slug: "home-for-the-holidays-2026-12-08", title: "Home for the Holidays, with friends", start: new Date("2026-12-09T00:00:00Z"), end: new Date("2026-12-09T02:00:00Z") },
    ],
    "https://seoso.example.workers.dev",
  );
  const unfolded = ics.replace(/\r\n /g, ""); // long lines are folded per RFC 5545
  test("long lines are folded to 75 octets", () => {
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
  test("one VEVENT per concert, CRLF line endings", () => {
    expect(ics.match(/BEGIN:VEVENT\r\n/g)).toHaveLength(2);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.split("\r\n").every((line) => !line.includes("\n"))).toBe(true);
  });
  test("calendar name, stable UIDs, UTC times, links", () => {
    expect(unfolded).toContain("PRODID:-//SEOSO//Season//EN");
    expect(unfolded).toContain("X-WR-CALNAME:SEOSO Concerts");
    expect(unfolded).toContain("UID:veterans-day-ceremony-2026-11-11@seoso");
    expect(unfolded).toContain("DTSTART:20261111T151500Z");
    expect(unfolded).toContain("DTEND:20261111T171500Z"); // no end → two hours
    expect(unfolded).toContain("DTEND:20261209T020000Z");
    expect(unfolded).toContain("URL:https://seoso.example.workers.dev/events/veterans-day-ceremony-2026-11-11");
  });
  test("commas and newlines are escaped", () => {
    expect(unfolded).toContain("SUMMARY:Home for the Holidays\\, with friends");
    expect(unfolded).toContain("LOCATION:John and Annie Glenn Museum\\, 72 W Main St\\nNew Concord\\, OH 43762");
  });
});
