import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";
import { SECTION_TYPES, previewSectionSchema } from "../src/lib/sections";

const repoRoot = join(__dirname, "..");
const config = parse(readFileSync(join(__dirname, "../public/admin/config.yml"), "utf8"));
const collection = (name: string) => config.collections.find((c: { name: string }) => c.name === name);
const sectionTypes = (name: string) => collection(name).fields.find((f: { name: string }) => f.name === "sections").types;
const schemaKeys = new Map(
  previewSectionSchema.options.map((option) => [option.shape.type.value as string, Object.keys(option.shape)]),
);

describe("Sveltia CMS config", () => {
  test.each(["pages", "snippets"])("%s offers exactly the section types the site renders", (name) => {
    expect(sectionTypes(name).map((t: { name: string }) => t.name)).toEqual([...SECTION_TYPES]);
  });
  test.each(["pages", "snippets"])("every %s block field exists in the section schema", (name) => {
    for (const type of sectionTypes(name)) {
      const keys = schemaKeys.get(type.name);
      for (const field of type.fields) expect(keys, `${type.name}.${field.name}`).toContain(field.name);
    }
  });
  test("every collection folder and settings file exists", () => {
    for (const c of config.collections) {
      if (c.folder) expect(existsSync(join(repoRoot, c.folder)), c.folder).toBe(true);
      for (const f of c.files ?? []) expect(existsSync(join(repoRoot, f.file)), f.file).toBe(true);
    }
  });
  test("edits go to the GitHub repo's main branch, straight to the branch", () => {
    expect(config.backend).toMatchObject({ name: "github", repo: "kellycreativetech/seoso", branch: "main" });
    expect(config.publish_mode).toBe("simple");
  });
  test("event times are entered in Eastern time and stored as UTC", () => {
    const start = collection("events").fields.find((f: { name: string }) => f.name === "start");
    expect(start).toMatchObject({ widget: "datetime", input_timezone: "America/New_York", output_utc: true });
  });
});

describe("CMS image uploads", () => {
  type Field = { name?: string; widget?: string; choose_url?: boolean; fields?: Field[]; types?: Field[]; field?: Field };
  const imageFields: Field[] = [];
  const walk = (fields: Field[] = []) => {
    for (const f of fields) {
      if (f.widget === "image") imageFields.push(f);
      walk(f.fields);
      walk(f.types);
      if (f.field) walk([f.field]);
    }
  };
  for (const c of config.collections) {
    walk(c.fields);
    for (const file of c.files ?? []) walk(file.fields);
  }

  test("every image field refuses a typed-in URL (remote images would fail the build)", () => {
    expect(imageFields.length).toBeGreaterThan(3);
    for (const f of imageFields) expect(f, f.name).toMatchObject({ choose_url: false });
  });
  test("uploads are converted in the browser: WebP at most 2560px, SVGs optimized, names slugified", () => {
    expect(config.media_libraries?.default?.config).toEqual({
      slugify_filename: true,
      transformations: { raster_image: { format: "webp", quality: 90, width: 2560, height: 2560 }, svg: { optimize: true } },
    });
  });
});
