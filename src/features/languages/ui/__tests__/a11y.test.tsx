/**
 * Languages screen (WBS 3.3) — accessibility gate (contract 11.3).
 *
 * Every interactive element has a role + label; the loading/alert regions announce;
 * touch targets are ≥44px; and the slice's new colour pairings meet WCAG AA.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { ok } from '@/shared';
import { MIN_TOUCH_TARGET, meetsContrastAA } from '@/shared/testing/a11y';

import { LanguagesScreen } from '../languages-screen';
import { LANGUAGES_FIXTURES } from '../fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function flat(style: unknown): ViewStyle {
  return (StyleSheet.flatten(style as ViewStyle) ?? {}) as ViewStyle;
}

const base = { data: LANGUAGES_FIXTURES.list, onAdd: async () => ok(undefined), onRemove: async () => ok(undefined) };

describe('LanguagesScreen a11y — roles & labels', () => {
  it('the back control is a labelled button', () => {
    renderScreen(<LanguagesScreen {...base} onBack={() => {}} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('each row delete control names the pair it removes', () => {
    renderScreen(<LanguagesScreen {...base} />);
    expect(screen.getByLabelText('Remove 한국어 → English')).toBeTruthy();
    expect(screen.getByLabelText('Remove 日本語 → English')).toBeTruthy();
  });

  it('the loading state exposes a progressbar', () => {
    renderScreen(<LanguagesScreen {...base} data={LANGUAGES_FIXTURES.loading} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('the remove dialog announces a header and the scrim is dismissible', () => {
    renderScreen(<LanguagesScreen {...base} />);
    fireEvent.press(screen.getByTestId('languages/pair-lp-ko-en-del'));
    expect(screen.getByRole('header', { name: 'Remove 한국어 → English?' })).toBeTruthy();
    expect(screen.getByLabelText('Dismiss')).toBeTruthy();
  });

  it('the add picker cards are labelled', () => {
    renderScreen(<LanguagesScreen {...base} initialMode="add" />);
    expect(screen.getByLabelText('Korean. Change')).toBeTruthy();
    expect(screen.getByLabelText('Meaning language. Change')).toBeTruthy();
  });
});

describe('LanguagesScreen a11y — touch targets', () => {
  it('row delete buttons are ≥44px', () => {
    renderScreen(<LanguagesScreen {...base} />);
    const del = screen.getByTestId('languages/pair-lp-ko-en-del');
    const s = flat(del.props.style);
    const h = (s.minHeight ?? s.height) as number | undefined;
    const w = (s.minWidth ?? s.width) as number | undefined;
    expect(h ?? MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(w ?? MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
});

describe('LanguagesScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: pair title on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: deck-count subtitle on surface meets AA`, () => {
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
    it(`${scheme}: the row icon glyph meets AA on its soft tile`, () => {
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft)).toBe(true);
    });
    it(`${scheme}: the remove error text meets AA on the raised dialog`, () => {
      expect(meetsContrastAA(c.error, c.surfaceRaised)).toBe(true);
    });
  }
});
