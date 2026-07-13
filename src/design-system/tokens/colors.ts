/**
 * Color tokens (Layer 1) — WBS 1.1.
 *
 * Verbatim transcription of `tokens/colors.css` (CANONICAL PALETTE: DEEP VIOLET).
 * Every `--memox-<role>` becomes `colorTokens[scheme][role]` with the SAME value
 * — no drift vs CSS. Token role names are a frozen contract (additive only).
 *
 * The ThemeProvider (WBS 1.2) resolves `light`/`dark` at runtime; components read
 * `theme.color[role]` and never branch on scheme themselves (ADR 0004).
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/colors.css
 */

/** The frozen set of colour roles. Both schemes MUST define every role. */
export type ColorRole =
  | 'bg'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceRaised'
  | 'surfaceSunken'
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'primary'
  | 'primaryStrong'
  | 'onPrimary'
  | 'primarySoft'
  | 'onPrimarySoft'
  | 'accent'
  | 'onAccent'
  | 'accentSoft'
  | 'border'
  | 'borderStrong'
  | 'divider'
  | 'success'
  | 'onSuccess'
  | 'successSoft'
  | 'onSuccessSoft'
  | 'warning'
  | 'onWarning'
  | 'warningSoft'
  | 'onWarningSoft'
  | 'error'
  | 'onError'
  | 'errorSoft'
  | 'onErrorSoft'
  | 'info'
  | 'onInfo'
  | 'infoSoft'
  | 'onInfoSoft'
  | 'stateHover'
  | 'statePressed'
  | 'stateSelected'
  | 'stateDisabled'
  | 'focusRing'
  | 'overlay'
  | 'scrim';

export type ColorScheme = 'light' | 'dark';

/** A complete colour scheme: every {@link ColorRole} → an RN colour string. */
export type ColorSchemeTokens = Record<ColorRole, string>;

const light: ColorSchemeTokens = {
  bg: '#f6f5fc',
  surface: '#ffffff',
  surfaceMuted: '#f1eff9',
  surfaceRaised: '#ffffff',
  surfaceSunken: '#eae8f4',

  text: '#1b1a26',
  textSecondary: '#67647a',
  textTertiary: '#6f6b81',

  primary: '#4b3a8c',
  primaryStrong: '#3b2d72',
  onPrimary: '#ffffff',
  primarySoft: '#f1eff9',
  onPrimarySoft: '#4b3a8c',

  accent: '#7355d6',
  onAccent: '#ffffff',
  accentSoft: '#efeafb',

  border: 'rgba(28, 24, 45, 0.11)',
  borderStrong: 'rgba(28, 24, 45, 0.22)',
  divider: 'rgba(28, 24, 45, 0.08)',

  success: '#0f7d4b',
  onSuccess: '#ffffff',
  successSoft: 'rgba(15, 125, 75, 0.12)',
  onSuccessSoft: '#0d6e42',

  warning: '#c77b12',
  onWarning: '#2a1a00',
  warningSoft: 'rgba(199, 123, 18, 0.12)',
  onWarningSoft: '#9a5f0e',

  error: '#d63a40',
  onError: '#ffffff',
  errorSoft: 'rgba(219, 62, 68, 0.1)',
  onErrorSoft: '#c1272d',

  info: '#4b3a8c',
  onInfo: '#ffffff',
  infoSoft: 'rgba(75, 58, 140, 0.1)',
  onInfoSoft: '#4b3a8c',

  stateHover: 'rgba(28, 24, 45, 0.05)',
  statePressed: 'rgba(28, 24, 45, 0.07)',
  stateSelected: 'rgba(75, 58, 140, 0.1)',
  stateDisabled: '#bebccb',
  focusRing: '#4b3a8c',
  overlay: 'rgba(28, 24, 45, 0.42)',
  scrim: 'rgba(28, 24, 45, 0.04)',
};

const dark: ColorSchemeTokens = {
  bg: '#141220',
  surface: '#252338',
  surfaceMuted: '#1c1a2b',
  surfaceRaised: '#302d46',
  surfaceSunken: '#141220',

  text: '#f4f2fb',
  textSecondary: '#bdb9d2',
  textTertiary: '#a5a1bd',

  primary: '#4b3a8c',
  primaryStrong: '#b4aadd',
  onPrimary: '#ffffff',
  primarySoft: '#302d46',
  onPrimarySoft: '#cbc3ee',

  accent: '#a88fff',
  onAccent: '#141220',
  accentSoft: 'rgba(168, 143, 255, 0.16)',

  border: 'rgba(255, 255, 255, 0.13)',
  borderStrong: 'rgba(255, 255, 255, 0.24)',
  divider: 'rgba(255, 255, 255, 0.1)',

  success: '#4fd08f',
  onSuccess: '#06320f',
  successSoft: 'rgba(34, 181, 115, 0.16)',
  onSuccessSoft: '#4fd08f',

  warning: '#ffc76f',
  onWarning: '#2a1a00',
  warningSoft: 'rgba(255, 199, 111, 0.2)',
  onWarningSoft: '#ffc76f',

  error: '#ff8a8a',
  onError: '#3b1622',
  errorSoft: 'rgba(240, 85, 90, 0.16)',
  onErrorSoft: '#ff8a8a',

  info: '#8a79e0',
  onInfo: '#141220',
  infoSoft: 'rgba(138, 121, 224, 0.18)',
  onInfoSoft: '#b4a7ec',

  stateHover: 'rgba(255, 255, 255, 0.06)',
  statePressed: 'rgba(255, 255, 255, 0.1)',
  stateSelected: 'rgba(138, 121, 224, 0.22)',
  stateDisabled: '#5c5975',
  focusRing: '#b4aadd',
  overlay: 'rgba(8, 6, 16, 0.7)',
  scrim: 'rgba(255, 255, 255, 0.04)',
};

/** Both colour schemes, keyed by {@link ColorScheme}. */
export const colorTokens: Record<ColorScheme, ColorSchemeTokens> = {
  light,
  dark,
};

/**
 * Theme-independent accent palette offered by the Theme picker (WBS 6.x).
 * These are absolute user-chosen hues, NOT the deep-violet brand palette.
 */
export const paletteAccents = {
  indigo: '#5569ff',
  violet: '#7c5cff',
  green: '#2bb673',
  coral: '#ff6b6b',
  amber: '#ff9f43',
  cyan: '#22a3c3',
} as const;

export type PaletteAccent = keyof typeof paletteAccents;
