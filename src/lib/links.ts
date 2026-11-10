// One link shape everywhere: a page picked in the CMS, or a typed path / #anchor / URL.
export type Link = { label: string; href?: string | null; page?: string | null };

export function resolveHref(link: Link): string | null {
  if (link.page) return link.page === "home" ? "/" : `/${link.page}`;
  return link.href || null;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
