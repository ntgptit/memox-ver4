/**
 * Study-session shell (WBS 5.5) — accessibility gate (contract 11.3). Labelled
 * chrome, the session progressbar, labelled stage controls, danger exit, and AA
 * contrast of the stage-label/dialog tints in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { StudySessionScreen } from '../study-session-screen';
import type { StudySessionUiState } from '../study-session-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(ui: StudySessionUiState) {
  return renderScreen(<StudySessionScreen ui={ui} />);
}

describe('StudySessionScreen a11y — roles & labels', () => {
  it('chrome is labelled and progress is a progressbar', () => {
    renderState('stage1-review');
    expect(screen.getByLabelText('Close session')).toBeTruthy();
    expect(screen.getByLabelText('Options')).toBeTruthy();
    expect(screen.getByTestId('study-session/progress').props.accessibilityRole).toBe('progressbar');
  });

  it('match tiles and fill input are labelled', () => {
    renderState('stage2-match');
    expect(screen.getByLabelText('사랑')).toBeTruthy();
    renderState('stage5-fill');
    expect(screen.getAllByLabelText('Type the answer').length).toBeGreaterThan(0);
  });

  it('the exit dialog announces a header with a dismissible scrim', () => {
    renderState('exit');
    expect(screen.getByRole('header', { name: 'Leave the session?' })).toBeTruthy();
    expect(screen.getByLabelText('Dismiss')).toBeTruthy();
  });

  it('save-error and resume-error announce headers', () => {
    renderState('answer-save-error');
    expect(screen.getByRole('header', { name: "Couldn't save your answer" })).toBeTruthy();
    renderState('resume-error');
    expect(screen.getByRole('header', { name: "Couldn't resume your session" })).toBeTruthy();
  });
});

describe('StudySessionScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: card text + relearn note meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onWarningSoft, c.warningSoft, { large: true, base: c.bg })).toBe(true);
    });
  }
});
