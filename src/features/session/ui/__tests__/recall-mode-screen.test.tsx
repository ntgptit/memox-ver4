/**
 * Recall-mode screen (WBS 7.1) — state matrix + interactions. before-reveal /
 * revealed / forgot / remembered / complete / dark, plus reveal, the two grades, and
 * the round-complete continue.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { RecallModeScreen, type RecallModeScreenProps } from '../recall-mode-screen';
import { RECALL_FIXTURES, type RecallFixtureKey } from '../recall-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: RecallFixtureKey, over: Partial<RecallModeScreenProps> = {}): RecallModeScreenProps {
  return {
    ...RECALL_FIXTURES[key],
    onReveal: jest.fn(),
    onForgot: jest.fn(),
    onRemembered: jest.fn(),
    ...over,
  };
}

describe('RecallModeScreen — states', () => {
  it('before-reveal: term shown, meaning hidden, Show CTA', () => {
    renderScreen(<RecallModeScreen {...props('before-reveal')} />);
    expect(screen.getByText('친구')).toBeTruthy();
    expect(screen.getByText('Tap “Show” to reveal')).toBeTruthy();
    expect(screen.getByTestId('recall-mode/reveal')).toBeTruthy();
  });

  it('revealed: meaning shown with the two grade buttons', () => {
    renderScreen(<RecallModeScreen {...props('revealed')} />);
    expect(screen.getByText('friend')).toBeTruthy();
    expect(screen.getByTestId('recall-mode/forgot')).toBeTruthy();
    expect(screen.getByTestId('recall-mode/remembered')).toBeTruthy();
  });

  it('forgot: shows the re-queue note', () => {
    renderScreen(<RecallModeScreen {...props('forgot')} />);
    expect(screen.getByTestId('recall-mode/note-warning')).toBeTruthy();
  });

  it('remembered: shows the success note', () => {
    renderScreen(<RecallModeScreen {...props('remembered')} />);
    expect(screen.getByTestId('recall-mode/note-success')).toBeTruthy();
  });

  it('complete: round-complete with a continue CTA', () => {
    renderScreen(<RecallModeScreen {...props('complete')} />);
    expect(screen.getByText('Round complete!')).toBeTruthy();
    expect(screen.getByTestId('recall-mode/next')).toBeTruthy();
  });

  it('dark: revealed renders under the dark scheme', () => {
    renderScreen(<RecallModeScreen {...props('revealed')} />, 'dark');
    expect(screen.getByText('friend')).toBeTruthy();
  });
});

describe('RecallModeScreen — interactions', () => {
  it('Show reveals', () => {
    const onReveal = jest.fn();
    renderScreen(<RecallModeScreen {...props('before-reveal', { onReveal })} />);
    fireEvent.press(screen.getByTestId('recall-mode/reveal'));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it('the grades fire their handlers', () => {
    const onForgot = jest.fn();
    const onRemembered = jest.fn();
    renderScreen(<RecallModeScreen {...props('revealed', { onForgot, onRemembered })} />);
    fireEvent.press(screen.getByTestId('recall-mode/forgot'));
    expect(onForgot).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('recall-mode/remembered'));
    expect(onRemembered).toHaveBeenCalledTimes(1);
  });

  it('complete → continue fires onNext', () => {
    const onNext = jest.fn();
    renderScreen(<RecallModeScreen {...props('complete', { onNext })} />);
    fireEvent.press(screen.getByTestId('recall-mode/next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
