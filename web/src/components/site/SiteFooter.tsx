import { stegaClean } from "next-sanity";
import { StegaText } from "@/components/text/StegaText";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { Logo } from "./SiteHeader";
import type { Settings } from "./types";

const socialLabels: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube" };

export function SiteFooter({ settings }: { settings: Settings | null }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-neutral text-small text-neutral-content/70">
      <Container>
        <div className="footer gap-8 pt-14 pb-10 sm:footer-horizontal">
          <aside className="grid content-start gap-4">
            <Logo settings={settings} className="h-10 w-auto" />
            {settings?.tagline && (
              <p className="font-serif text-lead text-neutral-content italic">{settings.tagline}</p>
            )}
            {settings?.mailingAddress && (
              <address className="whitespace-pre-line not-italic">{settings.mailingAddress}</address>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="link link-hover text-neutral-content">
                {settings.email}
              </a>
            )}
          </aside>
          <nav aria-label="Footer" className="sm:justify-self-end">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {settings?.footerNavigation?.map((item) => (
                <li key={item._key}>
                  <SmartLink
                    href={item.href}
                    className="link link-hover font-semibold tracking-[0.12em] text-neutral-content uppercase hover:text-primary"
                  >
                    <StegaText value={item.label} />
                  </SmartLink>
                </li>
              ))}
              {settings?.socialLinks?.map((social) => (
                <li key={social._key}>
                  <a
                    href={social.url ?? undefined}
                    rel="noopener noreferrer"
                    className="link link-hover font-semibold tracking-[0.12em] text-neutral-content uppercase hover:text-primary"
                  >
                    {socialLabels[stegaClean(social.platform) ?? ""] ?? stegaClean(social.platform)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-neutral-content/15 py-6">
          <span>{settings?.organizationName}</span>
          <span>
            © {year} {settings?.title}
          </span>
        </div>
      </Container>
    </footer>
  );
}
