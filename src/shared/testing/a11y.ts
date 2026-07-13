/**
 * Shared accessibility test helpers (WBS 11.3) — TEST-ONLY.
 *
 * A WCAG contrast checker (over the design tokens) plus small assertion helpers for
 * roles, labels and touch-target size. Every screen/component slice reuses these so
 * the a11y contract is enforced in one place, not re-derived per test.
 */

import { StyleSheet, type ViewStyle } from 'react-native';

// --- colour + contrast (WCAG 2.1) ---------------------------------------------

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parse a `#rgb`/`#rrggbb`/`#rrggbbaa` or `rgb()/rgba()` colour string. */
export function parseColor(color: string): Rgba {
  const c = color.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) {
      h = h
        .split('')
        .map((x) => x + x)
        .join('');
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(',').map((p) => Number(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  throw new Error(`Unsupported colour: ${color}`);
}

/** Alpha-composite `fg` over an opaque `bg`, returning an opaque colour. */
export function compositeOver(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an opaque colour. */
export function relativeLuminance(c: Rgba): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/**
 * WCAG contrast ratio between a foreground and background colour string. If either
 * has alpha, it is composited over `base` (default white) first.
 */
export function contrastRatio(fg: string, bg: string, base = '#ffffff'): number {
  const baseRgb = parseColor(base);
  const f = compositeOver(parseColor(fg), baseRgb);
  const b = compositeOver(parseColor(bg), baseRgb);
  const lf = relativeLuminance(f);
  const lb = relativeLuminance(b);
  const [hi, lo] = lf > lb ? [lf, lb] : [lb, lf];
  return (hi + 0.05) / (lo + 0.05);
}

/** Does the pair meet WCAG AA? 4.5:1 for normal text, 3:1 for large text/UI. */
export function meetsContrastAA(fg: string, bg: string, opts: { large?: boolean; base?: string } = {}): boolean {
  return contrastRatio(fg, bg, opts.base) >= (opts.large ? 3 : 4.5);
}

// --- touch target -------------------------------------------------------------

/** The minimum touch target MemoX enforces (px). */
export const MIN_TOUCH_TARGET = 44;

/** Flatten an RNTL node's `style` prop to a plain object. */
export function flatStyle(node: { props: { style?: unknown } }): ViewStyle {
  return (StyleSheet.flatten(node.props.style as ViewStyle) ?? {}) as ViewStyle;
}
