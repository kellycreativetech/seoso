import { HeadingText } from "@/components/text/HeadingText";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SanityImage } from "@/components/ui/SanityImage";
import type { BlockOf } from "./types";

// Black masthead. With an image, the photo fades in beneath the copy.
export function Hero({ eyebrow, heading, lead, actions, image, isFirst }: BlockOf<"hero"> & { isFirst: boolean }) {
  const hasImage = Boolean(image?.asset);
  const HeadingTag = isFirst ? "h1" : "h2";

  return (
    <section className="overflow-hidden bg-neutral text-neutral-content">
      <Container>
        <div
          className={
            hasImage
              ? "relative z-[2] grid grid-cols-1 gap-6 pt-12 sm:grid-cols-12 sm:pt-20 lg:pt-24"
              : "relative z-[2] grid grid-cols-1 gap-6 pt-12 pb-16 sm:grid-cols-12 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24"
          }
        >
          {eyebrow && (
            <div className="sm:col-span-12">
              <Eyebrow tone="brand">{eyebrow}</Eyebrow>
            </div>
          )}
          <HeadingTag className="font-serif text-h1 font-light tracking-[-0.015em] text-balance sm:col-span-10 md:text-[4.25rem] md:leading-none lg:col-span-8 lg:text-display">
            <HeadingText value={heading} emphasisClassName="font-normal text-primary italic" />
          </HeadingTag>
          {lead && (
            <p className="max-w-[34ch] font-serif text-lead text-neutral-content/90 sm:col-span-8 lg:col-span-6">
              {lead}
            </p>
          )}
          {actions?.length ? (
            <div className="mt-2 flex flex-wrap gap-4 sm:col-span-12">
              {actions.map((action, i) => (
                <ButtonLink key={action._key} href={action.href} variant={i === 0 ? "brand" : "outlineOnDark"}>
                  {action.label}
                </ButtonLink>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
      {hasImage && (
        <div className="relative z-[1] mt-6 sm:-mt-16 lg:-mt-24">
          <SanityImage
            value={image}
            width={1920}
            height={672}
            priority
            sizes="100vw"
            className="aspect-[5/4] h-auto w-full object-cover object-[50%_54%] [mask-image:linear-gradient(to_bottom,transparent_0,#000_30%,#000_75%,transparent_100%)] sm:aspect-[16/5.6]"
          />
        </div>
      )}
    </section>
  );
}
