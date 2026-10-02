import Link from "next/link";
import { stegaClean } from "next-sanity";
import { InlineRichText } from "@/components/text/InlineRichText";
import { StegaText } from "@/components/text/StegaText";
import { formatDate } from "@/lib/dates";
import type { StegaBranded } from "next-sanity";
import type { LATEST_POSTS_QUERY_RESULT } from "@/sanity/types";

type Post = StegaBranded<LATEST_POSTS_QUERY_RESULT>[number];

// A post on the 12-column grid: date column on the left, excerpt and facts on the right.
export function PostFeature({ post, label }: { post: Post; label?: string }) {
  const href = `/news/${post.slug}`;
  return (
    <article className="grid grid-cols-1 gap-6 border-t-2 border-base-content pt-8 md:grid-cols-12">
      <div className="grid content-start gap-1 text-small text-base-content/70 md:col-span-3">
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="font-semibold tracking-[0.04em] text-base-content">
            {formatDate(post.publishedAt)}
          </time>
        )}
        {label && <span>{label}</span>}
      </div>
      <div className="grid min-w-0 gap-5 md:col-span-8 md:col-start-4">
        <h3 className="font-serif text-title tracking-[-0.01em] text-balance sm:text-h3">
          <Link href={href} className="link link-hover decoration-primary decoration-2 underline-offset-[6px]">
            <StegaText value={post.title} />
          </Link>
        </h3>
        {post.excerpt && <p className="font-serif text-lead">{post.excerpt}</p>}
        {post.summary?.length ? (
          <div className="max-w-[62ch] text-base-content/70">
            <InlineRichText value={post.summary} />
          </div>
        ) : null}
        {post.facts?.length ? (
          <dl className="flex flex-wrap gap-x-8 gap-y-2 border-y border-base-300 py-4 text-small">
            {post.facts.map((fact) => (
              <div key={fact._key} className="flex gap-1.5">
                <dt className="font-semibold">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p>
          <Link href={href} className="link link-secondary font-semibold decoration-[1.5px] underline-offset-4">
            Read the full post<span className="sr-only">: {stegaClean(post.title)}</span>
          </Link>
        </p>
      </div>
    </article>
  );
}
