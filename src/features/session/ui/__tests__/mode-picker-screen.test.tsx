/**
 * Mode-picker screen (WBS 5.4) — state matrix + interactions.
 * default / loading / not-enough / scope-dropdown / dark, plus: opening the scope
 * sheet, selecting a source, starting a mode, and the not-enough guard disabling modes.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { ModePickerScreen, type ModePickerScreenProps } from '../mode-picker-screen';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(over: Partial<ModePickerScreenProps> = {}): ModePickerScreenProps {
  return {
    scope: 'srs',
    scopeCount: 24,
    onScopeChange: jest.fn(),
    onStart: jest.fn(),
    ...over,
  };
}

describe('ModePickerScreen — states', () => {
  it('default: scope summary + 5 modes + footer', () => {
    renderScreen(<ModePickerScreen {...props()} />);
    expect(screen.getByText('By schedule · 24 words')).toBeTruthy();
    expect(screen.getByTestId('mode-picker/mode-review')).toBeTruthy();
    expect(screen.getByTestId('mode-picker/mode-fill')).toBeTruthy();
    expect(screen.getByText('5 words per round · change in Settings')).toBeTruthy();
  });

  it('loading: scope count shows Counting…', () => {
    renderScreen(<ModePickerScreen {...props({ scopeCount: null })} />);
    expect(screen.getByText('By schedule · Counting…')).toBeTruthy();
  });

  it('not-enough: shows the guard and an Add words CTA', () => {
    renderScreen(<ModePickerScreen {...props({ scope: 'unlearned', scopeCount: 2 })} />);
    expect(screen.getByTestId('mode-picker/not-enough')).toBeTruthy();
    expect(screen.getByText('This deck needs at least 4 words to play.')).toBeTruthy();
    expect(screen.getByTestId('mode-picker/add-cards')).toBeTruthy();
  });

  it('scope-dropdown: the sheet lists all three sources', () => {
    renderScreen(<ModePickerScreen {...props({ initialSheetOpen: true })} />);
    expect(screen.getByTestId('mode-picker/scope-srs')).toBeTruthy();
    expect(screen.getByTestId('mode-picker/scope-all')).toBeTruthy();
    expect(screen.getByTestId('mode-picker/scope-unlearned')).toBeTruthy();
  });

  it('dark: renders under the dark scheme', () => {
    renderScreen(<ModePickerScreen {...props()} />, 'dark');
    expect(screen.getByText('Card source')).toBeTruthy();
  });
});

describe('ModePickerScreen — interactions', () => {
  it('tapping the scope card opens the sheet', () => {
    renderScreen(<ModePickerScreen {...props()} />);
    expect(screen.queryByTestId('mode-picker/scope-all')).toBeNull();
    fireEvent.press(screen.getByTestId('mode-picker/scope'));
    expect(screen.getByTestId('mode-picker/scope-all')).toBeTruthy();
  });

  it('selecting a source fires onScopeChange and closes the sheet', () => {
    const onScopeChange = jest.fn();
    renderScreen(<ModePickerScreen {...props({ onScopeChange, initialSheetOpen: true })} />);
    fireEvent.press(screen.getByTestId('mode-picker/scope-all'));
    expect(onScopeChange).toHaveBeenCalledWith('all');
    expect(screen.queryByTestId('mode-picker/scope-all')).toBeNull();
  });

  it('tapping a mode starts it', () => {
    const onStart = jest.fn();
    renderScreen(<ModePickerScreen {...props({ onStart })} />);
    fireEvent.press(screen.getByTestId('mode-picker/mode-guess'));
    expect(onStart).toHaveBeenCalledWith('guess');
  });

  it('not-enough disables modes (no start) and Add words fires', () => {
    const onStart = jest.fn();
    const onAddWords = jest.fn();
    renderScreen(<ModePickerScreen {...props({ scopeCount: 1, onStart, onAddWords })} />);
    fireEvent.press(screen.getByTestId('mode-picker/mode-review'));
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('mode-picker/add-cards'));
    expect(onAddWords).toHaveBeenCalledTimes(1);
  });
});
