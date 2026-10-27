// Rebuilds the site only when a concert is due to fall off the "upcoming" list.
// Runs once a day just after midnight Eastern (two UTC crons cover daylight-saving time; the later run finds
// the site already rebuilt and does nothing). One small fetch per run, at most one deploy-hook call.
import { type Feed, shouldBuild } from "./should-build";

interface Env {
  SITE_URL: string; // e.g. https://seoso.<subdomain>.workers.dev (variable)
  DEPLOY_HOOK_URL: string; // Workers Builds deploy hook for the site (secret)
}

export default {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const res = await fetch(new URL("/events.json", env.SITE_URL), { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.log(`events.json returned ${res.status}; skipping`);
      return;
    }
    const feed = (await res.json()) as Feed;
    if (!shouldBuild(feed, new Date())) {
      console.log(`No rebuild needed (built ${feed.builtAt}, next rollover ${feed.nextRollover ?? "none"})`);
      return;
    }
    const hook = await fetch(env.DEPLOY_HOOK_URL, { method: "POST" });
    console.log(`Rebuild requested for rollover ${feed.nextRollover}: deploy hook returned ${hook.status}`);
  },
} satisfies ExportedHandler<Env>;
