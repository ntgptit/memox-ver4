/**
 * Statistics screen (WBS 8.1) — state matrix + interaction tests. Renders each
 * of the 5 canonical states (contract §6) and drives the scope switch and error
 * retry — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { StatisticsScreen } from '../statistics-screen';
import { STATISTICS_FIXTURES, type StatisticsFixtureKey } from '../statistics-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: StatisticsFixtureKey, over: Partial<React.ComponentProps<typeof StatisticsScreen>> = {}) {
  const f = STATISTICS_FIXTURES[key];
  return renderScreen(<StatisticsScreen data={f.data} scope={f.scope} {...over} />);
}

describe('StatisticsScreen — state matrix (contract §6)', () => {
  it('loaded: scope, streaks, all four chart sections with axis labels, overview', () => {
    renderState('loaded');
    expect(screen.getByTestId('statistics/scope')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('current streak')).toBeTruthy();
    expect(screen.getByText('28')).toBeTruthy();
    expect(screen.getByText('Study calendar')).toBeTruthy();
    expect(screen.getByText('last 14 weeks')).toBeTruthy();
    expect(screen.getByText('Time per week')).toBeTruthy();
    expect(screen.getByText('min / day')).toBeTruthy();
    expect(screen.getByText('Leitner box distribution')).toBeTruthy();
    expect(screen.getAllByText('M').length).toBeGreaterThan(0); // weekday axis
    expect(screen.getByText('8')).toBeTruthy(); // Leitner axis label
    expect(screen.getByText('88%')).toBeTruthy();
    expect(screen.getByText('accuracy')).toBeTruthy();
    expect(screen.getByText('1240')).toBeTruthy();
    expect(screen.getByText('mastered')).toBeTruthy();
    expect(screen.getByText('96')).toBeTruthy();
  });

  it('scope-switch: the All segment is active', () => {
    renderState('scope-switch');
    expect(screen.getByTestId('statistics/scope')).toBeTruthy();
    expect(screen.getByText('All')).toBeTruthy();
  });

  it('insufficient: not-enough-data prompt, charts absent', () => {
    renderState('insufficient');
    expect(screen.getByText('Not enough data')).toBeTruthy();
    expect(screen.queryByText('Study calendar')).toBeNull();
  });

  it('loading: skeletons, no chart sections', () => {
    renderState('loading');
    expect(screen.queryByText('Study calendar')).toBeNull();
  });

  it('error: recoverable prompt with retry', () => {
    renderState('error');
    expect(screen.getByText("Couldn't load stats")).toBeTruthy();
    expect(screen.getByTestId('statistics/retry')).toBeTruthy();
  });

  it('dark: loaded renders under the dark scheme', () => {
    const f = STATISTICS_FIXTURES.loaded;
    renderScreen(<StatisticsScreen data={f.data} scope={f.scope} />, 'dark');
    expect(screen.getByText('88%')).toBeTruthy();
  });
});

describe('StatisticsScreen — interactions', () => {
  it('scope segments emit; retry fires', () => {
    const onScopeChange = jest.fn();
    renderState('loaded', { onScopeChange });
    fireEvent.press(screen.getByText('All'));
    expect(onScopeChange).toHaveBeenCalledWith('all');

    const onRetry = jest.fn();
    renderState('error', { onRetry });
    fireEvent.press(screen.getByTestId('statistics/retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
