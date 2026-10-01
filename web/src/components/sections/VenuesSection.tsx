import { ExternalLink, MapPin } from "lucide-react";
import { SanityImage } from "@/components/ui/SanityImage";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export function VenuesSection({ _key, eyebrow, heading, intro, venues, anchorId }: BlockOf<"venuesSection">) {
  const headingId = `heading-${_key}`;
  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} aside={intro} />
      <ul className="grid grid-cols-1 gap-x-12 border-t-2 border-base-content md:grid-cols-2">
        {venues?.map((venue) => (
          <li key={venue._id} className="grid content-start gap-3 border-b border-base-300 py-8">
            {venue.image?.asset && (
              <SanityImage
                value={venue.image}
                width={800}
                height={450}
                loading="lazy"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="mb-2 aspect-video h-auto w-full object-cover"
              />
            )}
            <h3 className="font-serif text-title">{venue.name}</h3>
            {venue.address && (
              <p className="flex gap-2 whitespace-pre-line text-base-content/70">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-secondary" />
                {venue.address}
              </p>
            )}
            {venue.directions && <p className="max-w-[56ch] text-small text-base-content/70">{venue.directions}</p>}
            {venue.website && (
              <a
                href={venue.website}
                rel="noopener noreferrer"
                className="link link-secondary inline-flex items-center gap-1.5 text-small font-semibold"
              >
                Visit website<span className="sr-only"> for {venue.name}</span>
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
