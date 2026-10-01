import { HeadingText } from "@/components/text/HeadingText";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { BlockOf } from "./types";

// Black band with an oversized italic figure (e.g. "50") beside the copy.
export function HighlightBand({ _key, figure, eyebrow, heading, body, actions }: BlockOf<"highlightBand">) {
  const headingId = `heading-${_key}`;
  return (
    <section aria-labelledby={headingId} className="bg-neutral text-neutral-content">
      <Container>
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-6 py-16 sm:py-24 md:grid-cols-12">
          {figure && (
            <p
              aria-hidden="true"
              className="font-serif text-[7rem] leading-[0.8] font-light tracking-[-0.04em] text-primary italic tabular-nums sm:text-[10rem] md:col-span-4 lg:text-figure"
            >
              {figure}
            </p>
          )}
          <div className={figure ? "grid gap-5 md:col-span-8 md:col-start-5" : "grid gap-5 md:col-span-8"}>
            {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
            <h2 id={headingId} className="font-serif text-h3 font-light text-balance sm:text-h2">
              <HeadingText value={heading} />
            </h2>
            {body && <p className="max-w-[48ch] text-neutral-content/85">{body}</p>}
            {actions?.length ? (
              <div className="mt-2 flex flex-wrap gap-4">
                {actions.map((action, i) => (
                  <ButtonLink key={action._key} href={action.href} variant={i === 0 ? "brand" : "outlineOnDark"}>
                    {action.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
