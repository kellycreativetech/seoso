export type Feed = { builtAt: string; nextRollover: string | null };

/**
 * True when a concert has fallen off the "upcoming" list since the site was last built: the rollover time has
 * passed and the current build is older than it. The site computes nextRollover (site/src/lib/events.ts).
 */
export function shouldBuild(feed: Feed, now: Date): boolean {
  if (!feed.nextRollover) return false;
  const rollover = Date.parse(feed.nextRollover);
  const builtAt = Date.parse(feed.builtAt);
  if (Number.isNaN(rollover) || Number.isNaN(builtAt)) return false;
  return now.getTime() >= rollover && builtAt < rollover;
}
