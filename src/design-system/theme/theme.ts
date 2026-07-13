/**
 * Theme resolution (Layer between tokens and components) — WBS 1.2.
 *
 * `resolveTheme(scheme)` turns the raw {@link tokens} (WBS 1.1) into the active
 * `Theme` a component reads: colours + elevation resolved for the scheme, plus
 * the theme-independent scales passed through. Components read `theme.*` and
 * NEVER branch on the scheme themselves (ADR 0004) — this function is the only
 * place light/dark is chosen.
 *
 * Typography: the kit has no named type roles — every component composes text
 * from the size/weight/line-height/tracking PRIMITIVES inline. So the theme
 * exposes those primitives plus a `font.text(spec)` composer that mirrors that
 * pattern (ratio→px line-height, em→px tracking), instead of inventing roles.
 */

import type { TextStyle } from 'react-native';

import {
  colorTokens,
  paletteAccents,
  space,
  layout,
  radius,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeightRatio,
  letterSpacingEm,
  elevationTokens,
  focusRingWidth,
  duration,
  easing,
  size,
  iconSize,
  stroke,
  opacity,
  comp,
} from '../tokens';
import type {
  ColorScheme,
  ColorSchemeTokens,
  ElevationName,
  ShadowStyle,
  FontFamilyName,
  FontSizeName,
  FontWeightName,
  LineHeightName,
  LetterSpacingName,
  PaletteAccent,
} from '../tokens';

/** Spec for {@link Theme.font.text} — a size is required, the rest default. */
export interface TextStyleSpec {
  size: FontSizeName;
  weight?: FontWeightName;
  lineHeight?: LineHeightName;
  letterSpacing?: LetterSpacingName;
  family?: FontFamilyName;
}

export interface ThemeFont {
  family: typeof fontFamily;
  size: typeof fontSize;
  weight: typeof fontWeight;
  lineHeightRatio: typeof lineHeightRatio;
  letterSpacingEm: typeof letterSpacingEm;
  /** Compose an RN text style from primitives, the way the kit composes inline. */
  text: (spec: TextStyleSpec) => TextStyle;
}

/** The resolved theme handed to components for the active colour scheme. */
export interface Theme {
  scheme: ColorScheme;
  color: ColorSchemeTokens;
  space: typeof space;
  layout: typeof layout;
  radius: typeof radius;
  font: ThemeFont;
  elevation: Record<ElevationName, ShadowStyle>;
  focusRingWidth: number;
  duration: typeof duration;
  easing: typeof easing;
  size: typeof size;
  iconSize: typeof iconSize;
  stroke: typeof stroke;
  opacity: typeof opacity;
  /** Fixed control geometry (`--memox-comp-*`, tokens/component.css). */
  comp: typeof comp;
  paletteAccents: typeof paletteAccents;
}

/** A user accent choice: the deep-violet `brand` default, or a palette accent. */
export type AccentChoice = 'brand' | PaletteAccent;

/** User theme overrides (WBS 2.3): accent colour + a type scale multiplier. */
export interface ThemeOptions {
  accent?: AccentChoice;
  /** Multiplier applied to every composed font size (e.g. 0.9 / 1 / 1.15). */
  textScale?: number;
}

function makeFont(textScale: number): ThemeFont {
  return {
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    lineHeightRatio,
    letterSpacingEm,
    text: ({ size: s, weight, lineHeight, letterSpacing, family }: TextStyleSpec): TextStyle => {
      const px = Math.round(fontSize[s] * textScale);
      return {
        fontFamily: fontFamily[family ?? 'sans'],
        fontSize: px,
        fontWeight: fontWeight[weight ?? 'regular'],
        lineHeight: Math.round(px * lineHeightRatio[lineHeight ?? 'normal']),
        letterSpacing: px * letterSpacingEm[letterSpacing ?? 'normal'],
      };
    },
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Build the active {@link Theme} for a colour scheme, applying the user's accent and
 * text-scale overrides (WBS 2.3). Pure; memoize per (scheme, accent, textScale).
 */
export function resolveTheme(scheme: ColorScheme, opts: ThemeOptions = {}): Theme {
  const { accent = 'brand', textScale = 1 } = opts;
  let color = colorTokens[scheme];
  if (accent !== 'brand') {
    const hex = paletteAccents[accent];
    color = { ...color, accent: hex, accentSoft: hexToRgba(hex, 0.16) };
  }
  return {
    scheme,
    color,
    space,
    layout,
    radius,
    font: makeFont(textScale),
    elevation: elevationTokens[scheme],
    focusRingWidth,
    duration,
    easing,
    size,
    iconSize,
    stroke,
    opacity,
    comp,
    paletteAccents,
  };
}

/** Pre-resolved themes, so the provider can select without rebuilding each render. */
export const themes: Record<ColorScheme, Theme> = {
  light: resolveTheme('light'),
  dark: resolveTheme('dark'),
};
