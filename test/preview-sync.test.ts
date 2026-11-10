import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { parse } from "yaml";
import { parsePreview } from "../src/lib/preview";
import { UPLOADS_ABSOLUTE } from "../src/lib/sections";

// public/admin/preview.js is plain browser JS (no build step), so these tests keep it in step with the site:
// the collections it registers, the collections /api/preview renders, and the CMS config.
const previewJs = readFileSync(join(__dirname, "../public/admin/preview.js"), "utf8");
const config = parse(readFileSync(join(__dirname, "../public/admin/config.yml"), "utf8"));

const registered = JSON.parse(
  (previewJs.match(/for \(const collection of (\[[^\]]*\])\)/)?.[1] ?? "[]").replace(/'/g, '"'),
) as string[];
const cmsCollections: string[] = config.collections.map((c: { name: string }) => c.name);
const rendered = cmsCollections.filter((name) => {
  const result = parsePreview(name, {});
  return !(result.kind === "error" && result.message === "Unknown collection");
});

test("preview.js registers a template for exactly the collections /api/preview renders", () => {
  expect(registered.length).toBeGreaterThan(0);
  expect([...registered].sort()).toEqual([...rendered].sort());
});

test("every collection preview.js registers exists in the CMS config", () => {
  for (const name of registered) expect(cmsCollections, name).toContain(name);
});

test("preview.js resolves the same upload paths the CMS writes", () => {
  expect(config.media_folder.replace(/\/?$/, "/")).toBe(UPLOADS_ABSOLUTE);
  expect(previewJs).toContain(`"${UPLOADS_ABSOLUTE}"`);
  expect(previewJs).toContain('"../../assets/uploads/"');
});
