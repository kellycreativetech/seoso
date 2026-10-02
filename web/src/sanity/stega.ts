import { vercelStegaDecode, vercelStegaSplit } from "@vercel/stega";
import { createDataAttribute } from "next-sanity";
import { dataset, projectId } from "./env";

export type SplitStega = { text: string; attr: string | undefined };

// In draft mode, strings carry an invisible stega payload (hundreds of zero-width characters) that
// tells Visual Editing which field to open. Left in the text, it breaks typography: Safari and Firefox
// apply letter-spacing to every invisible character, so tracked labels grow ~900px wide and
// negatively tracked headings collapse. This moves the payload out of the text and into a
// `data-sanity` attribute for the same field, which Visual Editing treats identically.
// Outside draft mode there is no payload: the text is returned unchanged and `attr` is undefined.
export function splitStega(value: string | null | undefined): SplitStega {
  if (!value) return { text: value ?? "", attr: undefined };
  const { cleaned, encoded } = vercelStegaSplit(value);
  if (!encoded) return { text: cleaned, attr: undefined };
  return { text: cleaned, attr: toDataAttribute(encoded) };
}

function toDataAttribute(encoded: string) {
  const decoded = vercelStegaDecode<{ href?: string }>(encoded);
  if (!decoded?.href) return undefined;
  // href is a Studio intent URL: …/intent/edit/…?baseUrl=…&id=…&type=…&path=…
  const params = new URL(decoded.href, "http://localhost").searchParams;
  const id = params.get("id");
  const type = params.get("type");
  const path = params.get("path");
  const baseUrl = params.get("baseUrl");
  if (!id || !type || !path || !baseUrl) return undefined;
  return createDataAttribute({ projectId, dataset, baseUrl, id, type, path }).toString();
}
