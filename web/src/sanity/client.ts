import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

// Published content by default. `defineLive` (./live.ts) switches to drafts and turns on
// stega (click-to-edit encoding) only while Next.js draft mode is enabled.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { studioUrl },
});
