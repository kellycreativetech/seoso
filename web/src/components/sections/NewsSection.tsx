import { TextLink } from "@/components/ui/TextLink";
import { client, fetchOptions } from "@/sanity/client";
import { LATEST_POSTS_QUERY } from "@/sanity/queries";
import { PostFeature } from "./PostFeature";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export async function NewsSection({ _key, eyebrow, heading, limit, footerLink, anchorId }: BlockOf<"newsSection">) {
  const posts = await client.fetch(LATEST_POSTS_QUERY, { limit: limit ?? 500 }, fetchOptions);
  const headingId = `heading-${_key}`;

  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} />
      {posts.length ? (
        <div className="grid gap-16">
          {posts.map((post, i) => (
            <PostFeature key={post._id} post={post} label={i === 0 ? "Latest post" : undefined} />
          ))}
        </div>
      ) : (
        <p className="text-base-content/70">No news yet.</p>
      )}
      {footerLink?.href && (
        <div className="mt-10">
          <TextLink href={footerLink.href}>{footerLink.label}</TextLink>
        </div>
      )}
    </Section>
  );
}
