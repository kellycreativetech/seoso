import { describe, expect, test } from "vitest";
import { isPast, nextRollover, pastAt } from "../../src/lib/events";

describe("pastAt: midnight Eastern after the event's day", () => {
  test("evening event", () => {
    expect(pastAt({ start: new Date("2026-10-20T23:00:00Z") }).toISOString()).toBe("2026-10-21T04:00:00.000Z");
  });
  test("the day daylight saving time ends", () => {
    expect(pastAt({ start: new Date("2026-11-01T18:00:00Z") }).toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });
  test("the day before daylight saving time starts", () => {
    expect(pastAt({ start: new Date("2027-03-13T23:00:00Z") }).toISOString()).toBe("2027-03-14T05:00:00.000Z");
  });
  test("late event whose UTC date is already the next day", () => {
    expect(pastAt({ start: new Date("2026-12-09T03:30:00Z") }).toISOString()).toBe("2026-12-09T05:00:00.000Z");
  });
  test("an end on a later day wins over the start", () => {
    const e = { start: new Date("2026-12-09T03:00:00Z"), end: new Date("2026-12-09T06:00:00Z") };
    expect(pastAt(e).toISOString()).toBe("2026-12-10T05:00:00.000Z");
  });
});

describe("isPast", () => {
  const e = { start: new Date("2026-10-20T23:00:00Z") };
  test("still upcoming one millisecond before midnight", () => {
    expect(isPast(e, new Date("2026-10-21T03:59:59.999Z"))).toBe(false);
  });
  test("past at midnight", () => {
    expect(isPast(e, new Date("2026-10-21T04:00:00Z"))).toBe(true);
  });
});

describe("nextRollover", () => {
  const past = { start: new Date("2026-10-20T23:00:00Z") };
  test("earliest upcoming event's fall-off time", () => {
    const next = nextRollover([past, { start: new Date("2026-11-11T15:15:00Z") }], new Date("2026-10-22T00:00:00Z"));
    expect(next?.toISOString()).toBe("2026-11-12T05:00:00.000Z");
  });
  test("null when nothing is upcoming", () => {
    expect(nextRollover([past], new Date("2026-10-22T00:00:00Z"))).toBeNull();
  });
});

import { selectEvents } from "../../src/lib/events";

describe("selectEvents", () => {
  const now = new Date("2026-10-22T00:00:00Z");
  const events = [
    { slug: "past", start: new Date("2026-10-20T23:00:00Z") },
    { slug: "later", start: new Date("2027-03-20T18:30:00Z") },
    { slug: "soon", start: new Date("2026-11-11T15:15:00Z") },
  ];
  test("upcoming: soonest first, past ones dropped", () => {
    expect(selectEvents(events, "upcoming", now).map((e) => e.slug)).toEqual(["soon", "later"]);
  });
  test("past: most recent first", () => {
    expect(selectEvents(events, "past", now).map((e) => e.slug)).toEqual(["past"]);
  });
  test("limit", () => {
    expect(selectEvents(events, "upcoming", now, 1).map((e) => e.slug)).toEqual(["soon"]);
  });
});
