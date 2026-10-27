import { getCollection } from "astro:content";

// All events with their venue, for lists and feeds.
export async function loadEvents() {
  const [events, venues] = await Promise.all([getCollection("events"), getCollection("venues")]);
  const venueBySlug = new Map(venues.map((v) => [v.id, v.data]));
  return events.map((e) => ({
    slug: e.id,
    ...e.data,
    venue: e.data.venue ? (venueBySlug.get(e.data.venue) ?? null) : null,
  }));
}
