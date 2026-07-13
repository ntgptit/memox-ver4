/**
 * Spacing scale + layout rhythm (Layer 1) — WBS 1.1.
 *
 * Verbatim from `tokens/spacing.css` (4px base, names frozen). Values are numbers
 * (RN uses unitless px). The `--memox-safe-area-top` CSS token is a SafeArea inset
 * resolved at runtime (RN `SafeAreaView` top inset), not a static number, so it is
 * intentionally NOT a value here — see WBS 2.1 shell.
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/spacing.css
 */

/** Full spacing scale (`--memox-space-*`), verbatim px values. */
export const space = {
  0: 0,
  '05': 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
} as const;

export type SpaceStep = keyof typeof space;

/**
 * The spacing values a SCREEN may use, per the mobile-ui construction contract
 * (§4: spacing restricted to {4,8,12,16,24,32,48}). The full {@link space} scale
 * exists for the token/component layer (no CSS drift); WBS 0.12's guard enforces
 * that screens stay on this subset.
 */
export const SPACING_CONTRACT_SUBSET = [4, 8, 12, 16, 24, 32, 48] as const;

/** Layout rhythm constants (`--memox-*`), verbatim px values. */
export const layout = {
  gutter: 16, // screen edge padding (phone) — contract: horizontal padding = 16
  appBarHeight: 56, // single compact app-bar height (minimal M3)
  bottomNavHeight: 80, // M3 navigation bar spec
  fabSize: 56, // M3 standard FAB
  touchMin: 48, // minimum touch target
  safeAreaTopFallback: 24, // kit's fixed inset; real device uses SafeArea inset when larger
} as const;

export type LayoutKey = keyof typeof layout;
