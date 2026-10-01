import { InlineRichText } from "@/components/text/InlineRichText";
import { TextLink } from "@/components/ui/TextLink";
import { client, fetchOptions } from "@/sanity/client";
import { PAST_EVENTS_QUERY, UPCOMING_EVENTS_QUERY } from "@/sanity/queries";
import { EventList } from "./EventList";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export async function EventsSection(props: BlockOf<"eventsSection">) {
  const { _key, eyebrow, heading, note, scope, limit, footerLink, disclaimer, anchorId } = props;
  const query = scope === "past" ? PAST_EVENTS_QUERY : UPCOMING_EVENTS_QUERY;
  const events = await client.fetch(query, { limit: limit ?? 500 }, fetchOptions);
  const headingId = `heading-${_key}`;

  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader
        eyebrow={eyebrow}
        heading={heading}
        headingId={headingId}
        aside={note?.length ? <InlineRichText value={note} /> : undefined}
      />
      {events.length ? (
        <EventList events={events} />
      ) : (
        <p className="border-t-2 border-base-content pt-8 text-base-content/70">
          {scope === "past" ? "No past events yet." : "New dates are coming soon. Check back for the next season."}
        </p>
      )}
      {(footerLink?.href || disclaimer) && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          {footerLink?.href && <TextLink href={footerLink.href}>{footerLink.label}</TextLink>}
          {disclaimer && <p className="text-small text-base-content/70">{disclaimer}</p>}
        </div>
      )}
    </Section>
  );
}
