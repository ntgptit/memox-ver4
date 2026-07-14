/**
 * Study-result (WBS 7.4) — accessibility gate (contract 11.3). Header roles,
 * labelled CTAs, the goal progressbar value, and AA contrast of the streak card
 * and stat text in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { StudyResultScreen } from '../study-result-screen';
import { STUDY_RESULT_FIXTURES, type StudyResultFixtureKey } from '../study-result-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: StudyResultFixtureKey) {
  const f = STUDY_RESULT_FIXTURES[key];
  return renderScreen(<StudyResultScreen data={f.data} />);
}

describe('StudyResultScreen a11y — roles & labels', () => {
  it('the hero title is a header; CTAs are labelled buttons', () => {
    renderState('standard');
    expect(screen.getByRole('header', { name: 'Session complete' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Keep studying' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to library' })).toBeTruthy();
  });

  it('the goal bar is a progressbar with the fixture value', () => {
    renderState('standard');
    const bar = screen.getByTestId('study-result/goal-bar');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 70 });
  });

  it('finalize-error announces its header and labelled recovery actions', () => {
    renderState('finalize-error');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeTruthy();
  });
});

describe('StudyResultScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: hero + stat text on their surfaces meet AA`, () => {
      expect(meetsContrastAA(c.text, c.bg)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.surfaceMuted, { base: c.bg })).toBe(true);
    });
    it(`${scheme}: streak card copy meets AA on primary-soft (over bg)`, () => {
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft, { base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.onSuccessSoft, c.successSoft, { large: true, base: c.primarySoft })).toBe(true);
    });
  }
});
