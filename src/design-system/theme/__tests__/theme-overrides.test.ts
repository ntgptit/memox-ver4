/**
 * Tests for the theme accent + text-scale overrides (WBS 2.3).
 */

import { resolveTheme, tokens } from '@/design-system';

describe('theme overrides (WBS 2.3)', () => {
  it('brand accent leaves the palette untouched', () => {
    expect(resolveTheme('light').color.accent).toBe(tokens.color.light.accent);
    expect(resolveTheme('light', { accent: 'brand' }).color.accent).toBe(tokens.color.light.accent);
  });

  it('a palette accent overrides accent + derives an accent-soft tint', () => {
    const theme = resolveTheme('light', { accent: 'green' });
    expect(theme.color.accent).toBe(tokens.paletteAccents.green);
    expect(theme.color.accentSoft).toMatch(/^rgba\(/); // derived tint
  });

  it('textScale multiplies composed font sizes', () => {
    const base = resolveTheme('light').font.text({ size: 'base' }).fontSize; // 15
    const large = resolveTheme('light', { textScale: 1.15 }).font.text({ size: 'base' }).fontSize;
    expect(base).toBe(15);
    expect(large).toBe(Math.round(15 * 1.15)); // 17
  });

  it('does not change spacing / radius tokens', () => {
    const theme = resolveTheme('dark', { accent: 'coral', textScale: 0.9 });
    expect(theme.space).toBe(tokens.space);
    expect(theme.radius).toBe(tokens.radius);
  });
});
