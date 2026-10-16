import { dataAttr } from "@/sanity/data-attribute";
import { ContactSection } from "./sections/ContactSection";
import { EventsSection } from "./sections/EventsSection";
import { GallerySection } from "./sections/GallerySection";
import { Hero } from "./sections/Hero";
import { HighlightBand } from "./sections/HighlightBand";
import { NewsSection } from "./sections/NewsSection";
import { PeopleSection } from "./sections/PeopleSection";
import { TextSection } from "./sections/TextSection";
import type { Block } from "./sections/types";
import { VenuesSection } from "./sections/VenuesSection";
import { VideoSection } from "./sections/VideoSection";

type Props = { documentId: string; content: Block[] | null; rotateTones?: boolean };

// "stage" sections are black: they scope the dark theme's palette onto pure black, so the base-* colors inside
// any section (text, rules, links) read correctly on black in both themes. "base" sections use the page surface.
type Tone = "stage" | "base";

// By default the masthead and highlight bands are black. With `rotateTones` (home page) the first two sections
// are black and the rest alternate base / black.
function toneFor(block: Block, index: number, rotateTones: boolean): Tone {
  if (rotateTones) return index < 2 || index % 2 === 1 ? "stage" : "base";
  return block._type === "hero" || block._type === "highlightBand" ? "stage" : "base";
}

// Maps each Sanity page section to its component. Add new section types here.
// The wrapper's data-sanity attribute lets the Presentation tool outline, open and drag-reorder sections.
export function PageBuilder({ documentId, content, rotateTones = false }: Props) {
  if (!content?.length) return null;

  return (
    <div data-sanity={dataAttr({ id: documentId, type: "page", path: "content" })}>
      {content.map((block, index) => {
        const isStage = toneFor(block, index, rotateTones) === "stage";
        return (
          <div
            key={block._key}
            data-sanity={dataAttr({ id: documentId, type: "page", path: `content[_key=="${block._key}"]` })}
            data-theme={isStage ? "seoso-dark" : undefined}
            className={isStage ? "bg-neutral text-base-content" : undefined}
          >
            {renderBlock(block, index)}
          </div>
        );
      })}
    </div>
  );
}

function renderBlock(block: Block, index: number) {
  switch (block._type) {
    case "hero":
      return <Hero key={block._key} {...block} isFirst={index === 0} />;
    case "eventsSection":
      return <EventsSection key={block._key} {...block} />;
    case "highlightBand":
      return <HighlightBand key={block._key} {...block} />;
    case "newsSection":
      return <NewsSection key={block._key} {...block} />;
    case "textSection":
      return <TextSection key={block._key} {...block} />;
    case "peopleSection":
      return <PeopleSection key={block._key} {...block} />;
    case "contactSection":
      return <ContactSection key={block._key} {...block} />;
    case "venuesSection":
      return <VenuesSection key={block._key} {...block} />;
    case "gallerySection":
      return <GallerySection key={block._key} {...block} />;
    case "videoSection":
      return <VideoSection key={block._key} {...block} />;
    default:
      return null;
  }
}
