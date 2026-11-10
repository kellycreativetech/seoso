// The one rule for when a concert leaves the "upcoming" list: from midnight Eastern on the day after it ends
// (its start, if it has no end). The build, /events.json and the rollover Worker all depend on this.
const TZ = "America/New_York";

export type EventTimes = { start: Date; end?: Date | null };

const etDate = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const etHour = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" });

export function pastAt({ start, end }: EventTimes): Date {
  const [y, m, d] = etDate.format(end ?? start).split("-").map(Number);
  // Midnight Eastern is 04:00 UTC during daylight saving time and 05:00 UTC otherwise.
  const edt = new Date(Date.UTC(y, m - 1, d + 1, 4));
  return Number(etHour.format(edt)) === 0 ? edt : new Date(Date.UTC(y, m - 1, d + 1, 5));
}

export function isPast(event: EventTimes, now: Date): boolean {
  return now.getTime() >= pastAt(event).getTime();
}

export function nextRollover(events: EventTimes[], now: Date): Date | null {
  const upcoming = events.filter((e) => !isPast(e, now)).map((e) => pastAt(e).getTime());
  return upcoming.length ? new Date(Math.min(...upcoming)) : null;
}

/** Events for a list: upcoming soonest-first, or past most-recent-first, optionally limited. */
export function selectEvents<E extends EventTimes>(events: E[], scope: "upcoming" | "past", now: Date, limit?: number | null): E[] {
  const past = scope === "past";
  const list = events
    .filter((e) => isPast(e, now) === past)
    .sort((a, b) => (past ? b.start.getTime() - a.start.getTime() : a.start.getTime() - b.start.getTime()));
  return limit ? list.slice(0, limit) : list;
}
