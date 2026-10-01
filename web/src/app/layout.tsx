import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { NavBehavior } from "@/components/site/NavBehavior";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteDrawer } from "@/components/site/SiteDrawer";
import { SiteHeader } from "@/components/site/SiteHeader";
import { client, fetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
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
  const settings = await client.fetch(SETTINGS_QUERY, {}, fetchOptions);
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await client.fetch(SETTINGS_QUERY, {}, fetchOptions);

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
      </body>
    </html>
  );
}
