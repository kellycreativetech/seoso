"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DRAWER_ID } from "./SiteDrawer";

// The drawer and <details> dropdowns are CSS-only; the persistent layout keeps them open
// across client navigations, so close them on route change, link click, Escape and outside click.
export function NavBehavior() {
  const pathname = usePathname();

  useEffect(() => {
    closeAll();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest(".drawer-side a")) closeDrawer();
      document.querySelectorAll<HTMLDetailsElement>("[data-site-menu] details[open]").forEach((details) => {
        if (!details.contains(target) || target.closest("a")) details.open = false;
      });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}

function closeDrawer() {
  const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement | null;
  if (toggle) toggle.checked = false;
}

function closeAll() {
  closeDrawer();
  document.querySelectorAll<HTMLDetailsElement>("[data-site-menu] details[open]").forEach((details) => {
    details.open = false;
  });
}
