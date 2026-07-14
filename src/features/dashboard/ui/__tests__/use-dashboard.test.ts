/**
 * Dashboard controller (WBS 5.3) — pure derivations (streak/greeting/day keys)
 * and the load pipeline via renderHook with fake deps: due summary, deck views,
 * goal minutes, words learned, streak, mastery, and the derived UI state.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { dayKey, deriveStreak, greetingForHour, useDashboard, type DashboardDeps } from '../use-dashboard';

const DAY = 24 * 60 * 60 * 1000;
/** A fixed local-noon anchor keeps day math stable across timezones. */
const NOW = new Date(2026, 6, 14, 12, 0, 0).getTime();

describe('pure derivations', () => {
  it('greetingForHour maps morning/afternoon/evening', () => {
    expect(greetingForHour(8)).toBe('Good morning');
    expect(greetingForHour(13)).toBe('Good afternoon');
    expect(greetingForHour(20)).toBe('Good evening');
  });

  it('deriveStreak counts consecutive days ending today', () => {
    const days = new Set([dayKey(NOW), dayKey(NOW - DAY), dayKey(NOW - 2 * DAY)]);
    expect(deriveStreak(days, NOW)).toBe(3);
  });

  it('deriveStreak survives an unstudied today (ends yesterday)', () => {
    const days = new Set([dayKey(NOW - DAY), dayKey(NOW - 2 * DAY)]);
    expect(deriveStreak(days, NOW)).toBe(2);
  });

  it('deriveStreak is 0 after a missed day', () => {
    const days = new Set([dayKey(NOW - 2 * DAY), dayKey(NOW - 3 * DAY)]);
    expect(deriveStreak(days, NOW)).toBe(0);
  });
});

function makeDeps(over: Partial<DashboardDeps> = {}): DashboardDeps {
  return {
    listDecks: async () => [
      { id: 'd1', title: 'Korean TOPIK I' },
      { id: 'd2', title: 'Grammar' },
    ],
    listCardIdsByDeck: async (id) => (id === 'd1' ? ['c1', 'c2', 'c3', 'c4'] : ['c5', 'c6']),
    dueCardIds: async (ids) => new Set(ids.filter((i) => i === 'c1' || i === 'c2')),
    studiedCardIds: async (ids) => new Set(ids.filter((i) => i !== 'c4')),
    listSessions: async () => [{ id: 's1', startedAt: NOW - 10 * 60_000, finalizedAt: NOW }],
    attemptsBySession: async () => [
      { cardId: 'c1', answeredAt: NOW - 5 * 60_000 },
      { cardId: 'c2', answeredAt: NOW - 4 * 60_000 },
      { cardId: 'c1', answeredAt: NOW - 3 * 60_000 },
    ],
    now: () => NOW,
    ...over,
  };
}

describe('useDashboard — load pipeline', () => {
  it('derives due summary, deck views, minutes, words, mastery and ui=loaded', async () => {
    const { result } = renderHook(() => useDashboard(makeDeps()));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.dueCards).toBe(2);
    expect(d.dueDecks).toBe(1);
    expect(d.decks[0]).toMatchObject({ name: 'Korean TOPIK I', meta: '4 cards · 2 due', due: 2, progress: 75 });
    expect(d.decks[1]).toMatchObject({ meta: '2 cards · up to date', due: 0, progress: 100 });
    expect(d.stats.studiedToday).toBe('10m');
    expect(d.stats.goalPct).toBe(50);
    expect(d.stats.wordsToday).toBe('2');
    expect(d.stats.streak).toBe(1);
    expect(d.stats.masteredPct).toBe('83%'); // 5 of 6
    expect(result.current.ui).toBe('loaded');
  });

  it('no decks → ui=empty', async () => {
    const { result } = renderHook(() => useDashboard(makeDeps({ listDecks: async () => [] })));
    await waitFor(() => expect(result.current.ui).toBe('empty'));
  });

  it('nothing due → ui=caught-up', async () => {
    const { result } = renderHook(() => useDashboard(makeDeps({ dueCardIds: async () => new Set() })));
    await waitFor(() => expect(result.current.ui).toBe('caught-up'));
  });

  it('no study today with history → not-studied (streak alive) or streak-reset (broken)', async () => {
    const yesterdayOnly = makeDeps({
      listSessions: async () => [{ id: 's1', startedAt: NOW - DAY, finalizedAt: NOW - DAY + 8 * 60_000 }],
      attemptsBySession: async () => [{ cardId: 'c1', answeredAt: NOW - DAY + 60_000 }],
    });
    const { result } = renderHook(() => useDashboard(yesterdayOnly));
    await waitFor(() => expect(result.current.ui).toBe('not-studied'));

    const brokenStreak = makeDeps({
      listSessions: async () => [{ id: 's1', startedAt: NOW - 3 * DAY, finalizedAt: NOW - 3 * DAY + 8 * 60_000 }],
      attemptsBySession: async () => [{ cardId: 'c1', answeredAt: NOW - 3 * DAY + 60_000 }],
    });
    const broken = renderHook(() => useDashboard(brokenStreak));
    await waitFor(() => expect(broken.result.current.ui).toBe('streak-reset'));
  });

  it('goal minutes reached → ui=goal-met', async () => {
    const deps = makeDeps({
      listSessions: async () => [{ id: 's1', startedAt: NOW - 25 * 60_000, finalizedAt: NOW }],
    });
    const { result } = renderHook(() => useDashboard(deps));
    await waitFor(() => expect(result.current.ui).toBe('goal-met'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.stats.goalPct).toBe(100);
  });
});
