import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/live";
import { buildMetadata } from "@/sanity/metadata";
import { PAGE_QUERY } from "@/sanity/queries";

// /events and /news are Sanity pages with fixed slugs, rendered by their own route
// so they can sit alongside the /events/[slug] and /news/[slug] detail routes.
export function listingPage(slug: "events" | "news") {
  async function generateMetadata(): Promise<Metadata> {
    const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug }, stega: false });
    if (!page) return {};
    return buildMetadata({ seo: page.seo, title: page.title });
  }

  async function Page() {
    const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug } });
    if (!page) notFound();
    return <PageBuilder documentId={page._id} content={page.content} />;
  }

  return { generateMetadata, Page };
}
