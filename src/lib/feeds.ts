import { nextRollover } from "./events";

type FeedEvent = { slug: string; title: string; start: Date; end?: Date | null };

/** /events.json — read by the rollover Worker. Kept small: no bodies or images. */
export function buildEventsFeed(events: FeedEvent[], now: Date) {
  const next = nextRollover(events, now);
  return {
    builtAt: now.toISOString(),
    nextRollover: next ? next.toISOString() : null,
    events: events.map(({ slug, title, start, end }) => ({
      slug,
      title,
      start: start.toISOString(),
      end: end ? end.toISOString() : null,
    })),
  };
}

type IcsEvent = FeedEvent & { summary?: string | null; venue?: { name: string; city: string; address?: string | null } | null };

const TWO_HOURS = 2 * 60 * 60 * 1000;
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// RFC 5545: lines longer than 75 octets continue on the next line, which starts with a space.
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    if (bytes.encode(current + ch).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
    }
    current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** /events.ics — the season as a calendar people can subscribe to. */
export function buildIcs(events: IcsEvent[], siteUrl: string, now = new Date()): string {
  const base = siteUrl.replace(/\/$/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SEOSO//Season//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SEOSO Concerts",
    "X-WR-TIMEZONE:America/New_York",
  ];
  for (const e of events) {
    const end = e.end ?? new Date(e.start.getTime() + TWO_HOURS);
    const location = e.venue ? [e.venue.name, e.venue.address ?? e.venue.city].join(", ") : null;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.slug}@seoso`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(e.title)}`,
      ...(e.summary ? [`DESCRIPTION:${escape(e.summary)}`] : []),
      ...(location ? [`LOCATION:${escape(location)}`] : []),
      `URL:${base}/events/${e.slug}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
