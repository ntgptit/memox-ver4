/**
 * Icon adapter (WBS 1.4).
 *
 * ONE canonical cross-platform icon: the bundled Material Symbols Rounded font
 * (subset), rendered as a Text glyph by CODEPOINT (ligatures are unreliable in RN
 * Text) at an icon-size token. No SF Symbols, no emoji, no CDN. An unknown name
 * renders the deterministic {@link FALLBACK_ICON} rather than blank/tofu.
 *
 * The full automated test suite (all glyphs, weight/FILL, missing-glyph fallback) is
 * owned by WBS 1.8; this module ships the adapter + a glyph-map sanity test.
 */

import { Text, type StyleProp, type TextStyle } from 'react-native';

import { iconSize, type IconSizeName } from '../tokens';
import { GLYPHS, FALLBACK_ICON, type IconName } from './glyphs';

/** The registered family name of the bundled icon font (see `../fonts`). */
export const ICON_FONT_FAMILY = 'MaterialSymbolsRounded';

export interface IconProps {
  /** A kit icon name (see {@link GLYPHS}). Unknown names fall back deterministically. */
  name: IconName | string;
  /** An icon-size token (default `md`) or an explicit px number. */
  size?: IconSizeName | number;
  /** Glyph colour. Omitted → inherits the ambient text colour (kit `currentColor`). */
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Kit `data-mx-node` → `testID` (WBS 0.11). */
  node?: string;
  /** If set, the icon is exposed to a11y as an image with this label; else decorative. */
  accessibilityLabel?: string;
}

export function Icon({ name, size = 'md', color, style, node, accessibilityLabel }: IconProps) {
  const px = typeof size === 'number' ? size : iconSize[size];
  const glyph = (GLYPHS as Record<string, string>)[name] ?? GLYPHS[FALLBACK_ICON];
  const labelled = accessibilityLabel !== undefined;

  return (
    <Text
      testID={node}
      accessible={labelled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={labelled ? 'image' : undefined}
      accessibilityElementsHidden={!labelled}
      importantForAccessibility={labelled ? 'yes' : 'no-hide-descendants'}
      allowFontScaling={false}
      suppressHighlighting
      style={[
        { fontFamily: ICON_FONT_FAMILY, fontSize: px, lineHeight: px, color, includeFontPadding: false },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}
