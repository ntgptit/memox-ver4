/**
 * Typography tokens (Layer 1) — WBS 1.1.
 *
 * Verbatim from `tokens/typography.css` (family: Plus Jakarta Sans, names frozen).
 * Font sizes/weights/line-heights/letter-spacing become typed primitives here.
 * The actual variable-font LOADING is WBS 1.3 (`expo-font`); this module only
 * carries the values. Composed text roles (theme.type[role]) are assembled by the
 * theme (WBS 1.2) from these primitives.
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/typography.css
 */

/**
 * Font families. The loaded variable font is registered as `PlusJakartaSans`
 * (WBS 1.3); the fallback stack matches the CSS `--memox-font-sans` intent.
 * RN resolves a single family name per platform once the font is loaded.
 */
export const fontFamily = {
  sans: 'Plus Jakarta Sans',
  mono: 'monospace',
} as const;

export type FontFamilyName = keyof typeof fontFamily;

/** Font sizes (`--memox-font-size-*`), verbatim px. */
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
  '4xl': 48,
} as const;

export type FontSizeName = keyof typeof fontSize;

/** Font weights (`--memox-font-weight-*`). RN takes weights as strings. */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export type FontWeightName = keyof typeof fontWeight;

/**
 * Line-height multipliers (`--memox-line-height-*`), verbatim.
 * These are unitless ratios; RN `lineHeight` needs px, so the theme (WBS 1.2)
 * multiplies a ratio by its role's `fontSize` when composing a text style.
 */
export const lineHeightRatio = {
  none: 1,
  tight: 1.15,
  snug: 1.32,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export type LineHeightName = keyof typeof lineHeightRatio;

/**
 * Letter spacing (`--memox-letter-spacing-*`). CSS uses `em`; RN `letterSpacing`
 * is absolute px, so these are expressed as an em multiplier to be resolved
 * against a role's font size by the theme (WBS 1.2). Values match the CSS ems.
 */
export const letterSpacingEm = {
  tight: -0.02,
  normal: 0,
  wide: 0.04,
  caps: 0.08,
} as const;

export type LetterSpacingName = keyof typeof letterSpacingEm;
