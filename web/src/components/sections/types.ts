import type { StegaBranded } from "next-sanity";
import type { PAGE_QUERY_RESULT } from "@/sanity/types";

// Strings may carry stega (click-to-edit) characters in draft mode; clean before comparing.
export type Block = NonNullable<NonNullable<StegaBranded<PAGE_QUERY_RESULT>>["content"]>[number];
export type BlockOf<T extends Block["_type"]> = Extract<Block, { _type: T }>;
