import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { client, fetchOptions } from "@/sanity/client";
import { buildMetadata } from "@/sanity/metadata";
import { HOME_PAGE_QUERY } from "@/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(HOME_PAGE_QUERY, {}, fetchOptions);
  if (!page) return {};
  // The home page keeps the site-wide default title unless an SEO title is set
  return buildMetadata({ seo: page.seo });
}

export default async function HomePage() {
  const page = await client.fetch(HOME_PAGE_QUERY, {}, fetchOptions);
  if (!page) notFound();

  return <PageBuilder content={page.content} />;
}
