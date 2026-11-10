import { describe, expect, test } from "vitest";
import { rolloverVisibility, type RolloverItem } from "../../src/lib/rollover";

const at = (iso: string) => new Date(iso).getTime();
const year: RolloverItem = { kind: "year" };
const event = (pastAt: string): RolloverItem => ({ kind: "event", pastAt: at(pastAt) });

describe("rolloverVisibility", () => {
  const items = [year, event("2026-11-12T05:00:00Z"), event("2026-12-10T05:00:00Z"), year, event("2027-03-21T04:00:00Z"), event("2027-04-21T04:00:00Z")];

  test("before anything has passed, every event shows", () => {
    expect(rolloverVisibility(items, at("2026-11-01T00:00:00Z")).visible).toEqual([true, true, true, true, true, true]);
  });

  test("an event is hidden from its drop-off instant (midnight Eastern), not a millisecond earlier", () => {
    expect(rolloverVisibility(items, at("2026-11-12T04:59:59.999Z")).visible[1]).toBe(true);
    expect(rolloverVisibility(items, at("2026-11-12T05:00:00Z")).visible[1]).toBe(false);
  });

  test("the limit is reapplied: when one passes, the next one appears", () => {
    expect(rolloverVisibility(items, at("2026-11-01T00:00:00Z"), 2).visible).toEqual([true, true, true, false, false, false]);
    expect(rolloverVisibility(items, at("2026-11-13T00:00:00Z"), 2).visible).toEqual([true, false, true, true, true, false]);
  });

  test("a year heading with no visible events under it is hidden", () => {
    expect(rolloverVisibility(items, at("2026-12-11T00:00:00Z")).visible).toEqual([false, false, false, true, true, true]);
  });

  test("empty once every event has passed", () => {
    const result = rolloverVisibility(items, at("2027-05-01T00:00:00Z"));
    expect(result.visible).toEqual([false, false, false, false, false, false]);
    expect(result.empty).toBe(true);
  });

  test("not empty while any event shows", () => {
    expect(rolloverVisibility(items, at("2027-04-01T00:00:00Z")).empty).toBe(false);
  });
});
