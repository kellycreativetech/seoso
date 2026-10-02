import type { StegaBranded } from "next-sanity";
import type { SETTINGS_QUERY_RESULT } from "@/sanity/types";

export type Settings = NonNullable<StegaBranded<SETTINGS_QUERY_RESULT>>;
export type NavItem = NonNullable<Settings["navigation"]>[number];
