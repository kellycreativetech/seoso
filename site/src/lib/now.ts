// "Now" for deciding upcoming vs. past. Prerendered pages and /events.json share one timestamp per build, so a
// build that straddles midnight can't list a concert as upcoming while events.json says it already fell off.
// On-demand renders (the CMS preview) use the request time.
const BUILD_TIME = new Date();

export function buildNow(isPrerendered: boolean): Date {
  return isPrerendered ? BUILD_TIME : new Date();
}
