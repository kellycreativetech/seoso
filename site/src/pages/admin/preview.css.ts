import type { APIRoute } from "astro";
import css from "../../styles/global.css?inline";

// The site's compiled CSS at a stable URL, loaded into the CMS preview pane (CMS.registerPreviewStyle).
export const GET: APIRoute = () => new Response(css, { headers: { "Content-Type": "text/css; charset=utf-8" } });
