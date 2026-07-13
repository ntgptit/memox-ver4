/**
 * Radius scale (Layer 1) — WBS 1.1.
 *
 * Verbatim from `tokens/radius.css` (names frozen). Includes the role aliases
 * (card/tile/control/field/chip/pill/full). `999`/`9999` are the CSS pill/full
 * sentinels; in RN a large radius on a pill element still renders as a full round.
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/radius.css
 */

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 28,

  // role aliases
  card: 20,
  tile: 16,
  control: 12,
  field: 14,
  chip: 999,
  pill: 999,
  full: 9999,
} as const;

export type RadiusName = keyof typeof radius;
