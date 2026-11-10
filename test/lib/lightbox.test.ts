import { expect, test } from "vitest";
import { youtubeSlideHtml } from "../../src/lib/lightbox";

test("a video slide plays through youtube-nocookie, autoplaying, loaded only when the slide is shown", () => {
  const html = youtubeSlideHtml("Wvj1FS44Jok", "Instruments");
  expect(html).toContain('data-src="https://www.youtube-nocookie.com/embed/Wvj1FS44Jok?autoplay=1&amp;rel=0"');
  expect(html).not.toMatch(/\ssrc=/);
  expect(html).toContain('title="Instruments"');
});

test("titles and IDs are escaped", () => {
  const html = youtubeSlideHtml('x"><script>', '"A" & <B>');
  expect(html).not.toContain("<script>");
  expect(html).toContain('title="&quot;A&quot; &amp; &lt;B&gt;"');
});
