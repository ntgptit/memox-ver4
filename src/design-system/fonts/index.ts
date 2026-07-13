/**
 * Font loading (Layer 1 asset) — WBS 1.3.
 *
 * Loads the Plus Jakarta Sans VARIABLE font and registers it under the exact
 * family name the typography tokens use (`fontFamily.sans` = 'Plus Jakarta Sans',
 * WBS 1.1), so every `theme.font.text(...)` style resolves to the real font with
 * no system-font fallback. One variable TTF carries the whole 200–800 weight axis
 * (matching the kit's `@font-face { font-weight: 200 800 }`); the weight tokens
 * (400/500/600/700/800) select along that axis via RN `fontWeight`.
 *
 * `useMemoxFonts()` wraps expo-font's `useFonts` (universal — web injects
 * @font-face, native loads at runtime). The root layout (`src/app/_layout.tsx`)
 * gates render on the returned `loaded` flag behind the splash screen.
 *
 * Docs: https://docs.expo.dev/versions/v57.0.0/sdk/font/
 */

import { useFonts } from 'expo-font';

import { fontFamily } from '../tokens';
import { ICON_FONT_FAMILY } from '../icons';

/**
 * The font map registered with expo-font. Keyed by the frozen family names so
 * `fontFamily.sans` (theme text) and `ICON_FONT_FAMILY` (icon adapter, WBS 1.4)
 * match the loaded fonts exactly.
 */
export const memoxFontMap = {
  [fontFamily.sans]: require('../../../assets/fonts/PlusJakartaSans.ttf'),
  [ICON_FONT_FAMILY]: require('../../../assets/fonts/MaterialSymbolsRounded.ttf'),
} as const;

/**
 * Load the MemoX fonts. Returns `[loaded, error]` from expo-font.
 * Call once, at the app root, and hold the splash screen until `loaded`.
 */
export function useMemoxFonts(): readonly [boolean, Error | null] {
  return useFonts(memoxFontMap);
}
