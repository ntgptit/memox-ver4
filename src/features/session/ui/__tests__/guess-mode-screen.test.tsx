/**
 * Guess-mode screen (WBS 6.3) — state matrix + interactions. waiting / correct / wrong /
 * long-text / complete / dark, plus picking, continue, and round-complete.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { GuessModeScreen, type GuessModeScreenProps } from '../guess-mode-screen';
import { GUESS_FIXTURES, type GuessFixtureKey } from '../guess-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: GuessFixtureKey, over: Partial<GuessModeScreenProps> = {}): GuessModeScreenProps {
  return { ...GUESS_FIXTURES[key], onPick: jest.fn(), onContinue: jest.fn(), ...over };
}

describe('GuessModeScreen — states', () => {
  it('waiting: term + five tappable options, no continue', () => {
    renderScreen(<GuessModeScreen {...props('waiting')} />);
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByTestId('guess-mode/choice-0')).toBeTruthy();
    expect(screen.getByTestId('guess-mode/choice-4')).toBeTruthy();
    expect(screen.queryByTestId('guess-mode/continue')).toBeNull();
  });

  it('correct: the correct option is marked; no separate continue button (kit: tap to continue)', () => {
    renderScreen(<GuessModeScreen {...props('correct')} />);
    expect(screen.getByLabelText('school (correct). Tap to continue')).toBeTruthy();
    expect(screen.queryByTestId('guess-mode/continue')).toBeNull();
  });

  it('wrong: correct + the wrong pick are both marked', () => {
    renderScreen(<GuessModeScreen {...props('wrong')} />);
    expect(screen.getByLabelText('school (correct). Tap to continue')).toBeTruthy();
    expect(screen.getByLabelText('park (your answer, wrong). Tap to continue')).toBeTruthy();
  });

  it('long-text: long options render (no clip)', () => {
    renderScreen(<GuessModeScreen {...props('long-text')} />);
    expect(screen.getByText(/students go to study/)).toBeTruthy();
  });

  it('complete: round-complete with the score', () => {
    renderScreen(<GuessModeScreen {...props('complete')} />);
    expect(screen.getByText('Round complete!')).toBeTruthy();
    expect(screen.getByText('You answered 18/20 correctly.')).toBeTruthy();
  });

  it('dark: waiting renders under the dark scheme', () => {
    renderScreen(<GuessModeScreen {...props('waiting')} />, 'dark');
    expect(screen.getByText('학교')).toBeTruthy();
  });
});

describe('GuessModeScreen — interactions', () => {
  it('picking an option fires onPick with its index', () => {
    const onPick = jest.fn();
    renderScreen(<GuessModeScreen {...props('waiting', { onPick })} />);
    fireEvent.press(screen.getByTestId('guess-mode/choice-2'));
    expect(onPick).toHaveBeenCalledWith(2);
  });

  it('after feedback a tap continues instead of re-picking', () => {
    const onPick = jest.fn();
    const onContinue = jest.fn();
    renderScreen(<GuessModeScreen {...props('correct', { onPick, onContinue })} />);
    fireEvent.press(screen.getByTestId('guess-mode/choice-1'));
    expect(onPick).not.toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('complete → next fires onDone', () => {
    const onDone = jest.fn();
    renderScreen(<GuessModeScreen {...props('complete', { onDone })} />);
    fireEvent.press(screen.getByTestId('guess-mode/next'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
