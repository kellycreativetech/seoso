import type { ReactNode } from "react";
import { splitStega } from "@/sanity/stega";
import { SmartLink } from "./SmartLink";

type Variant = "brand" | "brandBlock" | "outlineOnDark" | "outlineOnDarkSmall";

// Complete static class strings per variant (never build daisyUI class names dynamically).
const variants: Record<Variant, string> = {
  brand:
    "btn btn-primary px-6 text-small font-semibold tracking-[0.1em] uppercase hover:border-neutral-content hover:bg-neutral-content hover:text-neutral",
  brandBlock:
    "btn btn-primary btn-block px-6 text-small font-semibold tracking-[0.1em] uppercase hover:border-neutral-content hover:bg-neutral-content hover:text-neutral",
  outlineOnDark:
    "btn btn-outline border-neutral-content px-6 text-small font-semibold tracking-[0.1em] text-neutral-content uppercase hover:border-neutral-content hover:bg-neutral-content hover:text-neutral",
  outlineOnDarkSmall:
    "btn btn-sm btn-outline hidden border-neutral-content px-4 text-small font-semibold tracking-[0.1em] text-neutral-content uppercase hover:border-neutral-content hover:bg-neutral-content hover:text-neutral sm:inline-flex",
};

type Props = { href: string | null; variant?: Variant; children: ReactNode };

export function ButtonLink({ href, variant = "brand", children }: Props) {
  // Tracked label: keep stega out of the text (see sanity/stega.ts)
  const { text, attr } = typeof children === "string" ? splitStega(children) : { text: children, attr: undefined };
  return (
    <SmartLink href={href} className={variants[variant]} data-sanity={attr}>
      {text}
    </SmartLink>
  );
}
