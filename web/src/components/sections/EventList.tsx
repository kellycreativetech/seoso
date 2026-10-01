import Link from "next/link";
import { eventDateParts } from "@/lib/dates";
import type { UPCOMING_EVENTS_QUERY_RESULT } from "@/sanity/types";

type EventSummary = UPCOMING_EVENTS_QUERY_RESULT[number];

// Programme-style list: date | what | where, with a year row whenever the year changes.
export function EventList({ events }: { events: EventSummary[] }) {
  const rows = events.map((event, i) => {
    const date = eventDateParts(event.start!);
    const previousYear = i > 0 ? eventDateParts(events[i - 1].start!).year : null;
    return { event, date, startsYear: date.year !== previousYear };
  });

  return (
    <ol className="list border-t-2 border-base-content text-body">
      {rows.flatMap(({ event, date, startsYear }) => {
        const items = [];
        if (startsYear) {
          items.push(
            <li
              key={`year-${date.year}`}
              aria-hidden="true"
              className="pt-6 pb-1 font-serif text-lead text-secondary italic"
            >
              {date.year}
            </li>,
          );
        }
        items.push(
          <li
            key={event._id}
            className="list-row border-b border-base-300 grid-cols-[5.25rem_minmax(0,1fr)] items-start gap-x-6 gap-y-2 rounded-none px-0 py-7 sm:grid-cols-[6.5rem_minmax(0,1fr)] md:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-x-12"
          >
            <p className="grid grid-cols-1 break-normal md:grid-cols-[auto_1fr] md:items-baseline md:gap-x-3">
              <span className="order-2 font-serif text-[2.6rem] leading-[0.9] font-light tabular-nums md:order-none md:row-span-2 md:text-[3.4rem]">
                {date.day}
              </span>
              <span className="order-1 self-end text-small font-bold tracking-[0.14em] uppercase md:order-none">
                {date.month}
              </span>
              <span className="order-3 text-small whitespace-nowrap text-base-content/70 md:order-none">
                {date.weekday} · {date.time}
              </span>
            </p>
            <div className="min-w-0">
              <h3
                className={
                  event.isNamedProgram
                    ? "font-serif text-title tracking-[-0.005em] italic"
                    : "font-serif text-title tracking-[-0.005em]"
                }
              >
                {event.slug ? (
                  <Link
                    href={`/events/${event.slug}`}
                    className="link link-hover decoration-primary decoration-2 underline-offset-4"
                  >
                    {event.title}
                  </Link>
                ) : (
                  event.title
                )}
              </h3>
              {event.summary && <p className="mt-2 max-w-[52ch] text-base-content/70">{event.summary}</p>}
            </div>
            {event.venue && (
              <p className="list-col-wrap col-start-2 min-w-0 text-small md:col-start-auto md:row-start-1 md:border-l md:border-base-300 md:pt-1 md:pl-5">
                <b className="block text-body font-semibold">{event.venue.name}</b>
                <span className="text-base-content/70">{event.venue.city}</span>
              </p>
            )}
          </li>,
        );
        return items;
      })}
    </ol>
  );
}
