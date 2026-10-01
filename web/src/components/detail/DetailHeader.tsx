import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Crumb = { label: string; href: string };
type Props = { crumbs: Crumb[]; eyebrow?: string; title: ReactNode; lead?: string | null; children?: ReactNode };

// Black header for event and news detail pages, with breadcrumbs back to the listing.
export function DetailHeader({ crumbs, eyebrow, title, lead, children }: Props) {
  return (
    <section className="bg-neutral text-neutral-content">
      <Container>
        <div className="grid gap-6 pt-8 pb-16 sm:pb-20">
          <div className="breadcrumbs text-small text-neutral-content/70">
            <ul>
              {crumbs.map((crumb) => (
                <li key={crumb.href}>
                  <Link href={crumb.href} className="link link-hover">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {eyebrow && <Eyebrow tone="brand">{eyebrow}</Eyebrow>}
          <h1 className="max-w-[20ch] font-serif text-h2 font-light tracking-[-0.015em] text-balance sm:text-h1">
            {title}
          </h1>
          {lead && <p className="max-w-[48ch] font-serif text-lead text-neutral-content/90">{lead}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}
