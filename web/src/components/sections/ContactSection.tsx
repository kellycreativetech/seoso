import { client, fetchOptions } from "@/sanity/client";
import { SETTINGS_QUERY } from "@/sanity/queries";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

const label = "text-small font-semibold tracking-[0.14em] text-secondary uppercase";

export async function ContactSection({ _key, eyebrow, heading, intro, contacts, anchorId }: BlockOf<"contactSection">) {
  const settings = await client.fetch(SETTINGS_QUERY, {}, fetchOptions);
  const headingId = `heading-${_key}`;

  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} aside={intro} />
      <div className="grid grid-cols-1 gap-x-12 border-t-2 border-base-content md:grid-cols-3">
        {settings?.mailingAddress && (
          <div className="border-b border-base-300 py-6">
            <h3 className={label}>Mailing address</h3>
            <address className="mt-2 font-serif text-lead whitespace-pre-line not-italic">
              {settings.organizationName && (
                <>
                  {settings.organizationName}
                  {"\n"}
                </>
              )}
              {settings.mailingAddress}
            </address>
          </div>
        )}
        {contacts?.map((contact) => (
          <div key={contact._key} className="border-b border-base-300 py-6">
            <h3 className={label}>{contact.purpose}</h3>
            {contact.name && <p className="mt-2 font-serif text-lead">{contact.name}</p>}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="link link-secondary mt-1 inline-block break-all">
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="link link-secondary mt-1 block">
                {contact.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
