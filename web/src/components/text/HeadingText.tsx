import { PortableText, type PortableTextComponents } from "next-sanity";
import type { HeadingText as HeadingTextValue } from "@/sanity/types";

type Props = { value: HeadingTextValue | null | undefined; emphasisClassName?: string };

// Renders a single-line heading value inline; the parent supplies the heading element.
export function HeadingText({ value, emphasisClassName = "italic" }: Props) {
  if (!value?.length) return null;
  const components: PortableTextComponents = {
    block: { normal: ({ children }) => <>{children}</> },
    marks: { em: ({ children }) => <em className={emphasisClassName}>{children}</em> },
  };
  return <PortableText value={value} components={components} />;
}

// Plain-text version for metadata and aria labels.
export function headingToPlainText(value: HeadingTextValue | null | undefined) {
  return value?.[0]?.children?.map((child) => child.text ?? "").join("") ?? "";
}
