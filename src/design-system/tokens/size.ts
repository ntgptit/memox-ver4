/**
 * Element size, icon size, stroke, and opacity scales (Layer 1) — WBS 1.1.
 *
 * Verbatim from `tokens/size.css`, `icon-size.css`, `stroke.css`, `opacity.css`
 * (all theme-independent, names frozen). Numbers are px except opacity (0–1).
 *
 * Sources: docs/design/MemoX Design System_v4/tokens/{size,icon-size,stroke,opacity}.css
 */

/** Fixed element dimensions (`--memox-size-*`), px. */
export const size = {
  '3xs': 4,
  '2xs': 8,
  xs: 16,
  sm: 40,
  md: 56,
  lg: 74,
  xl: 96,
  '2xl': 120,
  '3xl': 220,
  '4xl': 280,
  '5xl': 320,
} as const;

export type SizeName = keyof typeof size;

/**
 * Material Symbols glyph sizes (`--memox-icon-size-*`), px. Icon sizes that
 * coincide with the type scale (20, 24) reuse fontSize lg/xl in the kit.
 */
export const iconSize = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 32,
} as const;

export type IconSizeName = keyof typeof iconSize;

/** Border / stroke widths (`--memox-stroke-*`), px. */
export const stroke = {
  hairline: 1, // default borders, dividers
  mid: 1.5, // outline buttons / switch track inset
  emphasis: 2, // selected / state / active borders
  focus: 3, // focus & selection rings
  bold: 4, // avatar ring outer band
} as const;

export type StrokeName = keyof typeof stroke;

/** Alpha constants (`--memox-opacity-*`), 0–1. */
export const opacity = {
  disabled: 0.45, // disabled buttons / switches
  half: 0.5, // dimmed choice options
  muted: 0.55, // muted list rows
  labelSoft: 0.85, // faint sub-labels on tinted cards
  label: 0.9, // sub-labels on primary/tinted cards
} as const;

export type OpacityName = keyof typeof opacity;
