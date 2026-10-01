import { PortableText, type PortableTextComponents } from "next-sanity";
import type { BlockContent } from "@/sanity/types";
import { SanityImage } from "@/components/ui/SanityImage";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 mb-3 font-serif text-title">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 mb-2 font-serif text-lead">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-6 mb-2 font-semibold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-primary pl-5 font-serif text-lead italic">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="my-4">{children}</p>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 space-y-2 pl-6 [list-style-type:disc] marker:text-secondary">{children}</ul>
    ),
    number: ({ children }) => <ol className="my-4 space-y-2 pl-6 [list-style-type:decimal]">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} className="link link-secondary">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <SanityImage
        value={{
          asset: value.asset ? { _id: value.asset._ref, metadata: null } : null,
          alt: value.alt,
          hotspot: value.hotspot,
          crop: value.crop,
        }}
        width={1200}
        height={675}
        className="my-8 h-auto w-full"
        sizes="(min-width: 768px) 768px, 100vw"
        loading="lazy"
      />
    ),
  },
};

export function RichText({ value }: { value: BlockContent | null | undefined }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
