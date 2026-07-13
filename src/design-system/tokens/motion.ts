/**
 * Motion tokens: durations + easings (Layer 1) — WBS 1.1.
 *
 * Verbatim from `tokens/motion.css` (theme-independent, names frozen). Durations
 * are ms numbers (RN `Animated`/`withTiming` take ms). Easings are cubic-bezier
 * control-point tuples `[x1, y1, x2, y2]`, usable with `Easing.bezier(...)` — the
 * same four numbers as the CSS `cubic-bezier(...)`, so no drift.
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/motion.css
 */

/** Transition + loop durations (`--memox-duration-*`), ms. */
export const duration = {
  instant: 80, // micro: switch, ripple, press feedback
  fast: 140, // small: hover/press, chip, tab, segmented
  base: 220, // default: card, fade, sheet content
  slow: 320, // large / overlay: dialog, drawer, page
  flash: 300, // feedback reveal (correct-match tile flash)
  pulse: 1300, // ambient loop period (skeleton shimmer)
} as const;

export type DurationName = keyof typeof duration;

/** Cubic-bezier control points `[x1, y1, x2, y2]` (`--memox-ease-*`). */
export const easing = {
  standard: [0.2, 0, 0, 1], // most in-place transitions
  decelerate: [0, 0, 0, 1], // enter: element settling in
  accelerate: [0.3, 0, 1, 1], // exit: element leaving
} as const;

export type EasingName = keyof typeof easing;
export type BezierPoints = readonly [number, number, number, number];
