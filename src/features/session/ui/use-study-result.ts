/**
 * Study-result controller (WBS 7.4) — finalizes the session (transactional via
 * the domain use case, with retry on failure) and derives the summary numbers
 * from the DB: cards reviewed, correct %, session minutes, missed cards, streak
 * and today's goal progress. Pure derivation helpers exported for unit tests.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { StudyResultData, StudyResultKind, StudyResultSummary } from './study-result-fixtures';

export interface ResultAttemptSource {
  readonly cardId: string;
  readonly result: 'again' | 'hard' | 'good' | 'easy';
  readonly answeredAt: number;
}

export interface ResultSessionSource {
  readonly id: string;
  readonly startedAt: number;
  readonly finalizedAt: number | null;
}

export interface StudyResultDeps {
  /** Finalize the session; resolves false on failure (drives finalize-error). */
  finalize: (sessionId: string) => Promise<boolean>;
  getSession: (sessionId: string) => Promise<ResultSessionSource | null>;
  attemptsBySession: (sessionId: string) => Promise<readonly ResultAttemptSource[]>;
  /** Total minutes studied today (across sessions) AFTER this one finalized. */
  minutesToday: () => Promise<number>;
  /** Calendar-day keys (YYYY-MM-DD) with any study activity. */
  activeDayKeys: () => Promise<ReadonlySet<string>>;
  now: () => number;
}

export const RESULT_GOAL_MINUTES = 20;
/** Missed-card count that flips the result into the many-wrong review nudge. */
export const MANY_WRONG_THRESHOLD = 5;
/** "Almost there" window — goal-missed shows when this close to the goal. */
export const ALMOST_THERE_MINUTES = 6;

/** Local calendar-day key (YYYY-MM-DD) for a timestamp. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Streak = consecutive study days ending today (today counts — just studied). */
export function deriveStreak(activeDays: ReadonlySet<string>, now: number): number {
  const DAY = 24 * 60 * 60 * 1000;
  let cursor = now;
  let streak = 0;
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

/** "m:ss" session duration (kit "6:30"). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}

/** Result kind, in kit priority: goal-met > many-wrong > goal-missed > standard. */
export function deriveKind(input: { goalMet: boolean; wrong: number; goalLeft: number }): StudyResultKind {
  if (input.goalMet) return 'goal-met';
  if (input.wrong >= MANY_WRONG_THRESHOLD) return 'many-wrong';
  if (input.goalLeft > 0 && input.goalLeft <= ALMOST_THERE_MINUTES) return 'goal-missed';
  return 'standard';
}

/** Assemble the summary from session + attempts + today totals (pure). */
export function deriveSummary(input: {
  session: ResultSessionSource;
  attempts: readonly ResultAttemptSource[];
  minutesToday: number;
  activeDays: ReadonlySet<string>;
  now: number;
}): StudyResultSummary {
  const { session, attempts, minutesToday, activeDays, now } = input;
  const cardIds = new Set(attempts.map((a) => a.cardId));
  const wrongIds = new Set(attempts.filter((a) => a.result === 'again').map((a) => a.cardId));
  const correct = attempts.length - attempts.filter((a) => a.result === 'again').length;
  const correctPct = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 100;
  const end = session.finalizedAt ?? (attempts.length > 0 ? attempts[attempts.length - 1].answeredAt : now);
  const goalDone = Math.min(minutesToday, 99);
  const goalLeft = Math.max(0, RESULT_GOAL_MINUTES - minutesToday);
  const goalMet = minutesToday >= RESULT_GOAL_MINUTES;

  return {
    kind: deriveKind({ goalMet, wrong: wrongIds.size, goalLeft }),
    cards: String(cardIds.size),
    correctPct: `${correctPct}%`,
    minutes: formatDuration(end - session.startedAt),
    wrong: wrongIds.size,
    streakDays: deriveStreak(activeDays, now),
    goalDone,
    goalMinutes: RESULT_GOAL_MINUTES,
    goalPct: Math.min(100, Math.round((minutesToday / RESULT_GOAL_MINUTES) * 100)),
    goalLeft,
  };
}

export interface StudyResultController {
  data: StudyResultData;
  retryFinalize: () => void;
}

export function useStudyResult(sessionId: string, deps: StudyResultDeps): StudyResultController {
  const [data, setData] = useState<StudyResultData>({ status: 'finalizing', retry: false });
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    if (busy.current) return;
    busy.current = true;
    let alive = true;
    void (async () => {
      const ok = await deps.finalize(sessionId);
      if (!alive) return;
      if (!ok) {
        setData({ status: 'error' });
        return;
      }
      const session = await deps.getSession(sessionId);
      if (!alive) return;
      if (session === null) {
        setData({ status: 'error' });
        return;
      }
      const [attempts, minutesToday, activeDays] = await Promise.all([
        deps.attemptsBySession(sessionId),
        deps.minutesToday(),
        deps.activeDayKeys(),
      ]);
      if (!alive) return;
      setData({
        status: 'ready',
        summary: deriveSummary({ session, attempts, minutesToday, activeDays, now: deps.now() }),
      });
    })().finally(() => {
      busy.current = false;
    });
    return () => {
      alive = false;
    };
  }, [sessionId, deps, attempt]);

  const retryFinalize = useCallback(() => {
    setData({ status: 'finalizing', retry: true });
    setAttempt((n) => n + 1);
  }, []);

  return { data, retryFinalize };
}
