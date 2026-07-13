/**
 * Glyph-map sanity tests (WBS 1.4). The full Icon render/fallback suite is WBS 1.8;
 * this asserts the generated map is well-formed and covers the kit's icons.
 */

import { GLYPHS, FALLBACK_ICON } from '@/design-system/icons';

describe('icon glyph map (WBS 1.4)', () => {
  it('covers the kit icon set (sampled)', () => {
    for (const name of ['home', 'search', 'add', 'bolt', 'notifications', 'chevron_right', 'delete']) {
      expect(GLYPHS).toHaveProperty(name);
    }
  });

  it('maps every name to a single Private-Use-Area codepoint char', () => {
    for (const glyph of Object.values(GLYPHS)) {
      expect(glyph).toHaveLength(1);
      const cp = glyph.codePointAt(0)!;
      expect(cp).toBeGreaterThanOrEqual(0xe000); // PUA start
      expect(cp).toBeLessThanOrEqual(0xf8ff); // PUA end
    }
  });

  it('has a fallback glyph that exists in the map', () => {
    expect(GLYPHS).toHaveProperty(FALLBACK_ICON);
  });
});
