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
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

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
 * Web only: expo-font's generated `@font-face` has NO `font-weight: 200 800`
 * descriptor or variations format, so the browser serves the variable file's
 * default instance for every weight and synthesizes bold — measurably wider
 * than the kit's true instances (the kit registers the same TTF with the
 * range). Re-declare the face with the kit's descriptors; being declared later
 * with a matching range, it wins font matching and restores true 200–800
 * instances (and kit-identical text metrics).
 */
function registerWebVariableFace(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  // Drop expo-font's range-less face(s) — as exact point matches at weight 400
  // they would keep beating the range face and pin every weight to the default
  // instance (measurably wider than the kit's true 400).
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (let i = rules.length - 1; i >= 0; i -= 1) {
      const rule = rules[i];
      if (
        rule instanceof CSSFontFaceRule &&
        rule.style.getPropertyValue('font-family').includes('Plus Jakarta Sans') &&
        !rule.style.getPropertyValue('font-weight').includes(' ')
      ) {
        sheet.deleteRule(i);
      }
    }
  }

  const ID = 'memox-variable-font-face';
  if (document.getElementById(ID) !== null) return;
  const uri = Asset.fromModule(memoxFontMap[fontFamily.sans]).uri;
  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `@font-face { font-family: '${fontFamily.sans}'; font-style: normal; font-weight: 200 800; font-display: swap; src: url('${uri}') format('truetype-variations'); }`;
  document.head.appendChild(style);
}

/**
 * Load the MemoX fonts. Returns `[loaded, error]` from expo-font.
 * Call once, at the app root, and hold the splash screen until `loaded`.
 */
export function useMemoxFonts(): readonly [boolean, Error | null] {
  registerWebVariableFace();
  return useFonts(memoxFontMap);
}
