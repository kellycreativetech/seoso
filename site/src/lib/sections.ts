import type { ImageMetadata } from "astro";
import { z } from "astro/zod";

// Every block an editor can add to a page or snippet, in the order the CMS offers them.
export const SECTION_TYPES = [
  "hero",
  "eventsList",
  "highlightBand",
  "newsList",
  "richText",
  "people",
  "contacts",
  "venues",
  "gallery",
  "video",
  "textMedia",
  "cardGrid",
  "testimonials",
  "ctaBand",
  "faq",
  "stats",
  "logos",
  "snippet",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

const text = z.string().nullish();

export const linkSchema = z.object({ label: z.string(), href: text, page: text });

/** Builds the section schema around an image `src` schema: Astro's `image()` at build, plain strings in preview. */
export function makeSectionSchema<Src extends z.ZodType>(src: Src) {
  const image = z.object({ src, alt: z.string().default("") });
  const buttons = z.array(linkSchema).max(2).default([]);
  const header = { anchorId: text, eyebrow: text, heading: text };

  return z.discriminatedUnion("type", [
    z.object({ type: z.literal("hero"), anchorId: text, eyebrow: text, heading: z.string(), lead: text, buttons, image: image.nullish() }),
    z.object({
      type: z.literal("eventsList"),
      ...header,
      note: text,
      scope: z.enum(["upcoming", "past"]),
      limit: z.number().int().positive().nullish(),
      footerLink: linkSchema.nullish(),
      disclaimer: text,
    }),
    z.object({
      type: z.literal("highlightBand"),
      anchorId: text,
      figure: image.nullish(),
      eyebrow: text,
      heading: z.string(),
      body: text,
      buttons,
    }),
    z.object({ type: z.literal("newsList"), ...header, limit: z.number().int().positive().default(3), footerLink: linkSchema.nullish() }),
    z.object({ type: z.literal("richText"), ...header, body: z.string() }),
    z.object({
      type: z.literal("people"),
      ...header,
      intro: text,
      people: z.array(z.object({ name: z.string(), role: text, email: text })).default([]),
    }),
    z.object({
      type: z.literal("contacts"),
      ...header,
      intro: text,
      contacts: z.array(z.object({ purpose: z.string(), name: text, email: text, phone: text })).default([]),
    }),
    z.object({ type: z.literal("venues"), ...header, intro: text, venues: z.array(z.string()).default([]) }),
    z.object({
      type: z.literal("gallery"),
      ...header,
      intro: text,
      images: z.array(image.extend({ caption: text })).default([]),
    }),
    z.object({
      type: z.literal("video"),
      ...header,
      intro: text,
      videos: z.array(z.object({ youtubeId: z.string(), title: z.string(), description: text })).default([]),
    }),
    z.object({
      type: z.literal("textMedia"),
      ...header,
      body: z.string(),
      buttons,
      mediaSide: z.enum(["left", "right"]).default("right"),
      media: z
        .discriminatedUnion("kind", [
          z.object({ kind: z.literal("image"), image }),
          z.object({ kind: z.literal("video"), youtubeId: z.string(), title: z.string() }),
        ])
        .nullish(),
    }),
    z.object({
      type: z.literal("cardGrid"),
      ...header,
      intro: text,
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
      cards: z.array(z.object({ title: z.string(), text, image: image.nullish(), link: linkSchema.nullish() })).default([]),
    }),
    z.object({
      type: z.literal("testimonials"),
      ...header,
      quotes: z.array(z.object({ quote: z.string(), name: z.string(), role: text, photo: image.nullish() })).min(1).max(3),
    }),
    z.object({ type: z.literal("ctaBand"), anchorId: text, heading: z.string(), text, buttons }),
    z.object({
      type: z.literal("faq"),
      ...header,
      items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    }),
    z.object({
      type: z.literal("stats"),
      ...header,
      stats: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(4),
    }),
    z.object({
      type: z.literal("logos"),
      ...header,
      logos: z.array(z.object({ image, name: z.string(), href: text })).default([]),
    }),
    z.object({ type: z.literal("snippet"), anchorId: text, snippet: z.string() }),
  ]);
}

/** Validates CMS data in the preview, where images are plain URLs (including unsaved `blob:` uploads). */
export const previewSectionSchema = makeSectionSchema(z.string());

const anySrc = z.union([z.string(), z.custom<ImageMetadata>()]);
export type Section = z.infer<ReturnType<typeof makeSectionSchema<typeof anySrc>>>;
export type ImageRef = { src: ImageMetadata | string; alt: string };

/**
 * Replaces each Snippet block with that snippet's sections, tagged with the Snippet block's index (so the CMS can
 * highlight the right block). Snippets can't nest; unknown slugs render nothing.
 */
export function expandSnippets(sections: Section[], snippets: Map<string, Section[]>) {
  return sections.flatMap((section, sourceIndex) =>
    section.type === "snippet"
      ? (snippets.get(section.snippet) ?? []).filter((s) => s.type !== "snippet").map((s) => ({ section: s, sourceIndex }))
      : [{ section, sourceIndex }],
  );
}
