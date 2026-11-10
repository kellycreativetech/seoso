// Gallery overlay for photos and YouTube videos (PhotoSwipe 5). Markup contract, set by Gallery.astro and Video.astro:
// a `[data-lightbox]` container whose `a` children each open one slide.
// - Photos: `href` = full-size image, with `data-pswp-width` / `data-pswp-height`.
// - Videos: `href` = the YouTube watch page (the no-JS fallback) and `data-youtube-id`; the slide is a
//   youtube-nocookie player that loads only while its slide is shown, so swiping away stops it.
// Without JavaScript every link still works (image file / YouTube page).

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The HTML of a video slide. The player URL sits in `data-src` until the slide becomes active. */
export function youtubeSlideHtml(youtubeId: string, title: string): string {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
  return (
    `<div class="flex h-full w-full items-center justify-center p-4 sm:p-16">` +
    `<iframe data-src="${escape(src)}" title="${escape(title)}" ` +
    `allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen ` +
    `class="aspect-video w-full max-w-[calc((100dvh-8rem)*16/9)] bg-neutral"></iframe></div>`
  );
}

/** Browser side: opens every `[data-lightbox]` container's links in the overlay. */
export async function initLightbox(root: ParentNode = document) {
  const galleries = [...root.querySelectorAll<HTMLElement>("[data-lightbox]")];
  if (!galleries.length) return;
  const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
  await import("photoswipe/style.css");

  for (const gallery of galleries) {
    const lightbox = new PhotoSwipeLightbox({
      gallery,
      children: "a",
      pswpModule: () => import("photoswipe"),
      bgOpacity: 0.95,
      showHideAnimationType: "fade",
    });
    lightbox.addFilter("itemData", (itemData) => {
      const link = itemData.element as HTMLElement | undefined;
      const youtubeId = link?.dataset.youtubeId;
      if (!youtubeId) return itemData;
      return { html: youtubeSlideHtml(youtubeId, link.dataset.title ?? "Video") };
    });
    // Load a video only on its own slide; unloading it when the slide changes stops playback.
    lightbox.on("contentActivate", ({ content }) => {
      const frame = content.element?.querySelector<HTMLIFrameElement>("iframe[data-src]");
      if (frame) frame.src = frame.dataset.src!;
    });
    lightbox.on("contentDeactivate", ({ content }) => {
      const frame = content.element?.querySelector<HTMLIFrameElement>("iframe[data-src]");
      if (frame) frame.removeAttribute("src");
    });
    lightbox.init();
  }
}
