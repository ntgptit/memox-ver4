/**
 * Sample UNIT test (WBS 0.13) — pure token/theme resolution.
 *
 * Seeds the token-parity discipline (WBS 1.8): the resolved theme must carry the
 * exact token values with no drift, and the scheme switch must be total.
 */

import { resolveTheme, tokens } from '@/design-system';

describe('resolveTheme (WBS 1.1/1.2)', () => {
  it('resolves the light scheme background to the canonical token value', () => {
    expect(resolveTheme('light').color.bg).toBe('#f6f5fc');
  });

  it('resolves the dark scheme background to the canonical token value', () => {
    expect(resolveTheme('dark').color.bg).toBe('#141220');
  });

  it('carries the frozen deep-violet brand primary in both schemes', () => {
    expect(resolveTheme('light').color.primary).toBe('#4b3a8c');
    expect(resolveTheme('dark').color.primary).toBe('#4b3a8c');
  });

  it('defines every colour role in both schemes (no partial scheme)', () => {
    const lightRoles = Object.keys(tokens.color.light).sort();
    const darkRoles = Object.keys(tokens.color.dark).sort();
    expect(darkRoles).toEqual(lightRoles);
  });

  it('composes a text style from primitives (ratio→px line-height, em→px tracking)', () => {
    const style = resolveTheme('light').font.text({ size: 'base', weight: 'semibold' });
    // base = 15px; normal line-height ratio 1.5 → round(22.5) = 23; weight '600'
    expect(style.fontSize).toBe(15);
    expect(style.fontWeight).toBe('600');
    expect(style.lineHeight).toBe(22.5); // exact kit ratio (15 × 1.5), not rounded
    expect(style.fontFamily).toBe('Plus Jakarta Sans');
  });

  it('keeps the screen spacing contract subset within the token scale', () => {
    const scaleValues = Object.values(tokens.space) as number[];
    for (const v of tokens.spacingContractSubset) {
      expect(scaleValues).toContain(v);
    }
  });
});
