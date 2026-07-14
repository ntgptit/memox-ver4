/**
 * Reminder (WBS 8.2) — accessibility gate (contract 11.3). Labelled switch and
 * controls, selected state on picker values, and AA contrast in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { ReminderScreen } from '../reminder-screen';
import { REMINDER_FIXTURES, type ReminderFixtureKey } from '../reminder-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: ReminderFixtureKey) {
  const f = REMINDER_FIXTURES[key];
  return renderScreen(<ReminderScreen config={f.config} ui={f.ui} />);
}

describe('ReminderScreen a11y — roles & labels', () => {
  it('the toggle and time controls are labelled', () => {
    renderState('on');
    expect(screen.getByLabelText('Study reminders')).toBeTruthy();
    expect(screen.getByLabelText('Change time')).toBeTruthy();
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('picker values announce their selected state', () => {
    renderState('time-picker');
    expect(screen.getByTestId('reminder/hours-13').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('reminder/hours-14').props.accessibilityState.selected).toBe(false);
  });
});

describe('ReminderScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: row text + tinted tile meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onWarningSoft, c.warningSoft, { large: true, base: c.surface })).toBe(true);
    });
  }
});
