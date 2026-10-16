import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/live";
import { buildMetadata } from "@/sanity/metadata";
import { HOME_PAGE_QUERY } from "@/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await sanityFetch({ query: HOME_PAGE_QUERY, stega: false });
  if (!page) return {};
  // The home page keeps the site-wide default title unless an SEO title is set
  return buildMetadata({ seo: page.seo });
}

export default async function HomePage() {
  const { data: page } = await sanityFetch({ query: HOME_PAGE_QUERY });
  if (!page) notFound();

  return <PageBuilder documentId={page._id} content={page.content} rotateTones />;
}
