import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";
import { SECTION_TYPES, previewSectionSchema } from "../src/lib/sections";

const repoRoot = join(__dirname, "../..");
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
  test("edits go to the GitHub repo's sveltia branch, straight to the branch", () => {
    expect(config.backend).toMatchObject({ name: "github", repo: "kellycreativetech/seoso", branch: "sveltia" });
    expect(config.publish_mode).toBe("simple");
  });
  test("event times are entered in Eastern time and stored as UTC", () => {
    const start = collection("events").fields.find((f: { name: string }) => f.name === "start");
    expect(start).toMatchObject({ widget: "datetime", input_timezone: "America/New_York", output_utc: true });
  });
});
