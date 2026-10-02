import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/client";
import { token } from "@/sanity/token";

// Called by the Studio's Presentation tool with a signed secret; enables Next.js draft mode.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
