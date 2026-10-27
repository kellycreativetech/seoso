import { expect, test } from "vitest";
import { shouldBuild } from "../src/should-build";

const feed = { builtAt: "2026-11-11T20:00:00Z", nextRollover: "2026-11-12T05:00:00Z" };

test("rebuilds once a concert is due to fall off", () => {
  expect(shouldBuild(feed, new Date("2026-11-12T05:10:00Z"))).toBe(true);
});
test("waits until the concert's day is over", () => {
  expect(shouldBuild(feed, new Date("2026-11-12T04:10:00Z"))).toBe(false);
});
test("does nothing if the site was already rebuilt after the rollover", () => {
  expect(shouldBuild({ ...feed, builtAt: "2026-11-12T05:11:00Z" }, new Date("2026-11-12T05:12:00Z"))).toBe(false);
});
test("does nothing when no concerts are upcoming", () => {
  expect(shouldBuild({ ...feed, nextRollover: null }, new Date("2026-11-12T05:10:00Z"))).toBe(false);
});
test("ignores a malformed feed", () => {
  expect(shouldBuild({ builtAt: "nope", nextRollover: "also nope" }, new Date())).toBe(false);
});
