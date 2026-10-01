import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Published content, refreshed via ISR. Swap for `defineLive` when adding Visual Editing.
export const fetchOptions = { next: { revalidate: 30 } };
