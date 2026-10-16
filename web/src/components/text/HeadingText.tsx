import { vercelStegaSplit } from "@vercel/stega";
import { PortableText, type PortableTextComponents, type StegaBranded } from "next-sanity";
import { splitStega } from "@/sanity/stega";
import type { HeadingText as HeadingTextValue, HeadingTextWithStrike } from "@/sanity/types";

type Value =
  | HeadingTextValue
  | StegaBranded<HeadingTextValue>
  | HeadingTextWithStrike
  | StegaBranded<HeadingTextWithStrike>
  | null
  | undefined;
type Props = { value: Value; emphasisClassName?: string };

// Renders a single-line heading value inline; the parent supplies the heading element.
export function HeadingText({ value, emphasisClassName = "italic" }: Props) {
  if (!value?.length) return null;
  const { blocks, attr } = stripStega(value);
  const components: PortableTextComponents = {
    block: { normal: ({ children }) => <>{children}</> },
    marks: {
      em: ({ children }) => <em className={emphasisClassName}>{children}</em>,
      "strike-through": ({ children }) => <s>{children}</s>,
    },
  };
  const content = <PortableText value={blocks} components={components} />;
  return attr ? <span data-sanity={attr}>{content}</span> : content;
}

// In draft mode every span carries an invisible stega payload. Inline, those payloads give one
// overlay per span (the <em> overlay stacks over the heading) and, with the headings' negative
// letter-spacing, collapse the text in Safari/Firefox. Strip them from every span and expose the
// heading as a single data-sanity target instead (see sanity/stega.ts). No-op outside draft mode.
function stripStega(value: NonNullable<Value>) {
  let encoded = "";
  const blocks = value.map((block) => ({
    ...block,
    children: block.children?.map((child) => {
      if (typeof child.text !== "string") return child;
      const split = vercelStegaSplit(child.text);
      if (!encoded && split.encoded) encoded = split.encoded;
      return { ...child, text: split.cleaned };
    }),
  }));
  return { blocks, attr: encoded ? splitStega(encoded).attr : undefined };
}
