import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { urlFor } from "@/sanity/image";
import { StegaText } from "@/components/text/StegaText";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { DRAWER_ID } from "./SiteDrawer";
import { NavLink } from "./NavLink";
import type { Settings } from "./types";

export function Logo({ settings, className }: { settings: Settings | null; className: string }) {
  const logo = settings?.logo;
  const dims = logo?.asset?.metadata?.dimensions;
  if (!logo?.asset || !dims?.width || !dims?.height) {
    return <span className="font-serif text-title">{settings?.title ?? "SEOSO"}</span>;
  }
  return (
    <Image
      src={urlFor({ asset: { _ref: logo.asset._id } })
        .width(dims.width * 2)
        .url()}
      alt={logo.alt ?? settings?.title ?? ""}
      width={dims.width}
      height={dims.height}
      priority
      className={className}
    />
  );
}

// navbar-start/end default to 50% each; the logo needs far less, so give the menu side the rest.
// (At 1024–1150px, Firefox's wider text otherwise overflows the menu into the Donate button.)
export function SiteHeader({ settings }: { settings: Settings | null }) {
  return (
    <header className="relative z-10 bg-neutral text-neutral-content">
      <Container>
        <nav aria-label="Main" className="navbar min-h-0 gap-6 px-0 py-5">
          <div className="navbar-start w-auto shrink-0">
            <Link href="/" aria-label={`${settings?.title ?? "SEOSO"} home`} className="shrink-0">
              <Logo settings={settings} className="h-10 w-auto lg:h-12" />
            </Link>
          </div>
          <div className="navbar-end w-auto flex-1 gap-4">
            <ul
              data-site-menu
              className="menu menu-horizontal hidden flex-nowrap text-small font-semibold tracking-[0.12em] uppercase lg:flex"
            >
              {settings?.navigation?.map((item) =>
                item.children?.length ? (
                  <li key={item._key}>
                    <details>
                      <summary>
                        <StegaText value={item.label} />
                      </summary>
                      <ul className="z-20 w-60 bg-neutral p-2 text-neutral-content">
                        {item.children.map((child) => (
                          <li key={child._key}>
                            <NavLink href={child.href}>{child.label}</NavLink>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={item._key}>
                    <NavLink href={item.href}>{item.label}</NavLink>
                  </li>
                ),
              )}
            </ul>
            {settings?.donateLink?.href && (
              <ButtonLink href={settings.donateLink.href} variant="outlineOnDarkSmall">
                {settings.donateLink.label}
              </ButtonLink>
            )}
            <label
              htmlFor={DRAWER_ID}
              className="btn btn-sm btn-outline border-neutral-content/60 text-small font-semibold tracking-[0.12em] text-neutral-content uppercase lg:hidden"
            >
              <Menu aria-hidden="true" className="size-4" />
              Menu
            </label>
          </div>
        </nav>
      </Container>
    </header>
  );
}
