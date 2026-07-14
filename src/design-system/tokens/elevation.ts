/**
 * Elevation / shadow tokens (Layer 1) — WBS 1.1.
 *
 * CSS `box-shadow` (multi-layer) cannot be expressed 1:1 in RN, which supports a
 * single iOS shadow (`shadowColor/Offset/Opacity/Radius`) plus an Android
 * `elevation`. Per ADR 0004 each token is mapped to that RN shape, derived from
 * the DOMINANT CSS layer; in dark mode the token is a hairline ring (the CSS uses
 * `0 0 0 1px …`), mapped to REAL `borderColor`/`borderWidth` style props so that
 * spreading the token into a `ViewStyle` renders the ring (`nav` is directional —
 * `0 -1px 0` — so it maps to a top-only border). The verbatim CSS string is
 * retained as `webShadow` so parity with the kit is auditable and there is no
 * silent drift on the values that CAN be 1:1.
 *
 * Source of truth: docs/design/MemoX Design System_v4/tokens/elevation.css
 */

import type { ColorScheme } from './colors';

/** RN-native shadow style, usable directly as a `ViewStyle` fragment. */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Android elevation (dp). */
  elevation: number;
  /**
   * Dark-mode hairline ring (`0 0 0 1px` layer) as real border props — RN drops
   * unknown style keys silently, so these MUST be genuine `ViewStyle` fields.
   */
  borderColor?: string;
  borderWidth?: number;
  /** Directional dark-mode hairline (`0 -1px 0` layer on `nav`). */
  borderTopColor?: string;
  borderTopWidth?: number;
  /** Verbatim CSS `box-shadow` value, for parity auditing (not used by RN). */
  webShadow: string;
}

export type ElevationName = 'sm' | 'card' | 'lg' | 'fab' | 'nav';

const light: Record<ElevationName, ShadowStyle> = {
  sm: {
    shadowColor: 'rgba(120, 112, 158, 1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
    webShadow: '0 2px 3px rgba(120, 112, 158, 0.18), 0 1px 1px rgba(120, 112, 158, 0.3)',
  },
  card: {
    shadowColor: 'rgba(120, 112, 158, 1)',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    webShadow: '0 9px 16px rgba(120, 112, 158, 0.18), 0 2px 2px rgba(120, 112, 158, 0.28)',
  },
  lg: {
    shadowColor: 'rgba(75, 58, 140, 1)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
    webShadow: '0 18px 40px rgba(75, 58, 140, 0.18), 0 4px 8px rgba(120, 112, 158, 0.24)',
  },
  fab: {
    shadowColor: 'rgba(75, 58, 140, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
    webShadow: '0 8px 18px rgba(75, 58, 140, 0.38)',
  },
  nav: {
    shadowColor: 'rgba(120, 112, 158, 1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
    webShadow: '0 -2px 14px rgba(120, 112, 158, 0.2)',
  },
};

const dark: Record<ElevationName, ShadowStyle> = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    webShadow: '0 0 0 1px rgba(255, 255, 255, 0.09)',
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    webShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 48,
    elevation: 16,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    webShadow: '0 20px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
  fab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    webShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
  },
  nav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    borderTopWidth: 1,
    webShadow: '0 -2px 16px rgba(0, 0, 0, 0.55), 0 -1px 0 rgba(255, 255, 255, 0.06)',
  },
};

/** Elevation tokens per scheme; the theme (WBS 1.2) selects by active scheme. */
export const elevationTokens: Record<ColorScheme, Record<ElevationName, ShadowStyle>> = {
  light,
  dark,
};

/** Focus ring width (`--memox-ring-focus` is `0 0 0 3px …`); colour = focusRing token. */
export const focusRingWidth = 3;
