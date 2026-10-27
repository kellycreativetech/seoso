// Live preview: the site renders the entry being edited with its real Astro components (POST /api/preview,
// see site/src/pages/api/preview.astro) and this template shows that HTML in the preview pane.
// Uses the React bundled with Sveltia (CMS.React), so there's nothing to build or install.
(() => {
  const { createElement: h, useEffect, useState } = CMS.React;
  const UPLOADS = "../../assets/uploads/";

  // Images saved in the repo are referenced relative to the content file; unsaved uploads only exist in the
  // browser. getAsset() turns either into a URL the preview can load.
  function resolveAssets(value, getAsset) {
    if (typeof value === "string") return value.startsWith(UPLOADS) ? getAsset(value)?.toString() || value : value;
    if (Array.isArray(value)) return value.map((item) => resolveAssets(item, getAsset));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveAssets(item, getAsset)]));
    }
    return value;
  }

  const message = (text) =>
    `<p role="status" style="font: 16px system-ui, sans-serif; padding: 1rem 1.5rem">${text}</p>`;

  function previewFor(collection) {
    return function Preview({ entry, getAsset }) {
      const data = entry.get("data")?.toJS?.() ?? {};
      const slug = entry.get("slug");
      const key = JSON.stringify([slug, data]);
      const [html, setHtml] = useState(message("Loading preview…"));

      useEffect(() => {
        const controller = new AbortController();
        // Wait for a pause in typing before asking the site to render.
        const timer = setTimeout(async () => {
          try {
            const res = await fetch("/api/preview", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ collection, slug, data: resolveAssets(data, getAsset) }),
              signal: controller.signal,
            });
            setHtml(res.ok ? await res.text() : message(`The preview couldn’t be rendered (${res.status}).`));
          } catch (error) {
            if (error.name !== "AbortError") setHtml(message("The preview is unavailable. Check your connection."));
          }
        }, 300);
        return () => {
          clearTimeout(timer);
          controller.abort();
        };
      }, [key]);

      return h("div", { dangerouslySetInnerHTML: { __html: html } });
    };
  }

  CMS.registerPreviewStyle("/admin/preview.css");
  for (const collection of ["pages", "snippets", "events", "news"]) {
    CMS.registerPreviewTemplate(collection, previewFor(collection));
  }
})();
