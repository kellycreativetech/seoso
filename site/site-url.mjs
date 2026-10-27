// The site's public URL, used for calendar links, the .ics feed and sharing images.
// Cloudflare builds must set SITE_URL (Workers Builds → Settings → Build variables); otherwise those links
// would point at localhost.
export function siteUrl(env) {
  if (env.SITE_URL) return env.SITE_URL;
  if (env.WORKERS_CI || env.CI) throw new Error("Set the SITE_URL build variable (e.g. https://seoso.<subdomain>.workers.dev).");
  return "http://localhost:4321";
}
