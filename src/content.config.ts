import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { linkSchema, makeSectionSchema, normalizeUploadPath, optional, optionalText, optionalWhen } from "./lib/sections";

const text = optionalText;
const md = (folder: string) => glob({ pattern: "**/*.md", base: `./src/content/${folder}` });
const settingsFile = (name: string) => glob({ pattern: `${name}.json`, base: "./src/content/settings" });

type ImageFn = SchemaContext["image"];

const seo = (image: ImageFn) =>
  z.object({ title: text, description: text, image: optional(z.preprocess(normalizeUploadPath, image())), noIndex: z.boolean().default(false) }).nullish();
const picture = (image: ImageFn) =>
  optionalWhen("src", z.object({ src: z.preprocess(normalizeUploadPath, image()), alt: z.string().default("") }));

// Pages and snippets are ordered lists of sections; the file name is the slug.
const pages = defineCollection({
  loader: md("pages"),
  schema: ({ image }) =>
    z.object({ title: z.string(), seo: seo(image), sections: z.array(makeSectionSchema(image())).default([]) }),
});

const snippets = defineCollection({
  loader: md("snippets"),
  schema: ({ image }) => z.object({ name: z.string(), sections: z.array(makeSectionSchema(image())).default([]) }),
});

// Dates are ISO strings in UTC; always displayed in America/New_York.
const events = defineCollection({
  loader: md("events"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      isNamedProgram: z.boolean().default(false),
      start: z.coerce.date(),
      end: optional(z.coerce.date()),
      venue: text,
      summary: text,
      admission: text,
      tickets: text, // ticket URL; shown as "Get tickets" until the event has passed
      image: picture(image),
      seo: seo(image),
    }),
});

const news = defineCollection({
  loader: md("news"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: text,
      summary: text,
      facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      image: picture(image),
      seo: seo(image),
    }),
});

const venues = defineCollection({
  loader: md("venues"),
  schema: ({ image }) =>
    z.object({ name: z.string(), city: z.string(), address: text, directions: text, website: text, image: picture(image) }),
});

const site = defineCollection({
  loader: settingsFile("site"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      organizationName: text,
      tagline: text,
      description: text,
      logo: picture(image),
      defaultSeoImage: optional(z.preprocess(normalizeUploadPath, image())),
      homePage: z.string().default("home"),
      donateLink: optionalWhen("label", linkSchema),
      mailingAddress: text,
      email: text,
      social: z.array(z.object({ platform: z.string(), url: z.string() })).default([]),
    }),
});

const navigation = defineCollection({
  loader: settingsFile("navigation"),
  schema: z.object({ items: z.array(linkSchema.extend({ children: z.array(linkSchema).default([]) })).default([]) }),
});

const footer = defineCollection({
  loader: settingsFile("footer"),
  schema: z.object({ links: z.array(linkSchema).default([]), note: text }),
});

export const collections = { pages, snippets, events, news, venues, site, navigation, footer };
