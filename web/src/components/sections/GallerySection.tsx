import { SanityImage } from "@/components/ui/SanityImage";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export function GallerySection({ _key, eyebrow, heading, intro, images, anchorId }: BlockOf<"gallerySection">) {
  const headingId = `heading-${_key}`;
  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} aside={intro} />
      <ul className="grid grid-cols-2 gap-3 border-t-2 border-base-content pt-6 sm:gap-4 md:grid-cols-3">
        {images?.map((image) => (
          <li key={image._key}>
            <figure>
              <SanityImage
                value={image}
                width={600}
                height={450}
                loading="lazy"
                sizes="(min-width: 768px) 33vw, 50vw"
                className="aspect-[4/3] h-auto w-full bg-base-200 object-cover"
              />
              {image.caption && (
                <figcaption className="mt-2 text-small text-base-content/70">{image.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
