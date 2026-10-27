import type { APIRoute } from "astro";
import { loadEvents } from "../lib/event-data";
import { buildIcs } from "../lib/feeds";

// The season as a subscribable calendar (webcal://…/events.ics).
export const GET: APIRoute = async ({ site }) =>
  new Response(buildIcs(await loadEvents(), (site ?? new URL("http://localhost:4321")).href), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
