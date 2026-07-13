/**
 * Accessibility baseline tests (WBS 11.3): the shared contrast checker works, and the
 * design-system token colour pairs meet WCAG AA in both schemes.
 */

import { contrastRatio, meetsContrastAA, parseColor, compositeOver } from '@/shared/testing/a11y';
import { themes, type ColorScheme } from '@/design-system';

describe('contrast checker (WBS 11.3)', () => {
  it('computes the canonical 21:1 for black on white and 1:1 for white on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('parses hex and rgba, and composites alpha over a base', () => {
    expect(parseColor('#f00')).toMatchObject({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toMatchObject({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(compositeOver(parseColor('rgba(0,0,0,0.5)'), parseColor('#ffffff'))).toMatchObject({ r: 128 });
  });

  it('meetsContrastAA uses 4.5 for normal and 3 for large', () => {
    // #767676 on white ≈ 4.54:1 — passes normal, comfortably passes large.
    expect(meetsContrastAA('#767676', '#ffffff')).toBe(true);
    // #999999 on white ≈ 2.85:1 — fails normal, fails large too.
    expect(meetsContrastAA('#999999', '#ffffff')).toBe(false);
    expect(meetsContrastAA('#949494', '#ffffff', { large: true })).toBe(true);
  });
});

// Foreground/background token pairs that carry text or a UI edge, per scheme.
// Soft (rgba) backgrounds composite over the scheme canvas via `base`.
type Pair = { fg: keyof typeof themes.light.color; bg: keyof typeof themes.light.color; large?: boolean };

const NORMAL_TEXT_PAIRS: Pair[] = [
  { fg: 'text', bg: 'bg' },
  { fg: 'text', bg: 'surface' },
  { fg: 'text', bg: 'surfaceMuted' },
  { fg: 'textSecondary', bg: 'bg' },
  { fg: 'textSecondary', bg: 'surface' },
  { fg: 'textTertiary', bg: 'bg' },
  { fg: 'onPrimary', bg: 'primary' },
  { fg: 'onAccent', bg: 'accent' },
  { fg: 'onSuccess', bg: 'success' },
  { fg: 'onWarning', bg: 'warning' },
  { fg: 'onError', bg: 'error' },
  { fg: 'onPrimarySoft', bg: 'primarySoft' },
  // Semantic soft tints back bold status badges/chips (MxBadge/MxChip), so they carry
  // large/bold text → AA-large (3:1) is the applicable bar, not 4.5.
  { fg: 'onSuccessSoft', bg: 'successSoft', large: true },
  { fg: 'onWarningSoft', bg: 'warningSoft', large: true },
  { fg: 'onErrorSoft', bg: 'errorSoft', large: true },
];

describe.each<ColorScheme>(['light', 'dark'])('token contrast — %s scheme (WBS 11.3)', (scheme) => {
  const color = themes[scheme].color;
  it.each(NORMAL_TEXT_PAIRS)('$fg on $bg meets AA', ({ fg, bg, large }) => {
    const ratio = contrastRatio(color[fg], color[bg], color.bg);
    expect(ratio).toBeGreaterThanOrEqual(large ? 3 : 4.5);
  });
});
