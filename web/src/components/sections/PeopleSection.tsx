import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export function PeopleSection({ _key, eyebrow, heading, intro, people, anchorId }: BlockOf<"peopleSection">) {
  const headingId = `heading-${_key}`;
  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} aside={intro} />
      <ul className="grid grid-cols-1 gap-x-12 border-t-2 border-base-content sm:grid-cols-2 lg:grid-cols-3">
        {people?.map((person) => (
          <li key={person._key} className="border-b border-base-300 py-6">
            <p className="font-serif text-title">{person.name}</p>
            {person.role && (
              <p className="mt-1 text-small font-semibold tracking-[0.14em] text-secondary uppercase">{person.role}</p>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} className="link link-secondary mt-2 inline-block text-small">
                {person.email}
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
