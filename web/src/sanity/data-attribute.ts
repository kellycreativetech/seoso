import { createDataAttribute } from "next-sanity";
import { dataset, projectId, studioUrl } from "./env";

type Target = { id: string; type: string; path: string };

// `data-sanity` value for elements that aren't plain strings (sections, images), so the
// Presentation tool can outline, open and reorder them.
export function dataAttr({ id, type, path }: Target) {
  return createDataAttribute({ projectId, dataset, baseUrl: studioUrl, id, type, path }).toString();
}
