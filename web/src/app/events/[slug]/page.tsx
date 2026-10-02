import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { RichText } from "@/components/text/RichText";
import { StegaText } from "@/components/text/StegaText";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { eventDateParts, formatTime } from "@/lib/dates";
import { sanityFetch } from "@/sanity/live";
import { buildMetadata } from "@/sanity/metadata";
import { EVENT_QUERY, EVENT_SLUGS_QUERY } from "@/sanity/queries";

export async function generateStaticParams() {
  const { data: events } = await sanityFetch({ query: EVENT_SLUGS_QUERY, perspective: "published", stega: false });
  return events.filter((event) => event.slug).map((event) => ({ slug: event.slug! }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { data: event } = await sanityFetch({ query: EVENT_QUERY, params: { slug }, stega: false });
  if (!event) return {};
  return buildMetadata({ seo: event.seo, title: event.title, description: event.summary });
}

const label = "text-small font-semibold tracking-[0.14em] text-secondary uppercase";

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const { data: event } = await sanityFetch({ query: EVENT_QUERY, params: { slug } });
  if (!event?.start) notFound();

  const date = eventDateParts(event.start);
  const isPast = new Date(event.start) < new Date();
  const venue = event.venueDetails;

  return (
    <>
      <DetailHeader
        crumbs={[
          { label: "Events", href: "/events" },
          { label: isPast ? "Past events" : "Season", href: isPast ? "/events#past" : "/events#season" },
        ]}
        eyebrow={`${date.long} · ${date.time}${event.end ? `–${formatTime(new Date(event.end))}` : ""}`}
        title={
          <span className={event.isNamedProgram ? "italic" : undefined}>
            <StegaText value={event.title} />
          </span>
        }
        lead={event.summary}
      >
        {event.ticketUrl && !isPast && (
          <div>
            <ButtonLink href={event.ticketUrl}>Get tickets</ButtonLink>
          </div>
        )}
      </DetailHeader>
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <dl className="grid content-start gap-6 border-t-2 border-base-content pt-6 md:col-span-4">
              <div>
                <dt className={label}>When</dt>
                <dd className="mt-1 font-serif text-lead">
                  {date.long}
                  <br />
                  {date.time}
                </dd>
              </div>
              {venue && (
                <div>
                  <dt className={label}>Where</dt>
                  <dd className="mt-1">
                    <p className="font-serif text-lead">{venue.name}</p>
                    {venue.address ? (
                      <p className="whitespace-pre-line text-base-content/70">{venue.address}</p>
                    ) : (
                      <p className="text-base-content/70">{venue.city}</p>
                    )}
                    {venue.website && (
                      <a
                        href={venue.website}
                        rel="noopener noreferrer"
                        className="link link-secondary mt-2 inline-flex items-center gap-1.5 text-small font-semibold"
                      >
                        Venue website <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    )}
                  </dd>
                </div>
              )}
              {event.admission && (
                <div>
                  <dt className={label}>Admission</dt>
                  <dd className="mt-1 font-serif text-lead">{event.admission}</dd>
                </div>
              )}
            </dl>
            <div className="max-w-[62ch] md:col-span-7 md:col-start-6">
              {event.body?.length ? (
                <RichText value={event.body} />
              ) : (
                <p className="text-base-content/70">
                  {isPast ? "This event has taken place." : "More details about this program are coming soon."}
                </p>
              )}
              {venue?.directions && (
                <div className="mt-10 border-t border-base-300 pt-6">
                  <h2 className={label}>Directions</h2>
                  <p className="mt-2">{venue.directions}</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
