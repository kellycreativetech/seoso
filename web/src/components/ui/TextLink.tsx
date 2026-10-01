import type { ReactNode } from "react";
import { SmartLink } from "./SmartLink";

// Underlined call-to-action text link ("View all events").
export function TextLink({ href, children }: { href: string | null; children: ReactNode }) {
  return (
    <SmartLink href={href} className="link link-secondary font-semibold decoration-[1.5px] underline-offset-4">
      {children}
    </SmartLink>
  );
}
