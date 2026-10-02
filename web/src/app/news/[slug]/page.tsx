import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { RichText } from "@/components/text/RichText";
import { StegaText } from "@/components/text/StegaText";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { formatDate } from "@/lib/dates";
import { sanityFetch } from "@/sanity/live";
import { buildMetadata } from "@/sanity/metadata";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";

export async function generateStaticParams() {
  const { data: posts } = await sanityFetch({ query: POST_SLUGS_QUERY, perspective: "published", stega: false });
  return posts.filter((post) => post.slug).map((post) => ({ slug: post.slug! }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await sanityFetch({ query: POST_QUERY, params: { slug }, stega: false });
  if (!post) return {};
  return buildMetadata({ seo: post.seo, title: post.title, description: post.excerpt });
}

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const { data: post } = await sanityFetch({ query: POST_QUERY, params: { slug } });
  if (!post) notFound();

  return (
    <article>
      <DetailHeader
        crumbs={[{ label: "News", href: "/news" }]}
        eyebrow={post.publishedAt ? formatDate(post.publishedAt) : undefined}
        title={<StegaText value={post.title} />}
        lead={post.excerpt}
      />
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="max-w-[62ch] border-t-2 border-base-content pt-4 md:col-span-8 md:col-start-4">
              {post.facts?.length ? (
                <dl className="my-4 flex flex-wrap gap-x-8 gap-y-2 border-b border-base-300 pb-4 text-small">
                  {post.facts.map((fact) => (
                    <div key={fact._key} className="flex gap-1.5">
                      <dt className="font-semibold">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <RichText value={post.body} />
              <p className="mt-12">
                <TextLink href="/news">All news</TextLink>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
