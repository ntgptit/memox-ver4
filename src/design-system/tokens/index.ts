/**
 * Design tokens (Layer 1) — WBS 1.1. Public surface.
 *
 * Typed, verbatim transcription of every `docs/design/MemoX Design System_v4/
 * tokens/*.css` token — colours (light+dark), spacing, radius, typography,
 * elevation, motion, size, icon-size, stroke, opacity. Token NAMES are a frozen
 * contract (ADR 0004); values track the CSS with no drift.
 *
 * This module is the ONLY thing the theme (WBS 1.2) and `Mx*` components
 * (WBS 1.5–1.7) read for raw values. Screens never import tokens directly
 * (one-way layering, ADR 0001 / enforced by WBS 0.12).
 */

import { colorTokens, paletteAccents } from './colors';
import { space, layout, SPACING_CONTRACT_SUBSET } from './spacing';
import { radius } from './radius';
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeightRatio,
  letterSpacingEm,
} from './typography';
import { elevationTokens, focusRingWidth } from './elevation';
import { duration, easing } from './motion';
import { size, iconSize, stroke, opacity } from './size';

export * from './colors';
export * from './spacing';
export * from './radius';
export * from './typography';
export * from './elevation';
export * from './motion';
export * from './size';

/**
 * The complete token bundle. Grouped by role; consumed by the theme (WBS 1.2)
 * which resolves the active colour scheme and composes text styles.
 */
export const tokens = {
  color: colorTokens,
  paletteAccents,
  space,
  spacingContractSubset: SPACING_CONTRACT_SUBSET,
  layout,
  radius,
  font: {
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    lineHeightRatio,
    letterSpacingEm,
  },
  elevation: elevationTokens,
  focusRingWidth,
  duration,
  easing,
  size,
  iconSize,
  stroke,
  opacity,
} as const;

export type Tokens = typeof tokens;
