"use client";

import { usePathname } from "next/navigation";
import { SmartLink } from "@/components/ui/SmartLink";
import { splitStega } from "@/sanity/stega";

// Menu link that marks the current page (aria-current + brand color), as in the original design.
export function NavLink({ href, children }: { href: string | null; children: string | null }) {
  const pathname = usePathname();
  const isCurrent = href === pathname;
  // Menu labels are letter-spaced: keep stega out of the text (see sanity/stega.ts)
  const { text, attr } = splitStega(children);
  return (
    <SmartLink
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={isCurrent ? "text-primary" : undefined}
      data-sanity={attr}
    >
      {text}
    </SmartLink>
  );
}
