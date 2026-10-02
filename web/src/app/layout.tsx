import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { NavBehavior } from "@/components/site/NavBehavior";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DisableDraftMode } from "@/components/site/DisableDraftMode";
import { SiteDrawer } from "@/components/site/SiteDrawer";
import { SiteHeader } from "@/components/site/SiteHeader";
import { urlFor } from "@/sanity/image";
import { SanityLive, sanityFetch } from "@/sanity/live";
import { SETTINGS_QUERY } from "@/sanity/queries";
import "./globals.css";

// Classy variable serif with true italics, for display type
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

// Humanist sans for body copy
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// next/font exposes these as CSS variables, consumed by @theme in globals.css
const htmlClassName = `${newsreader.variable} ${sourceSans.variable} scroll-smooth`;

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY, stega: false });
  const title = settings?.title ?? "SEOSO";
  const image = settings?.defaultSeoImage?.asset
    ? urlFor({ asset: { _ref: settings.defaultSeoImage.asset._id } })
        .width(1200)
        .height(630)
        .fit("crop")
        .url()
    : undefined;

  return {
    title: { default: settings?.organizationName ?? title, template: `%s | ${title}` },
    description: settings?.description ?? undefined,
    openGraph: { siteName: settings?.organizationName ?? title, images: image ? [image] : undefined },
  };
}

// Hourly safety net so time-based lists (upcoming vs. past events) roll over without a content change.
export const revalidate = 3600;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY });
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="en" className={htmlClassName}>
      <body className="font-sans text-body antialiased">
        <SiteDrawer settings={settings}>
          <a href="#main" className="btn btn-sm absolute top-2 left-2 z-50 -translate-y-20 focus:translate-y-0">
            Skip to content
          </a>
          <SiteHeader settings={settings} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={settings} />
        </SiteDrawer>
        <NavBehavior />
        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
