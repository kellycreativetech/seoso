import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { client, fetchOptions } from "@/sanity/client";
import { buildMetadata } from "@/sanity/metadata";
import { PAGE_QUERY } from "@/sanity/queries";

// /events and /news are Sanity pages with fixed slugs, rendered by their own route
// so they can sit alongside the /events/[slug] and /news/[slug] detail routes.
export function listingPage(slug: "events" | "news") {
  async function generateMetadata(): Promise<Metadata> {
    const page = await client.fetch(PAGE_QUERY, { slug }, fetchOptions);
    if (!page) return {};
    return buildMetadata({ seo: page.seo, title: page.title });
  }

  async function Page() {
    const page = await client.fetch(PAGE_QUERY, { slug }, fetchOptions);
    if (!page) notFound();
    return <PageBuilder content={page.content} />;
  }

  return { generateMetadata, Page };
}
