/**
 * Dashboard screen (WBS 5.3) — state matrix + interaction tests. Renders each of
 * the 8 canonical states (contract §6) and drives the review CTA, deck rows,
 * see-all link and the create sheet — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { DashboardScreen } from '../dashboard-screen';
import { DASHBOARD_FIXTURES, type DashboardFixtureKey } from '../dashboard-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: DashboardFixtureKey, over: Partial<React.ComponentProps<typeof DashboardScreen>> = {}) {
  const f = DASHBOARD_FIXTURES[key];
  return renderScreen(<DashboardScreen data={f.data} initialUi={f.ui} {...over} />);
}

describe('DashboardScreen — state matrix (contract §6)', () => {
  it('loaded: greeting, due caption, primary CTA, goal card, today strip, decks', () => {
    renderState('loaded');
    expect(screen.getByText('Good evening, Linh')).toBeTruthy();
    expect(screen.getByText('24 cards due across 3 decks')).toBeTruthy();
    expect(screen.getByTestId('dashboard/start-review')).toBeTruthy();
    expect(screen.getByText('Daily goal')).toBeTruthy();
    expect(screen.getByText('14 of 20 minutes · 6 minutes left')).toBeTruthy();
    expect(screen.getByText('day streak')).toBeTruthy();
    expect(screen.getByText('TOPIK I — Vocabulary')).toBeTruthy();
    expect(screen.getByText('See all decks')).toBeTruthy();
  });

  it('not-studied: accent note + zeroed goal/strip', () => {
    renderState('not-studied');
    expect(screen.getByText(/You haven't studied today/)).toBeTruthy();
    expect(screen.getByText('0 of 20 minutes · 20 minutes left')).toBeTruthy();
    expect(screen.getByText('0m')).toBeTruthy();
  });

  it('goal-met: success note + complete goal line + streak 13', () => {
    renderState('goal-met');
    expect(screen.getByText('Daily goal reached! Streak +1.')).toBeTruthy();
    expect(screen.getByText('20 of 20 minutes · goal complete')).toBeTruthy();
    expect(screen.getByText('13')).toBeTruthy();
  });

  it('streak-reset: warning note + streak 0', () => {
    renderState('streak-reset');
    expect(screen.getByText(/Streak reset/)).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('caught-up: hero replaces the review CTA; rows read up to date', () => {
    renderState('caught-up');
    expect(screen.getByText("You're all caught up")).toBeTruthy();
    expect(screen.getByTestId('dashboard/explore')).toBeTruthy();
    expect(screen.queryByTestId('dashboard/start-review')).toBeNull();
    expect(screen.getAllByText(/up to date/).length).toBe(3);
  });

  it('empty: onboarding hero + the three how-it-works steps, no FAB', () => {
    renderState('empty');
    expect(screen.getByText('Start your first deck')).toBeTruthy();
    expect(screen.getByTestId('dashboard/create-deck')).toBeTruthy();
    expect(screen.getByTestId('dashboard/import-file')).toBeTruthy();
    expect(screen.getByText('How MemoX works')).toBeTruthy();
    expect(screen.getByTestId('dashboard/step-streak')).toBeTruthy();
    expect(screen.queryByTestId('dashboard/add')).toBeNull();
  });

  it('loading: skeletons, no CTA or deck names', () => {
    renderState('loading');
    expect(screen.queryByTestId('dashboard/start-review')).toBeNull();
    expect(screen.queryByText('TOPIK I — Vocabulary')).toBeNull();
  });

  it('create-sheet: Create sheet with card/deck/import items', () => {
    renderState('create-sheet');
    expect(screen.getByTestId('dashboard/create-sheet')).toBeTruthy();
    expect(screen.getByTestId('dashboard/create-card')).toBeTruthy();
    expect(screen.getByTestId('dashboard/create-deck')).toBeTruthy();
    expect(screen.getByTestId('dashboard/create-import')).toBeTruthy();
  });

  it('dark: loaded renders under the dark scheme', () => {
    const f = DASHBOARD_FIXTURES.loaded;
    renderScreen(<DashboardScreen data={f.data} initialUi={f.ui} />, 'dark');
    expect(screen.getByText('Good evening, Linh')).toBeTruthy();
  });
});

describe('DashboardScreen — interactions', () => {
  it('Start review fires; deck rows open their deck; See all navigates', () => {
    const onStartReview = jest.fn();
    const onOpenDeck = jest.fn();
    const onSeeAllDecks = jest.fn();
    renderState('loaded', { onStartReview, onOpenDeck, onSeeAllDecks });
    fireEvent.press(screen.getByTestId('dashboard/start-review'));
    expect(onStartReview).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('dashboard/deck-0'));
    expect(onOpenDeck).toHaveBeenCalledWith('d-topik');
    fireEvent.press(screen.getByText('See all decks'));
    expect(onSeeAllDecks).toHaveBeenCalledTimes(1);
  });

  it('FAB opens the create sheet; items fire their intents; scrim dismisses', () => {
    const onCreateDeck = jest.fn();
    renderState('loaded', { onCreateDeck });
    fireEvent.press(screen.getByTestId('dashboard/add'));
    fireEvent.press(screen.getByTestId('dashboard/create-deck'));
    expect(onCreateDeck).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText('Dismiss'));
    expect(screen.queryByTestId('dashboard/create-sheet')).toBeNull();
  });

  it('caught-up: Explore decks fires', () => {
    const onExploreDecks = jest.fn();
    renderState('caught-up', { onExploreDecks });
    fireEvent.press(screen.getByTestId('dashboard/explore'));
    expect(onExploreDecks).toHaveBeenCalledTimes(1);
  });

  it('empty: hero CTAs fire', () => {
    const onCreateDeck = jest.fn();
    const onImportCards = jest.fn();
    renderState('empty', { onCreateDeck, onImportCards });
    fireEvent.press(screen.getByTestId('dashboard/create-deck'));
    fireEvent.press(screen.getByTestId('dashboard/import-file'));
    expect(onCreateDeck).toHaveBeenCalledTimes(1);
    expect(onImportCards).toHaveBeenCalledTimes(1);
  });
});
