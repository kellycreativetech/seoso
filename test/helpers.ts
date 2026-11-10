import { experimental_AstroContainer as AstroContainer } from "astro/container";

// Renders an Astro component to an HTML string for assertions.
export async function render(component: any, props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props, slots });
}

/** Wrapper elements PageBuilder emits, one per rendered section. */
export function sectionWrappers(html: string): string[] {
  return [...html.matchAll(/<div[^>]*data-section[^>]*>/g)].map((m) => m[0]);
}
