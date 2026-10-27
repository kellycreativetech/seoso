import type { APIRoute } from "astro";
import { loadEvents } from "../lib/event-data";
import { buildEventsFeed } from "../lib/feeds";

// Read once a day by the rollover Worker (workers/rollover) to decide whether to rebuild.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(buildEventsFeed(await loadEvents(), new Date())), {
    headers: { "Content-Type": "application/json" },
  });
