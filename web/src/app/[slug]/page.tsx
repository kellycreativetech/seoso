import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/live";
import { buildMetadata } from "@/sanity/metadata";
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/queries";

export async function generateStaticParams() {
  const { data: pages } = await sanityFetch({ query: PAGE_SLUGS_QUERY, perspective: "published", stega: false });
  return pages.filter((page) => page.slug).map((page) => ({ slug: page.slug! }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug }, stega: false });
  if (!page) return {};
  return buildMetadata({ seo: page.seo, title: page.title });
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug } });
  if (!page) notFound();
  if (page.isHomePage) permanentRedirect("/");

  return <PageBuilder documentId={page._id} content={page.content} />;
}
