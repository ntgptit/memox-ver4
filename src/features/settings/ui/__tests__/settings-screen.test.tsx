/**
 * Settings screens (WBS 10.1) — the 7-state matrix renders the kit copy
 * verbatim and every control fires its callback (root rows, hub rows, child
 * switches, words-per-round picker).
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/design-system';

import { SettingsScreen } from '../settings-screen';
import { SETTINGS_FIXTURES, type SettingsFixtureKey } from '../settings-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: SettingsFixtureKey, props: Partial<React.ComponentProps<typeof SettingsScreen>> = {}) {
  const f = SETTINGS_FIXTURES[key];
  return renderScreen(<SettingsScreen ui={f.ui} settings={f.settings} {...props} />);
}

describe('SettingsScreen — state matrix', () => {
  it('loaded: profile + STUDY entry + APP rows', () => {
    renderState('loaded');
    expect(screen.getByText('Linh Tran')).toBeTruthy();
    expect(screen.getByText('linh@memox.app')).toBeTruthy();
    expect(screen.getByText('Study settings')).toBeTruthy();
    expect(screen.getByText('Theme')).toBeTruthy();
    expect(screen.getByText('Reminders')).toBeTruthy();
    expect(screen.getByText('Backup / Restore')).toBeTruthy();
    expect(screen.getByText('Export cards')).toBeTruthy();
  });

  it('study-hub: one row per child screen', () => {
    renderState('study-hub');
    for (const title of ['Language pairs', 'Word display', 'Spaced repetition', 'Mode settings', 'Voice']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it('study-worddisplay: meaning row + two switches', () => {
    renderState('study-worddisplay');
    expect(screen.getByText('Meaning language')).toBeTruthy();
    expect(screen.getByLabelText('Color by gender').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Show romanization').props.accessibilityState.checked).toBe(false);
  });

  it('study-srs: boxes value, intervals, notifications switch', () => {
    renderState('study-srs');
    expect(screen.getByText('Leitner boxes')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('1 · 3 · 7 · 14 · 30 · 60 · 120')).toBeTruthy();
    expect(screen.getByLabelText('Due notifications').props.accessibilityState.checked).toBe(true);
  });

  it('study-mode: words value + shuffle/autoplay switches', () => {
    renderState('study-mode');
    expect(screen.getByText('Words per round')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByLabelText('Shuffle cards').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Autoplay audio').props.accessibilityState.checked).toBe(false);
  });

  it('study-voice: tts/stt switches + rate row', () => {
    renderState('study-voice');
    expect(screen.getByLabelText('Text-to-speech').props.accessibilityState.checked).toBe(true);
    expect(screen.getByText('Speech rate')).toBeTruthy();
    expect(screen.getByLabelText('Speech-to-text').props.accessibilityState.checked).toBe(false);
  });

  it('value-picker: the sheet over the root with the current selection', () => {
    renderState('value-picker');
    expect(screen.getByText('Words per round')).toBeTruthy();
    expect(screen.getByTestId('settings/words-5').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('settings/words-10').props.accessibilityState.selected).toBe(false);
  });
});

describe('SettingsScreen — interactions', () => {
  it('root rows open their destinations', () => {
    const onOpen = jest.fn();
    renderState('loaded', { onOpen });
    fireEvent.press(screen.getByTestId('settings/study'));
    expect(onOpen).toHaveBeenCalledWith('study');
    fireEvent.press(screen.getByTestId('settings/reminders'));
    expect(onOpen).toHaveBeenCalledWith('reminders');
  });

  it('hub rows open their child screens', () => {
    const onOpenStudy = jest.fn();
    renderState('study-hub', { onOpenStudy });
    fireEvent.press(screen.getByTestId('settings/study-worddisplay'));
    expect(onOpenStudy).toHaveBeenCalledWith('worddisplay');
    fireEvent.press(screen.getByTestId('settings/study-language'));
    expect(onOpenStudy).toHaveBeenCalledWith('languages');
  });

  it('child switches persist their field', () => {
    const onToggle = jest.fn();
    renderState('study-mode', { onToggle });
    fireEvent.press(screen.getByTestId('settings/mode-shuffle-switch'));
    expect(onToggle).toHaveBeenCalledWith('shuffle', false);
  });

  it('the words row opens the picker and picking a value commits it', () => {
    const onOpenPicker = jest.fn();
    renderState('study-mode', { onOpenPicker });
    fireEvent.press(screen.getByTestId('settings/mode-count'));
    expect(onOpenPicker).toHaveBeenCalled();

    const onPickWords = jest.fn();
    renderState('value-picker', { onPickWords });
    fireEvent.press(screen.getByTestId('settings/words-10'));
    expect(onPickWords).toHaveBeenCalledWith(10);
  });

  it('nested screens fire back', () => {
    const onBack = jest.fn();
    renderState('study-hub', { onBack });
    fireEvent.press(screen.getByTestId('settings/study-back'));
    expect(onBack).toHaveBeenCalled();
  });
});
