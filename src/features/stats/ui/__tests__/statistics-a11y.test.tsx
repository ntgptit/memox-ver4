/**
 * Statistics (WBS 8.1) — accessibility gate (contract 11.3). The labelled
 * accuracy ring, chart sections with visible axis captions, and AA contrast of
 * chart/label colours in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { StatisticsScreen } from '../statistics-screen';
import { STATISTICS_FIXTURES, type StatisticsFixtureKey } from '../statistics-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: StatisticsFixtureKey) {
  const f = STATISTICS_FIXTURES[key];
  return renderScreen(<StatisticsScreen data={f.data} scope={f.scope} />);
}

describe('StatisticsScreen a11y — roles & labels', () => {
  it('the accuracy ring announces its value', () => {
    renderState('loaded');
    expect(screen.getByLabelText('88% accuracy')).toBeTruthy();
  });

  it('every chart section carries its caption (axis context)', () => {
    renderState('loaded');
    expect(screen.getByText('last 14 weeks')).toBeTruthy();
    expect(screen.getByText('min / day')).toBeTruthy();
    expect(screen.getByText('cards in boxes 1–8')).toBeTruthy();
    expect(screen.getByText('30 days')).toBeTruthy();
  });

  it('the scope control exposes both segments', () => {
    renderState('loaded');
    expect(screen.getByText('This pair')).toBeTruthy();
    expect(screen.getByText('All')).toBeTruthy();
  });
});

describe('StatisticsScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: stat + label text meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft, { base: c.bg })).toBe(true);
    });
  }
});
