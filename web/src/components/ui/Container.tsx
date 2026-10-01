import type { ReactNode } from "react";

// The site measure: 74rem max width with responsive gutters. Put layout classes on a child.
export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[74rem] px-4 sm:px-8 lg:px-12">{children}</div>;
}
