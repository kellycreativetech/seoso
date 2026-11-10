// Headings are one line of inline Markdown: *italic* and ~~strikethrough~~ only. Everything else is escaped.
const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export function renderInline(md: string): string {
  return escapeHtml(md)
    .replace(/\*\*(.+?)\*\*/g, "$1") // headings have no bold; show **text** as plain text
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/\*(\S(?:.*?\S)?)\*/g, "<em>$1</em>");
}
