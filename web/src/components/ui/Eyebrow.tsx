import type { ReactNode } from "react";

type Tone = "brand" | "brandOnLight" | "muted";

// Complete static class strings per tone.
const tones: Record<Tone, string> = {
  brand: "text-small font-semibold tracking-[0.14em] text-primary uppercase",
  brandOnLight: "text-small font-semibold tracking-[0.14em] text-secondary uppercase",
  muted: "text-small font-semibold tracking-[0.14em] text-neutral-content/70 uppercase",
};

// Small uppercase label above headings. `brand` is for black backgrounds.
export function Eyebrow({ children, tone = "brandOnLight" }: { children: ReactNode; tone?: Tone }) {
  return <p className={tones[tone]}>{children}</p>;
}
