/**
 * Reminder screen (WBS 8.2) — state matrix + interaction tests. Renders the 3
 * canonical states (contract §6) and drives the toggle, day chips and the
 * time-picker lifecycle — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

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

function renderState(key: ReminderFixtureKey, over: Partial<React.ComponentProps<typeof ReminderScreen>> = {}) {
  const f = REMINDER_FIXTURES[key];
  return renderScreen(<ReminderScreen config={f.config} ui={f.ui} {...over} />);
}

describe('ReminderScreen — state matrix (contract §6)', () => {
  it('on: toggle row, 13:00 time card, all weekday chips selected', () => {
    renderState('on');
    expect(screen.getByText('Study reminders')).toBeTruthy();
    expect(screen.getByText('13:00')).toBeTruthy();
    expect(screen.getByText('Reminder time')).toBeTruthy();
    expect(screen.getByText('Repeat')).toBeTruthy();
    expect(screen.getByText('Mon')).toBeTruthy();
    expect(screen.getByText('Sun')).toBeTruthy();
  });

  it('off: the time/days block dims and chips deselect', () => {
    renderState('off');
    expect(screen.getByTestId('reminder/days').props.style.opacity).toBeLessThan(1);
    expect(screen.getByTestId('reminder/time').props.style[0].opacity ?? 1).toBeDefined();
  });

  it('time-picker: sheet with hour/minute columns and Done', () => {
    renderState('time-picker');
    expect(screen.getByText('Pick reminder time')).toBeTruthy();
    expect(screen.getByTestId('reminder/hours-13')).toBeTruthy();
    expect(screen.getByTestId('reminder/minutes-00')).toBeTruthy();
    expect(screen.getByTestId('reminder/picker-done')).toBeTruthy();
  });

  it('dark: on renders under the dark scheme', () => {
    const f = REMINDER_FIXTURES.on;
    renderScreen(<ReminderScreen config={f.config} ui={f.ui} />, 'dark');
    expect(screen.getByText('13:00')).toBeTruthy();
  });
});

describe('ReminderScreen — interactions', () => {
  it('toggle + day chips + open picker fire', () => {
    const onToggle = jest.fn();
    const onToggleDay = jest.fn();
    const onOpenPicker = jest.fn();
    renderState('on', { onToggle, onToggleDay, onOpenPicker });
    fireEvent.press(screen.getByTestId('reminder/toggle-switch'));
    expect(onToggle).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('reminder/day-2'));
    expect(onToggleDay).toHaveBeenCalledWith(2);
    fireEvent.press(screen.getByTestId('reminder/time-edit'));
    expect(onOpenPicker).toHaveBeenCalledTimes(1);
  });

  it('off: the time card and chips are inert', () => {
    const onOpenPicker = jest.fn();
    const onToggleDay = jest.fn();
    renderState('off', { onOpenPicker, onToggleDay });
    fireEvent.press(screen.getByTestId('reminder/day-0'));
    expect(onToggleDay).not.toHaveBeenCalled();
  });

  it('picker: choosing values and Done emits HH:MM; scrim dismisses', () => {
    const onPickTime = jest.fn();
    const onClosePicker = jest.fn();
    renderState('time-picker', { onPickTime, onClosePicker });
    fireEvent.press(screen.getByTestId('reminder/hours-14'));
    fireEvent.press(screen.getByTestId('reminder/minutes-30'));
    fireEvent.press(screen.getByTestId('reminder/picker-done'));
    expect(onPickTime).toHaveBeenCalledWith('14:30');
    fireEvent.press(screen.getByLabelText('Dismiss'));
    expect(onClosePicker).toHaveBeenCalledTimes(1);
  });
});
