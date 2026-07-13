/**
 * Fill-mode screen (WBS 7.2) — state matrix + interactions. waiting / typing / hint /
 * correct / wrong / complete / dark, plus typing, check, help, next, accept, retry.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { FillModeScreen, type FillModeScreenProps } from '../fill-mode-screen';
import { FILL_FIXTURES, type FillFixtureKey } from '../fill-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: FillFixtureKey, over: Partial<FillModeScreenProps> = {}): FillModeScreenProps {
  return {
    ...FILL_FIXTURES[key],
    onChangeInput: jest.fn(),
    onCheck: jest.fn(),
    onHint: jest.fn(),
    onNext: jest.fn(),
    onAccept: jest.fn(),
    onRetry: jest.fn(),
    ...over,
  };
}

describe('FillModeScreen — states', () => {
  it('waiting: meaning shown, Help + Check controls', () => {
    renderScreen(<FillModeScreen {...props('waiting')} />);
    expect(screen.getByText('friend')).toBeTruthy();
    expect(screen.getByTestId('fill-mode/hint')).toBeTruthy();
    expect(screen.getByTestId('fill-mode/check')).toBeTruthy();
  });

  it('typing: the input carries the partial answer', () => {
    renderScreen(<FillModeScreen {...props('typing')} />);
    expect(screen.getByTestId('fill-mode/input').props.value).toBe('친');
  });

  it('hint: shows the hint note', () => {
    renderScreen(<FillModeScreen {...props('hint')} />);
    expect(screen.getByTestId('fill-mode/hint-note')).toBeTruthy();
    expect(screen.getByText('Hint: 2 characters, starts with 친')).toBeTruthy();
  });

  it('correct: shows the term + a Next control', () => {
    renderScreen(<FillModeScreen {...props('correct')} />);
    expect(screen.getByTestId('fill-mode/input').props.children).toBe('친구');
    expect(screen.getByTestId('fill-mode/next')).toBeTruthy();
  });

  it('wrong: char-compare + the answer + accept/retry', () => {
    renderScreen(<FillModeScreen {...props('wrong')} />);
    expect(screen.getByTestId('fill-mode/char-compare')).toBeTruthy();
    expect(screen.getByTestId('fill-mode/answer')).toBeTruthy();
    expect(screen.getByTestId('fill-mode/accept')).toBeTruthy();
    expect(screen.getByTestId('fill-mode/retry')).toBeTruthy();
  });

  it('complete: round-complete', () => {
    renderScreen(<FillModeScreen {...props('complete')} />);
    expect(screen.getByText('Round complete!')).toBeTruthy();
  });

  it('dark: typing renders under the dark scheme', () => {
    renderScreen(<FillModeScreen {...props('typing')} />, 'dark');
    expect(screen.getByText('friend')).toBeTruthy();
  });
});

describe('FillModeScreen — interactions', () => {
  it('typing fires onChangeInput', () => {
    const onChangeInput = jest.fn();
    renderScreen(<FillModeScreen {...props('waiting', { onChangeInput })} />);
    fireEvent.changeText(screen.getByTestId('fill-mode/input'), '친');
    expect(onChangeInput).toHaveBeenCalledWith('친');
  });

  it('check + help fire their handlers', () => {
    const onCheck = jest.fn();
    const onHint = jest.fn();
    renderScreen(<FillModeScreen {...props('typing', { onCheck, onHint })} />);
    fireEvent.press(screen.getByTestId('fill-mode/check'));
    expect(onCheck).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('fill-mode/hint'));
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('correct → Next advances', () => {
    const onNext = jest.fn();
    renderScreen(<FillModeScreen {...props('correct', { onNext })} />);
    fireEvent.press(screen.getByTestId('fill-mode/next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('wrong → accept + retry fire their handlers', () => {
    const onAccept = jest.fn();
    const onRetry = jest.fn();
    renderScreen(<FillModeScreen {...props('wrong', { onAccept, onRetry })} />);
    fireEvent.press(screen.getByTestId('fill-mode/accept'));
    expect(onAccept).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('fill-mode/retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
