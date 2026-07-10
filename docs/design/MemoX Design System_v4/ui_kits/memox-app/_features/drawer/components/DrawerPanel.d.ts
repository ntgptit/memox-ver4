/**
 * Drawer slide-out panel (the "open" state): today's activity header + a nav list.
 *
 * The kit renders this as a **static fixture** — it hardcodes the activity line
 * (12:45 · 24 words) and the ITEMS list, so it exposes **no props**. The Flutter
 * `DrawerPanel` parameterizes `activity` + `items` — recorded as
 * fixture-parameterized exceptions.
 */
export interface DrawerPanelProps {}

export function DrawerPanel(): JSX.Element;
