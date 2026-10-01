"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SmartLink } from "@/components/ui/SmartLink";

// Menu link that marks the current page (aria-current + brand color), as in the original design.
export function NavLink({ href, children }: { href: string | null; children: ReactNode }) {
  const pathname = usePathname();
  const isCurrent = href === pathname;
  return (
    <SmartLink
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={isCurrent ? "text-primary" : undefined}
    >
      {children}
    </SmartLink>
  );
}
