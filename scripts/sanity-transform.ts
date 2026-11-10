// Pure transforms from Sanity documents to the Astro content shapes (see src/lib/sections.ts and content.config.ts).
type Any = Record<string, any>;
type Block = { _type: string; style?: string; listItem?: string; markDefs?: Any[]; children?: Any[] };

export type DocRef = { type: "page" | "event" | "post" | "venue"; slug: string };
export type Ctx = { docs: Map<string, DocRef>; imagePath(ref: string): string };

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const INLINE: Record<string, [string, string]> = { strong: ["**", "**"], em: ["*", "*"], "strike-through": ["~~", "~~"] };

function spans(block: Block): string {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]));
  return (block.children ?? [])
    .map((child) => {
      let out: string = child.text ?? "";
      for (const mark of child.marks ?? []) {
        const def = defs.get(mark);
        if (def?._type === "link") out = `[${out}](${def.href})`;
        else if (INLINE[mark]) out = `${INLINE[mark][0]}${out}${INLINE[mark][1]}`;
      }
      return out;
    })
    .join("");
}

export function headingToInline(blocks: Block[] | null | undefined): string {
  return (blocks ?? []).map(spans).join(" ").trim();
}

export function portableTextToMarkdown(blocks: Block[] | null | undefined): string {
  const out: string[] = [];
  for (const block of blocks ?? []) {
    if (block._type !== "block") continue;
    const line = spans(block);
    if (block.listItem) {
      const prefix = block.listItem === "number" ? "1. " : "- ";
      const prev = out.at(-1);
      if (prev !== undefined && /^(- |1\. )/.test(prev.split("\n").at(-1) ?? "")) out[out.length - 1] = `${prev}\n${prefix}${line}`;
      else out.push(prefix + line);
    } else if (block.style && /^h[2-4]$/.test(block.style)) out.push(`${"#".repeat(Number(block.style[1]))} ${line}`);
    else out.push(line);
  }
  return out.join("\n\n");
}

/** Rich text may be Portable Text or a plain string; either becomes a Markdown string. */
const richText = (value: unknown) => (Array.isArray(value) ? portableTextToMarkdown(value) : (value as string | undefined));

function compact<T extends Any>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")) as T;
}

export function transformLink(link: Any | null | undefined, ctx: Ctx) {
  if (!link) return undefined;
  if (link.linkType === "internal" && link.internal?._ref) {
    const doc = ctx.docs.get(link.internal._ref);
    if (!doc) return compact({ label: link.label });
    if (doc.type === "page") return { label: link.label, page: doc.slug };
    return { label: link.label, href: doc.type === "event" ? `/events/${doc.slug}` : `/news/${doc.slug}` };
  }
  return compact({ label: link.label, href: link.url });
}

export function transformImage(img: Any | null | undefined, ctx: Ctx) {
  const ref = img?.asset?._ref;
  return ref ? { src: ctx.imagePath(ref), alt: img.alt ?? "" } : undefined;
}

const buttons = (actions: Any[] | undefined, ctx: Ctx) => {
  const list = (actions ?? []).map((a) => transformLink(a, ctx)).filter(Boolean);
  return list.length ? list : undefined;
};

export function transformSection(s: Any, ctx: Ctx) {
  const base = { anchorId: s.anchorId, eyebrow: s.eyebrow, heading: headingToInline(s.heading) };
  switch (s._type) {
    case "hero":
      return compact({ type: "hero", ...base, lead: s.lead, buttons: buttons(s.actions, ctx), image: transformImage(s.image, ctx) });
    case "eventsSection":
      return compact({
        type: "eventsList",
        ...base,
        note: richText(s.note),
        scope: s.scope ?? "upcoming",
        limit: s.limit,
        footerLink: transformLink(s.footerLink, ctx),
        disclaimer: s.disclaimer,
      });
    case "highlightBand":
      return compact({
        type: "highlightBand",
        ...base,
        figure: transformImage(s.figure, ctx),
        body: s.body,
        buttons: buttons(s.actions, ctx),
      });
    case "newsSection":
      return compact({ type: "newsList", ...base, limit: s.limit, footerLink: transformLink(s.footerLink, ctx) });
    case "textSection":
      return compact({ type: "richText", ...base, body: richText(s.body) ?? "" });
    case "peopleSection":
      return compact({ type: "people", ...base, intro: richText(s.intro), people: (s.people ?? []).map(({ name, role, email }: Any) => compact({ name, role, email })) });
    case "contactSection":
      return compact({
        type: "contacts",
        ...base,
        intro: richText(s.intro),
        contacts: (s.contacts ?? []).map(({ purpose, name, email, phone }: Any) => compact({ purpose, name, email, phone })),
      });
    case "venuesSection":
      return compact({
        type: "venues",
        ...base,
        intro: richText(s.intro),
        venues: (s.venues ?? []).map((v: Any) => ctx.docs.get(v._ref)?.slug).filter(Boolean),
      });
    case "gallerySection":
      return compact({
        type: "gallery",
        ...base,
        intro: richText(s.intro),
        images: (s.images ?? []).map((img: Any) => compact({ ...transformImage(img, ctx), caption: img.caption })),
      });
    case "videoSection":
      return compact({
        type: "video",
        ...base,
        intro: richText(s.intro),
        videos: (s.videos ?? []).map(({ youtubeId, title, description }: Any) => compact({ youtubeId, title, description })),
      });
    default:
      throw new Error(`Unknown Sanity section type: ${s._type}`);
  }
}
