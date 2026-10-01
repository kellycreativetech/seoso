import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageBuilder } from "@/components/PageBuilder";
import { client, fetchOptions } from "@/sanity/client";
import { buildMetadata } from "@/sanity/metadata";
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/queries";

export async function generateStaticParams() {
  const pages = await client.fetch(PAGE_SLUGS_QUERY, {}, fetchOptions);
  return pages.filter((page) => page.slug).map((page) => ({ slug: page.slug! }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await client.fetch(PAGE_QUERY, { slug }, fetchOptions);
  if (!page) return {};
  return buildMetadata({ seo: page.seo, title: page.title });
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await client.fetch(PAGE_QUERY, { slug }, fetchOptions);
  if (!page) notFound();
  if (page.isHomePage) permanentRedirect("/");

  return <PageBuilder content={page.content} />;
}
