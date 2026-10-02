import { InlineRichText } from "@/components/text/InlineRichText";
import { TextLink } from "@/components/ui/TextLink";
import { stegaClean } from "next-sanity";
import { sanityFetch } from "@/sanity/live";
import { PAST_EVENTS_QUERY, UPCOMING_EVENTS_QUERY } from "@/sanity/queries";
import { EventList } from "./EventList";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export async function EventsSection(props: BlockOf<"eventsSection">) {
  const { _key, eyebrow, heading, note, scope, limit, footerLink, disclaimer, anchorId } = props;
  // `scope` may carry stega characters in draft mode; clean before comparing.
  const isPast = stegaClean(scope) === "past";
  const params = { limit: limit ?? 500, now: currentHour() };
  const { data: events } = isPast
    ? await sanityFetch({ query: PAST_EVENTS_QUERY, params })
    : await sanityFetch({ query: UPCOMING_EVENTS_QUERY, params });
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
          {isPast ? "No past events yet." : "New dates are coming soon. Check back for the next season."}
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

// Start of the current hour: keeps the query cacheable while letting events roll from
// "upcoming" to "past" within an hour of starting (see `revalidate` in app/layout.tsx).
function currentHour() {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString();
}
