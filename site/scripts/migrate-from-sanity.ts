// One-time import of the PUBLISHED Sanity content into src/content and src/assets/uploads.
// Sanity is frozen after this runs; it refuses to overwrite existing content unless run with --force.
//   npm run migrate            first import
//   npm run migrate -- --force re-import during development (discards CMS edits!)
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import {
  type Ctx,
  type DocRef,
  portableTextToMarkdown,
  slugify,
  transformImage,
  transformLink,
  transformSection,
} from "./sanity-transform.ts";

type Any = Record<string, any>;
const API = "https://cerintdw.apicdn.sanity.io/v2025-02-19/data/query/production";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "src/content");
const UPLOADS = join(ROOT, "src/assets/uploads");
const force = process.argv.includes("--force");

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(`${API}?query=${encodeURIComponent(groq)}&perspective=published`);
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result as T;
}

const existing = ["pages", "events", "news", "venues", "snippets", "settings"].flatMap((dir) =>
  readdirSync(join(CONTENT, dir)).filter((f) => f !== ".gitkeep"),
);
if (existing.length && !force) {
  console.error(`Refusing to overwrite ${existing.length} existing content files. Re-run with --force to replace them.`);
  process.exit(1);
}

const docs = await query<Any[]>(`*[_type in ["page","event","post","venue","settings"] && !(_id in path("drafts.**"))]`);
const assets = await query<Any[]>(`*[_type == "sanity.imageAsset"]{_id, url, originalFilename, extension}`);
const byType = (t: string) => docs.filter((d) => d._type === t);

const refs = new Map<string, DocRef>();
for (const p of byType("page")) refs.set(p._id, { type: "page", slug: p.slug.current });
for (const e of byType("event")) refs.set(e._id, { type: "event", slug: e.slug.current });
for (const p of byType("post")) refs.set(p._id, { type: "post", slug: p.slug.current });
for (const v of byType("venue")) refs.set(v._id, { type: "venue", slug: slugify(v.name) });

// image-<hash>-WxH-ext → <original-name>-<hash8>.<ext>
const assetById = new Map(assets.map((a) => [a._id, a]));
const fileFor = (ref: string) => {
  const a = assetById.get(ref);
  if (!a) throw new Error(`Missing image asset ${ref}`);
  const hash = ref.split("-")[1].slice(0, 8);
  const base = slugify((a.originalFilename ?? "image").replace(/\.[^.]+$/, "")) || "image";
  return `${base}-${hash}.${a.extension}`;
};
const used = new Set<string>();
const ctx: Ctx = {
  docs: refs,
  imagePath(ref) {
    used.add(ref);
    return `../../assets/uploads/${fileFor(ref)}`;
  },
};

const compact = (o: Any) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));
const seo = (s: Any | undefined) =>
  s && compact({ title: s.title, description: s.description, image: transformImage(s.image, ctx)?.src, noIndex: s.noIndex || undefined });

function writeMd(dir: string, slug: string, data: Any, body = "") {
  const file = join(CONTENT, dir, `${slug}.md`);
  writeFileSync(file, `---\n${stringify(compact(data), { lineWidth: 0 })}---\n${body ? `\n${body}\n` : ""}`);
}
const writeJson = (name: string, data: Any) => writeFileSync(join(CONTENT, "settings", `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);

for (const p of byType("page")) {
  writeMd("pages", p.slug.current, { title: p.title, seo: seo(p.seo), sections: (p.content ?? []).map((s: Any) => transformSection(s, ctx)) });
}
for (const e of byType("event")) {
  writeMd(
    "events",
    e.slug.current,
    {
      title: e.title,
      isNamedProgram: e.isNamedProgram || undefined,
      start: e.start,
      end: e.end,
      venue: e.venue && refs.get(e.venue._ref)?.slug,
      summary: e.summary,
      admission: e.admission,
      tickets: e.ticketUrl,
      image: transformImage(e.image, ctx),
      seo: seo(e.seo),
    },
    portableTextToMarkdown(e.body),
  );
}
for (const p of byType("post")) {
  writeMd(
    "news",
    p.slug.current,
    {
      title: p.title,
      date: p.publishedAt,
      excerpt: p.excerpt,
      summary: portableTextToMarkdown(p.summary),
      facts: p.facts?.map(({ label, value }: Any) => ({ label, value })),
      image: transformImage(p.mainImage, ctx),
      seo: seo(p.seo),
    },
    portableTextToMarkdown(p.body),
  );
}
for (const v of byType("venue")) {
  writeMd("venues", slugify(v.name), {
    name: v.name,
    city: v.city,
    address: v.address,
    directions: v.directions,
    website: v.website,
    image: transformImage(v.image, ctx),
  });
}

const s = byType("settings")[0];
writeJson(
  "site",
  compact({
    title: s.title,
    organizationName: s.organizationName,
    tagline: s.tagline,
    description: s.description,
    logo: transformImage(s.logo, ctx),
    defaultSeoImage: transformImage(s.defaultSeoImage, ctx)?.src,
    homePage: refs.get(s.homePage?._ref)?.slug ?? "home",
    donateLink: transformLink(s.donateLink, ctx),
    mailingAddress: s.mailingAddress,
    email: s.email,
    social: (s.socialLinks ?? []).map(({ platform, url }: Any) => ({ platform, url })),
  }),
);
writeJson("navigation", {
  items: (s.navigation ?? []).map((item: Any) =>
    compact({ ...transformLink(item, ctx), children: item.children?.map((c: Any) => transformLink(c, ctx)) }),
  ),
});
writeJson("footer", { links: (s.footerNavigation ?? []).map((l: Any) => transformLink(l, ctx)) });

// Every asset is copied, including ones no published document uses (drafts may), so nothing is lost.
mkdirSync(UPLOADS, { recursive: true });
for (const [ref, asset] of assetById) {
  const target = join(UPLOADS, fileFor(ref));
  if (existsSync(target) && !force) continue;
  const res = await fetch(asset.url);
  if (!res.ok) throw new Error(`Image download failed for ${ref}: ${res.status}`);
  writeFileSync(target, Buffer.from(await res.arrayBuffer()));
}

console.log(
  `pages ${byType("page").length}, events ${byType("event").length}, venues ${byType("venue").length}, news ${byType("post").length}, images ${assets.length} (${used.size} in use), settings 3`,
);
