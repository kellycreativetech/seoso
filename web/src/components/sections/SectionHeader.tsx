import type { ReactNode } from "react";
import type { StegaBranded } from "next-sanity";
import type { HeadingText as HeadingTextValue } from "@/sanity/types";
import { HeadingText } from "@/components/text/HeadingText";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Props = {
  eyebrow?: string | null;
  heading?: HeadingTextValue | StegaBranded<HeadingTextValue> | null;
  headingId?: string;
  aside?: ReactNode;
};

// Eyebrow + serif heading on the 12-column measure, with an optional note on the right.
export function SectionHeader({ eyebrow, heading, headingId, aside }: Props) {
  if (!eyebrow && !heading?.length && !aside) return null;
  return (
    <div className="mb-10 grid grid-cols-1 items-end gap-6 sm:mb-16 md:grid-cols-12">
      {eyebrow && (
        <div className="md:col-span-12">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      {heading?.length ? (
        <h2 id={headingId} className="font-serif text-h3 tracking-[-0.01em] text-balance sm:text-h2 md:col-span-7">
          <HeadingText value={heading} />
        </h2>
      ) : null}
      {aside && <div className="max-w-[30ch] text-base-content/70 md:col-span-4 md:col-start-9">{aside}</div>}
    </div>
  );
}
