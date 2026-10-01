import type { ReactNode } from "react";
import { X } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NavLink } from "./NavLink";
import type { Settings } from "./types";

export const DRAWER_ID = "site-drawer";

// daisyUI drawer wrapping the whole page; the sidebar is the mobile menu (below lg).
// The header's Menu button is a <label htmlFor={DRAWER_ID}>.
export function SiteDrawer({ settings, children }: { settings: Settings | null; children: ReactNode }) {
  return (
    <div className="drawer drawer-end">
      <input id={DRAWER_ID} type="checkbox" className="drawer-toggle" aria-label="Toggle menu" />
      <div className="drawer-content flex min-h-screen flex-col">{children}</div>
      <div className="drawer-side z-30">
        <label htmlFor={DRAWER_ID} aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-80 max-w-[85vw] flex-col gap-6 bg-neutral p-4 text-neutral-content">
          <div className="flex justify-end">
            <label htmlFor={DRAWER_ID} className="btn btn-sm btn-ghost text-neutral-content" aria-label="Close menu">
              <X aria-hidden="true" className="size-5" />
            </label>
          </div>
          <ul className="menu menu-lg w-full">
            {settings?.navigation?.map((item) => (
              <li key={item._key}>
                <NavLink href={item.href}>{item.label}</NavLink>
                {item.children?.length ? (
                  <ul>
                    {item.children.map((child) => (
                      <li key={child._key}>
                        <NavLink href={child.href}>{child.label}</NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {settings?.donateLink?.href && (
            <ButtonLink href={settings.donateLink.href} variant="brandBlock">
              {settings.donateLink.label}
            </ButtonLink>
          )}
        </aside>
      </div>
    </div>
  );
}
