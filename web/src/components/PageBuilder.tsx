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

// Maps each Sanity page section to its component. Add new section types here.
export function PageBuilder({ content }: { content: Block[] | null }) {
  if (!content?.length) return null;

  return (
    <>
      {content.map((block, index) => {
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
      })}
    </>
  );
}
