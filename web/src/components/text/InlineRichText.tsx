import { PortableText, type PortableTextComponents, type StegaBranded } from "next-sanity";
import type { InlineRichText as InlineRichTextValue } from "@/sanity/types";

const components: PortableTextComponents = {
  block: { normal: ({ children }) => <p>{children}</p> },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-base-content">{children}</strong>,
    link: ({ value, children }) => (
      <a href={value?.href} className="link link-secondary">
        {children}
      </a>
    ),
  },
};

type Value = InlineRichTextValue | StegaBranded<InlineRichTextValue> | null | undefined;

export function InlineRichText({ value }: { value: Value }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
