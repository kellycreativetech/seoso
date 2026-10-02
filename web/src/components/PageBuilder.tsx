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

type Props = { documentId: string; content: Block[] | null };

// Maps each Sanity page section to its component. Add new section types here.
// The wrapper's data-sanity attribute lets the Presentation tool outline, open and drag-reorder sections.
export function PageBuilder({ documentId, content }: Props) {
  if (!content?.length) return null;

  return (
    <div data-sanity={dataAttr({ id: documentId, type: "page", path: "content" })}>
      {content.map((block, index) => (
        <div
          key={block._key}
          data-sanity={dataAttr({ id: documentId, type: "page", path: `content[_key=="${block._key}"]` })}
        >
          {renderBlock(block, index)}
        </div>
      ))}
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
