// "Now" for deciding upcoming vs. past. Prerendered pages and /events.json share one timestamp per build, so a
// build that straddles midnight can't list a concert as upcoming while events.json says it already fell off.
// On-demand renders (the CMS preview) use the request time.
//
// The build time is read lazily, on the first render: Astro prerenders inside Cloudflare's runtime, which
// reports 1970 for code that runs when a module loads.
let buildTime: Date | undefined;

export function buildNow(isPrerendered: boolean): Date {
  if (!isPrerendered) return new Date();
  buildTime ??= new Date();
  return buildTime;
}
