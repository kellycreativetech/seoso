import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { token } from "./token";

// `sanityFetch` serves cached published content and, with <SanityLive /> in the layout,
// revalidates it the moment content is published. In draft mode it fetches drafts with stega.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  // Only sent to the browser while draft mode is on, for live draft updates outside the Studio.
  browserToken: token,
});
