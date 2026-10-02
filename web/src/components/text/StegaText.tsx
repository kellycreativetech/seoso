import { splitStega } from "@/sanity/stega";

// Renders a CMS string without inline stega characters. In draft mode the edit target moves to a
// data-sanity attribute on a wrapping span (see sanity/stega.ts); otherwise it's plain text.
// Use for any CMS string rendered with letter-spacing (eyebrows, labels, nav, titles).
export function StegaText({ value }: { value: string | null | undefined }) {
  const { text, attr } = splitStega(value);
  return attr ? <span data-sanity={attr}>{text}</span> : <>{text}</>;
}
