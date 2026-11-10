import { getCollection, getEntry } from "astro:content";
import type { Section } from "./sections";

// Site-wide settings edited under "Site settings" in the CMS.
export async function loadSite() {
  const [site, navigation, footer] = await Promise.all([
    getEntry("site", "site"),
    getEntry("navigation", "navigation"),
    getEntry("footer", "footer"),
  ]);
  if (!site) throw new Error("Missing src/content/settings/site.json");
  return { site: site.data, navigation: navigation?.data.items ?? [], footer: footer?.data ?? { links: [], note: null } };
}

export type SiteData = Awaited<ReturnType<typeof loadSite>>;

export async function loadSnippets(): Promise<Map<string, Section[]>> {
  const entries = await getCollection("snippets");
  return new Map(entries.map((entry) => [entry.id, entry.data.sections as Section[]]));
}
