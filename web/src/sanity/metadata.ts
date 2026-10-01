import type { Metadata } from "next";
import { urlFor } from "./image";
import type { SanityImageValue } from "@/components/ui/SanityImage";

type Seo = {
  title: string | null;
  description: string | null;
  noIndex: boolean | null;
  image: SanityImageValue;
} | null;

// Builds Next.js metadata from a document's SEO object, falling back to its title/excerpt.
export function buildMetadata({
  seo,
  title,
  description,
}: {
  seo: Seo;
  title?: string | null;
  description?: string | null;
}): Metadata {
  const image = seo?.image?.asset
    ? urlFor({ asset: { _ref: seo.image.asset._id } })
        .width(1200)
        .height(630)
        .fit("crop")
        .url()
    : undefined;
  const resolvedTitle = seo?.title ?? title ?? undefined;
  const resolvedDescription = seo?.description ?? description ?? undefined;

  // Only set keys that have values: an explicit `undefined` would wipe out the layout's defaults
  // (site title, default share image) instead of inheriting them.
  return {
    ...(resolvedTitle ? { title: resolvedTitle } : {}),
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(resolvedTitle || resolvedDescription || image
      ? {
          openGraph: {
            ...(resolvedTitle ? { title: resolvedTitle } : {}),
            ...(resolvedDescription ? { description: resolvedDescription } : {}),
            ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
          },
        }
      : {}),
  };
}
