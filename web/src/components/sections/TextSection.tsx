import { RichText } from "@/components/text/RichText";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export function TextSection({ _key, eyebrow, heading, body, anchorId }: BlockOf<"textSection">) {
  const headingId = `heading-${_key}`;
  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} />
      <div className="grid grid-cols-1 border-t-2 border-base-content pt-4 md:grid-cols-12">
        <div className="max-w-[62ch] md:col-span-8 md:col-start-4">
          <RichText value={body} />
        </div>
      </div>
    </Section>
  );
}
