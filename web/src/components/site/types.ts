import type { SETTINGS_QUERY_RESULT } from "@/sanity/types";

export type Settings = NonNullable<SETTINGS_QUERY_RESULT>;
export type NavItem = NonNullable<Settings["navigation"]>[number];
