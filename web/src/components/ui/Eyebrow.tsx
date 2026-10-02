import type { ReactNode } from "react";
import { splitStega } from "@/sanity/stega";

type Tone = "brand" | "brandOnLight" | "muted";

// Complete static class strings per tone.
const tones: Record<Tone, string> = {
  brand: "text-small font-semibold tracking-[0.14em] text-primary uppercase",
  brandOnLight: "text-small font-semibold tracking-[0.14em] text-secondary uppercase",
  muted: "text-small font-semibold tracking-[0.14em] text-neutral-content/70 uppercase",
};

// Small uppercase label above headings. `brand` is for black backgrounds.
export function Eyebrow({ children, tone = "brandOnLight" }: { children: ReactNode; tone?: Tone }) {
  // Tracked label: keep stega out of the text (see sanity/stega.ts)
  const { text, attr } = typeof children === "string" ? splitStega(children) : { text: children, attr: undefined };
  return (
    <p className={tones[tone]} data-sanity={attr}>
      {text}
    </p>
  );
}
