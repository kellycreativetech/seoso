import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import type { BlockOf } from "./types";

export function VideoSection({ _key, eyebrow, heading, videos, anchorId }: BlockOf<"videoSection">) {
  const headingId = `heading-${_key}`;
  return (
    <Section id={anchorId} labelledBy={heading?.length ? headingId : undefined}>
      <SectionHeader eyebrow={eyebrow} heading={heading} headingId={headingId} />
      <ul className="grid grid-cols-1 gap-x-12 gap-y-12 border-t-2 border-base-content pt-8 md:grid-cols-2">
        {videos?.map((video) => (
          <li key={video._key} className="grid content-start gap-3">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
              title={video.title ?? "Video"}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full bg-neutral"
            />
            <h3 className="font-serif text-title">{video.title}</h3>
            {video.description && <p className="text-base-content/70">{video.description}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
