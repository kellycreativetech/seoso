import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"a">, "href"> & { href: string | null };

// Site paths use next/link; anchors, mailto and external URLs use a plain anchor.
export function SmartLink({ href, children, ...rest }: Props) {
  if (!href) return null;
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a href={href} {...(isExternal ? { rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}
