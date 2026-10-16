import { HeadingText } from "@/components/text/HeadingText";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SanityImage } from "@/components/ui/SanityImage";
import type { BlockOf } from "./types";

// Band with an optional square figure image (e.g. a product cutout) beside the copy.
// Its background (black or the page surface) comes from the tone PageBuilder gives it.
export function HighlightBand({ _key, figure, eyebrow, heading, body, actions }: BlockOf<"highlightBand">) {
  const headingId = `heading-${_key}`;
  const hasFigure = Boolean(figure?.asset);
  return (
    <section aria-labelledby={headingId}>
      <Container>
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-6 py-16 sm:py-24 md:grid-cols-12">
          {hasFigure && (
            <div className="mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
              <SanityImage
                value={figure}
                width={800}
                height={800}
                sizes="(min-width: 74rem) 28rem, (min-width: 48rem) 40vw, 24rem"
                loading="lazy"
                className="aspect-square h-auto w-full object-contain"
              />
            </div>
          )}
          <div className={hasFigure ? "grid gap-5 md:col-span-7 md:col-start-6" : "grid gap-5 md:col-span-8"}>
            {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
            <h2 id={headingId} className="font-serif text-h3 font-light text-balance sm:text-h2">
              <HeadingText value={heading} />
            </h2>
            {body && <p className="max-w-[48ch] text-base-content/85">{body}</p>}
            {actions?.length ? (
              <div className="mt-2 flex flex-wrap gap-4">
                {actions.map((action, i) => (
                  <ButtonLink key={action._key} href={action.href} variant={i === 0 ? "brandOnBase" : "outlineOnBase"}>
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
