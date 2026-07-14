/**
 * Study-result controller (WBS 7.4) — pure derivations (duration, kind priority,
 * streak, summary assembly) and the finalize lifecycle via renderHook: success →
 * ready summary; failure → finalize-error; retry re-runs the pipeline.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import {
  deriveKind,
  deriveStreak,
  deriveSummary,
  dayKey,
  formatDuration,
  useStudyResult,
  type StudyResultDeps,
} from '../use-study-result';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 6, 14, 12, 0, 0).getTime();

describe('pure derivations', () => {
  it('formatDuration renders m:ss', () => {
    expect(formatDuration(390_000)).toBe('6:30');
    expect(formatDuration(59_000)).toBe('0:59');
  });

  it('deriveKind priority: goal-met > many-wrong > goal-missed > standard', () => {
    expect(deriveKind({ goalMet: true, wrong: 9, goalLeft: 0 })).toBe('goal-met');
    expect(deriveKind({ goalMet: false, wrong: 5, goalLeft: 6 })).toBe('many-wrong');
    expect(deriveKind({ goalMet: false, wrong: 1, goalLeft: 6 })).toBe('goal-missed');
    expect(deriveKind({ goalMet: false, wrong: 0, goalLeft: 15 })).toBe('standard');
  });

  it('deriveStreak counts consecutive days ending today', () => {
    expect(deriveStreak(new Set([dayKey(NOW), dayKey(NOW - DAY)]), NOW)).toBe(2);
    expect(deriveStreak(new Set([dayKey(NOW - DAY)]), NOW)).toBe(0);
  });

  it('deriveSummary assembles cards/correct/minutes/wrong from attempts', () => {
    const s = deriveSummary({
      session: { id: 's1', startedAt: NOW - 390_000, finalizedAt: NOW },
      attempts: [
        { cardId: 'c1', result: 'good', answeredAt: NOW - 300_000 },
        { cardId: 'c2', result: 'again', answeredAt: NOW - 200_000 },
        { cardId: 'c2', result: 'good', answeredAt: NOW - 100_000 },
        { cardId: 'c3', result: 'easy', answeredAt: NOW - 50_000 },
      ],
      minutesToday: 14,
      activeDays: new Set([dayKey(NOW)]),
      now: NOW,
    });
    expect(s.cards).toBe('3');
    expect(s.correctPct).toBe('75%');
    expect(s.minutes).toBe('6:30');
    expect(s.wrong).toBe(1);
    expect(s.goalDone).toBe(14);
    expect(s.goalLeft).toBe(6);
    expect(s.kind).toBe('goal-missed');
    expect(s.streakDays).toBe(1);
  });
});

function makeDeps(over: Partial<StudyResultDeps> = {}): StudyResultDeps {
  return {
    finalize: async () => true,
    getSession: async () => ({ id: 's1', startedAt: NOW - 390_000, finalizedAt: NOW }),
    attemptsBySession: async () => [
      { cardId: 'c1', result: 'good', answeredAt: NOW - 60_000 },
      { cardId: 'c2', result: 'good', answeredAt: NOW - 30_000 },
    ],
    minutesToday: async () => 21,
    activeDayKeys: async () => new Set([dayKey(NOW)]),
    now: () => NOW,
    ...over,
  };
}

describe('useStudyResult — finalize lifecycle', () => {
  it('finalize success → ready summary (goal met at 21 minutes)', async () => {
    const { result } = renderHook(() => useStudyResult('s1', makeDeps()));
    expect(result.current.data.status).toBe('finalizing');
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.summary.kind).toBe('goal-met');
    expect(d.summary.cards).toBe('2');
  });

  it('finalize failure → finalize-error; retry re-runs and recovers', async () => {
    let fail = true;
    const deps = makeDeps({ finalize: async () => !fail });
    const { result } = renderHook(() => useStudyResult('s1', deps));
    await waitFor(() => expect(result.current.data.status).toBe('error'));

    fail = false;
    act(() => result.current.retryFinalize());
    expect(result.current.data).toEqual({ status: 'finalizing', retry: true });
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
  });
});
