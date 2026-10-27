import { z } from "astro/zod";
import { blankToNull, previewSectionSchema, type Section } from "./sections";

// Validates CMS entry data for the live preview. Never throws: a half-filled block is skipped and counted.
const text = z.string().nullish();
const eventSchema = z.object({
  title: z.string().min(1),
  isNamedProgram: z.boolean().nullish(),
  start: z.coerce.date(),
  end: z.preprocess(blankToNull, z.coerce.date().nullish()),
  venue: text,
  summary: text,
  admission: text,
  tickets: text,
  body: text,
});
const postSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  excerpt: text,
  facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  body: text,
});

export type PreviewResult =
  | { kind: "sections"; title?: string; sections: Section[]; sourceIndexes: number[]; invalid: number }
  | { kind: "event"; event: z.infer<typeof eventSchema> }
  | { kind: "post"; post: z.infer<typeof postSchema> }
  | { kind: "error"; message: string };

function parseSections(data: Record<string, unknown>): PreviewResult {
  const raw = Array.isArray(data.sections) ? data.sections : [];
  const sections: Section[] = [];
  const sourceIndexes: number[] = [];
  raw.forEach((item, i) => {
    const parsed = previewSectionSchema.safeParse(item);
    if (parsed.success) {
      sections.push(parsed.data as Section);
      sourceIndexes.push(i);
    }
  });
  const title = typeof data.title === "string" ? data.title : typeof data.name === "string" ? data.name : undefined;
  return { kind: "sections", title, sections, sourceIndexes, invalid: raw.length - sections.length };
}

export function parsePreview(collection: unknown, data: unknown): PreviewResult {
  const record = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  switch (collection) {
    case "pages":
    case "snippets":
      return parseSections(record);
    case "events": {
      const parsed = eventSchema.safeParse(record);
      return parsed.success ? { kind: "event", event: parsed.data } : { kind: "error", message: "Add a title and start date to preview this event." };
    }
    case "news": {
      const parsed = postSchema.safeParse(record);
      return parsed.success ? { kind: "post", post: parsed.data } : { kind: "error", message: "Add a title and date to preview this post." };
    }
    default:
      return { kind: "error", message: "Unknown collection" };
  }
}
