// Past concerts drop off in the visitor's browser, so the site needn't be rebuilt when one ends.
// Pages are prerendered with every event that was upcoming at build time; each row carries `data-past-at`
// (pastAt() in lib/events.ts, an absolute instant, so the visitor's time zone doesn't matter) and this hides the
// rows whose instant has passed. The server uses the same function, so the first paint matches what the script
// would show and nothing jumps when it runs.

export type RolloverItem = { kind: "year" } | { kind: "event"; pastAt: number };

/** Which list items show at `now`: events not yet past (at most `limit`), and year headings with an event under them. */
export function rolloverVisibility(items: RolloverItem[], now: number, limit?: number | null) {
  let shown = 0;
  const visible = items.map((item) => {
    if (item.kind === "year") return false;
    const show = item.pastAt > now && (!limit || shown < limit);
    if (show) shown++;
    return show;
  });
  // A year heading shows when any event before the next heading shows.
  items.forEach((item, i) => {
    if (item.kind !== "year") return;
    for (let j = i + 1; j < items.length && items[j].kind !== "year"; j++) if (visible[j]) visible[i] = true;
  });
  return { visible, empty: shown === 0 };
}

/**
 * Browser side. Lists: `[data-rollover]` (optional `data-limit`) whose `li`s are year rows or `data-past-at` rows;
 * an element `[data-rollover-empty]` beside the list is shown instead of it once nothing is left.
 * Single elements: `[data-show-until]` is hidden from that instant, `[data-show-from]` is shown from it.
 */
export function applyRollover(root: ParentNode, now = Date.now()) {
  for (const list of root.querySelectorAll<HTMLElement>("[data-rollover]")) {
    const rows = [...list.querySelectorAll<HTMLElement>(":scope > li")];
    const items: RolloverItem[] = rows.map((row) =>
      row.dataset.pastAt ? { kind: "event", pastAt: Date.parse(row.dataset.pastAt) } : { kind: "year" },
    );
    const { visible, empty } = rolloverVisibility(items, now, Number(list.dataset.limit) || null);
    rows.forEach((row, i) => (row.hidden = !visible[i]));
    const emptyMessage = list.parentElement?.querySelector<HTMLElement>(":scope > [data-rollover-empty]");
    if (emptyMessage) {
      list.hidden = empty;
      emptyMessage.hidden = !empty;
    }
  }
  for (const el of root.querySelectorAll<HTMLElement>("[data-show-until]")) el.hidden = now >= Date.parse(el.dataset.showUntil!);
  for (const el of root.querySelectorAll<HTMLElement>("[data-show-from]")) el.hidden = now < Date.parse(el.dataset.showFrom!);
}
