import type { APIRoute } from "astro";
import { loadEvents } from "../lib/event-data";
import { buildEventsFeed } from "../lib/feeds";
import { buildNow } from "../lib/now";

// Read once a day by the rollover Worker (workers/rollover) to decide whether to rebuild.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(buildEventsFeed(await loadEvents(), buildNow(true))), {
    headers: { "Content-Type": "application/json" },
  });
