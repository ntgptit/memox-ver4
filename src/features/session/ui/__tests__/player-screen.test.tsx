/**
 * Player screen (WBS 7.3) — state matrix + interaction tests. Renders each of
 * the 5 canonical states (contract §6) and drives the transport, speed control
 * and the error/end recoveries — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { PlayerScreen } from '../player-screen';
import { PLAYER_FIXTURES, type PlayerFixtureKey } from '../player-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: PlayerFixtureKey, over: Partial<React.ComponentProps<typeof PlayerScreen>> = {}) {
  const f = PLAYER_FIXTURES[key];
  return renderScreen(<PlayerScreen data={f.data} ui={f.ui} {...over} />);
}

describe('PlayerScreen — state matrix (contract §6)', () => {
  it('playing: deck title, dots, card, pause FAB, speed chip', () => {
    renderState('playing');
    expect(screen.getByText('TOPIK I — Vocabulary')).toBeTruthy();
    expect(screen.getByTestId('player/progress')).toBeTruthy();
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByText('school')).toBeTruthy();
    expect(screen.getByLabelText('Pause')).toBeTruthy();
    expect(screen.getByText('×1')).toBeTruthy();
  });

  it('paused: the FAB flips to Play', () => {
    renderState('paused');
    expect(screen.getByLabelText('Play')).toBeTruthy();
    expect(screen.queryByLabelText('Pause')).toBeNull();
  });

  it('speed: the segmented ×0.75/×1/×1.5 control replaces the chip', () => {
    renderState('speed');
    expect(screen.getByTestId('player/speed-control')).toBeTruthy();
    expect(screen.getByText('×0.75')).toBeTruthy();
    expect(screen.getByText('×1.5')).toBeTruthy();
  });

  it('error: playback-failed panel with retry', () => {
    renderState('error');
    expect(screen.getByText('Playback failed')).toBeTruthy();
    expect(screen.getByTestId('player/retry')).toBeTruthy();
  });

  it('end: all-played panel with Replay / Close', () => {
    renderState('end');
    expect(screen.getByText('All played')).toBeTruthy();
    expect(screen.getByTestId('player/replay')).toBeTruthy();
    expect(screen.getByTestId('player/close')).toBeTruthy();
  });

  it('dark: playing renders under the dark scheme', () => {
    const f = PLAYER_FIXTURES.playing;
    renderScreen(<PlayerScreen data={f.data} ui={f.ui} />, 'dark');
    expect(screen.getByText('학교')).toBeTruthy();
  });
});

describe('PlayerScreen — interactions', () => {
  it('transport + speed intents fire', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const onPlayPause = jest.fn();
    const onSpeedOpen = jest.fn();
    renderState('playing', { onPrev, onNext, onPlayPause, onSpeedOpen });
    fireEvent.press(screen.getByTestId('player/prev'));
    fireEvent.press(screen.getByTestId('player/next'));
    fireEvent.press(screen.getByTestId('player/playpause'));
    fireEvent.press(screen.getByTestId('player/speed'));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPlayPause).toHaveBeenCalledTimes(1);
    expect(onSpeedOpen).toHaveBeenCalledTimes(1);
  });

  it('speed segments emit the chosen rate', () => {
    const onSpeedChange = jest.fn();
    renderState('speed', { onSpeedChange });
    fireEvent.press(screen.getByText('×1.5'));
    expect(onSpeedChange).toHaveBeenCalledWith('1.5');
  });

  it('error retry and end replay/close fire', () => {
    const onRetry = jest.fn();
    renderState('error', { onRetry });
    fireEvent.press(screen.getByTestId('player/retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    const onReplay = jest.fn();
    const onClose = jest.fn();
    renderState('end', { onReplay, onClose });
    fireEvent.press(screen.getByTestId('player/replay'));
    fireEvent.press(screen.getByTestId('player/close'));
    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
