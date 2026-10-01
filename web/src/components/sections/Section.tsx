import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type Props = { id?: string | null; labelledBy?: string; children: ReactNode };

// A light content section with the standard vertical rhythm.
export function Section({ id, labelledBy, children }: Props) {
  return (
    <section id={id ?? undefined} aria-labelledby={labelledBy} className="scroll-mt-8 py-16 sm:py-24 lg:py-30">
      <Container>{children}</Container>
    </section>
  );
}
