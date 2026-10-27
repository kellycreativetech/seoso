import { Marked } from "marked";
import { escapeHtml } from "./inline";

// Markdown fields (rich text, notes, summaries). Raw HTML typed into the CMS is shown as text, never rendered.
const marked = new Marked({
  gfm: true,
  renderer: {
    html: ({ text }) => escapeHtml(text),
  },
});

export function renderMarkdown(md: string | null | undefined): string {
  return md ? (marked.parse(md, { async: false }) as string).trim() : "";
}

export function renderMarkdownInline(md: string | null | undefined): string {
  return md ? (marked.parseInline(md, { async: false }) as string).trim() : "";
}
