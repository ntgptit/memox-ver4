/**
 * Review-mode (WBS 6.1) — accessibility gate (contract 11.3). Labelled bar
 * actions and navigation, the progressbar, the labelled edit input, and AA
 * contrast of the card text in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { ReviewModeScreen } from '../review-mode-screen';
import { REVIEW_MODE_FIXTURES, type ReviewModeFixtureKey } from '../review-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: ReviewModeFixtureKey) {
  const f = REVIEW_MODE_FIXTURES[key];
  return renderScreen(<ReviewModeScreen data={f.data} ui={f.ui} />);
}

describe('ReviewModeScreen a11y — roles & labels', () => {
  it('bar actions and navigation are labelled', () => {
    renderState('browsing');
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Text size')).toBeTruthy();
    expect(screen.getByLabelText('Options')).toBeTruthy();
    expect(screen.getByLabelText('Previous card')).toBeTruthy();
    expect(screen.getByLabelText('Next card')).toBeTruthy();
  });

  it('the round progress is a progressbar', () => {
    renderState('browsing');
    const bar = screen.getByTestId('review-mode/progress');
    expect(bar.props.accessibilityRole).toBe('progressbar');
  });

  it('the edit affordance and its input are labelled', () => {
    renderState('editing');
    expect(screen.getByLabelText('Cancel edit')).toBeTruthy();
    expect(screen.getByLabelText('Meaning')).toBeTruthy();
  });

  it('audio control is labelled', () => {
    renderState('browsing');
    expect(screen.getByLabelText('Play pronunciation')).toBeTruthy();
  });
});

describe('ReviewModeScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: meaning/term text on the card meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textTertiary, c.bg, { large: true })).toBe(true);
    });
  }
});
