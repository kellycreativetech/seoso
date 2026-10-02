"use client";

import { usePathname } from "next/navigation";
import { useIsPresentationTool } from "next-sanity/hooks";

// Shown when someone is previewing drafts outside the Studio, so they can get back to the live site.
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();
  const pathname = usePathname();
  // null = still detecting; true = inside the Studio, which has its own controls
  if (isPresentationTool !== false) return null;

  return (
    <a
      href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
      className="btn btn-sm fixed right-4 bottom-4 z-50 border-neutral-content bg-neutral text-small font-semibold tracking-[0.1em] text-neutral-content uppercase"
    >
      Exit preview
    </a>
  );
}
