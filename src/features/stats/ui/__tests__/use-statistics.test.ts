/**
 * Statistics controller (WBS 8.1) — pure derivations (streaks, heatmap
 * intensity, Leitner boxes) and the load pipeline with fake deps: numbers from
 * the DB, the insufficient floor, scope re-derivation and error recovery.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import {
  dayKey,
  deriveHeatmap,
  deriveLeitner,
  deriveStreaks,
  useStatistics,
  MIN_ATTEMPTS,
  type StatisticsDeps,
} from '../use-statistics';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 6, 14, 12, 0, 0).getTime();

describe('pure derivations', () => {
  it('deriveStreaks: current run ending today + longest historical run', () => {
    const days = new Set([dayKey(NOW), dayKey(NOW - DAY), dayKey(NOW - 5 * DAY), dayKey(NOW - 6 * DAY), dayKey(NOW - 7 * DAY)]);
    const s = deriveStreaks(days, NOW);
    expect(s.current).toBe(2);
    expect(s.longest).toBe(3);
  });

  it('deriveHeatmap: 14 columns × 7 cells, intensity by minutes', () => {
    const map = new Map([[dayKey(NOW), 25]]);
    const weeks = deriveHeatmap(map, NOW);
    expect(weeks.length).toBe(14);
    expect(weeks[13].length).toBe(7);
    expect(weeks[13][6]).toBe(1); // today, 25 min → full intensity
    expect(weeks[0][0]).toBe(0.08); // idle day → faint
  });

  it('deriveLeitner: reps map to boxes 1–8, clamped', () => {
    const boxes = deriveLeitner([
      { cardId: 'a', dueAt: 0, reps: 0 },
      { cardId: 'b', dueAt: 0, reps: 2 },
      { cardId: 'c', dueAt: 0, reps: 40 },
    ]);
    expect(boxes[0]).toBe(1);
    expect(boxes[2]).toBe(1);
    expect(boxes[7]).toBe(1);
  });
});

function makeDeps(over: Partial<StatisticsDeps> = {}): StatisticsDeps {
  const attempts = Array.from({ length: MIN_ATTEMPTS + 2 }, (_, i) => ({
    cardId: i % 2 === 0 ? 'c1' : 'c2',
    result: (i % 4 === 0 ? 'again' : 'good') as 'again' | 'good',
    answeredAt: NOW - (i % 3) * DAY,
  }));
  return {
    listDecks: async () => [
      { id: 'd1', languagePairId: 'p1' },
      { id: 'd2', languagePairId: 'p2' },
    ],
    listCardIdsByDeck: async (id) => (id === 'd1' ? ['c1', 'c2'] : ['c3']),
    listSessions: async () => [{ id: 's1', startedAt: NOW - 12 * 60_000, finalizedAt: NOW }],
    attemptsBySession: async () => attempts,
    listSrs: async () => [
      { cardId: 'c1', dueAt: NOW - 1, reps: 1 },
      { cardId: 'c2', dueAt: NOW + DAY, reps: 3 },
      { cardId: 'c3', dueAt: NOW - 1, reps: 9 },
    ],
    now: () => NOW,
    ...over,
  };
}

describe('useStatistics — load pipeline', () => {
  it('derives the ready view from the DB (pair scope: first pair only)', async () => {
    const { result } = renderHook(() => useStatistics(makeDeps()));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.view.totalCards).toBe(2); // c3 excluded (other pair)
    expect(d.view.masteredCards).toBe(2);
    expect(d.view.dueCards).toBe(1);
    expect(d.view.leitner[1]).toBe(1); // reps 1 → box 2
    expect(d.view.leitner[3]).toBe(1); // reps 3 → box 4
    expect(d.view.currentStreak).toBeGreaterThan(0);
    expect(d.view.accuracyPct).toBeGreaterThan(0);
  });

  it('scope switch to All includes the other pair and reloads', async () => {
    const { result } = renderHook(() => useStatistics(makeDeps()));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    act(() => result.current.setScope('all'));
    expect(result.current.data.status).toBe('loading');
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.view.totalCards).toBe(3);
    expect(d.view.leitner[7]).toBe(1); // c3 reps 9 → box 8
  });

  it('below the attempt floor → insufficient', async () => {
    const deps = makeDeps({ attemptsBySession: async () => [] });
    const { result } = renderHook(() => useStatistics(deps));
    await waitFor(() => expect(result.current.data.status).toBe('insufficient'));
  });

  it('a thrown load → error; reload recovers', async () => {
    let fail = true;
    const good = makeDeps();
    const deps = makeDeps({
      listSessions: async () => {
        if (fail) throw new Error('boom');
        return good.listSessions();
      },
    });
    const { result } = renderHook(() => useStatistics(deps));
    await waitFor(() => expect(result.current.data.status).toBe('error'));
    fail = false;
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
  });
});
