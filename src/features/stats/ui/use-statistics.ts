/**
 * Statistics controller (WBS 8.1) — derives every chart from the DB: streaks
 * (current/longest) from attempt days, the 14-week study calendar, minutes per
 * weekday over the last 7 days, the Leitner box distribution (SRS reps →
 * box 1–8), 30-day accuracy, and the library overview. `insufficient` below
 * the minimum attempt count; the This-pair/All scope re-derives over the
 * first language pair's decks vs everything. Pure helpers exported for tests.
 */

import { useCallback, useEffect, useState } from 'react';

import type { StatisticsData, StatisticsView, StatsScope } from './statistics-fixtures';

export interface StatsDeckSource {
  readonly id: string;
  readonly languagePairId: string;
}

export interface StatsAttemptSource {
  readonly cardId: string;
  readonly result: 'again' | 'hard' | 'good' | 'easy';
  readonly answeredAt: number;
}

export interface StatsSessionSource {
  readonly id: string;
  readonly startedAt: number;
  readonly finalizedAt: number | null;
}

export interface StatsSrsSource {
  readonly cardId: string;
  readonly dueAt: number;
  readonly reps: number;
}

export interface StatisticsDeps {
  listDecks: () => Promise<readonly StatsDeckSource[]>;
  listCardIdsByDeck: (deckId: string) => Promise<readonly string[]>;
  listSessions: () => Promise<readonly StatsSessionSource[]>;
  attemptsBySession: (sessionId: string) => Promise<readonly StatsAttemptSource[]>;
  listSrs: () => Promise<readonly StatsSrsSource[]>;
  now: () => number;
}

/** Attempts below this render the insufficient state. */
export const MIN_ATTEMPTS = 10;
const DAY = 24 * 60 * 60 * 1000;

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Current streak (ends today or yesterday) + the longest run of study days. */
export function deriveStreaks(activeDays: ReadonlySet<string>, now: number): { current: number; longest: number } {
  let cursor = now;
  if (!activeDays.has(dayKey(cursor))) cursor -= DAY;
  let current = 0;
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor -= DAY;
  }
  // Longest: walk back a bounded year of days.
  let longest = 0;
  let run = 0;
  for (let i = 365; i >= 0; i -= 1) {
    if (activeDays.has(dayKey(now - i * DAY))) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return { current, longest: Math.max(longest, current) };
}

/** 14 weeks × 7 days of study intensity (0/0.25/0.45/0.7/1 by minutes). */
export function deriveHeatmap(minutesByDay: ReadonlyMap<string, number>, now: number): number[][] {
  const weeks: number[][] = [];
  // Oldest week first, each column Monday-first like the kit reads.
  for (let w = 13; w >= 0; w -= 1) {
    const col: number[] = [];
    for (let d = 6; d >= 0; d -= 1) {
      const minutes = minutesByDay.get(dayKey(now - (w * 7 + d) * DAY)) ?? 0;
      col.push(minutes === 0 ? 0.08 : minutes < 5 ? 0.25 : minutes < 10 ? 0.45 : minutes < 20 ? 0.7 : 1);
    }
    weeks.push(col);
  }
  return weeks;
}

/** SRS reps → Leitner box 1–8 histogram. */
export function deriveLeitner(srs: readonly StatsSrsSource[]): number[] {
  const boxes = Array.from({ length: 8 }, () => 0);
  for (const s of srs) {
    const box = Math.max(1, Math.min(8, s.reps + 1));
    boxes[box - 1] += 1;
  }
  return boxes;
}

async function load(deps: StatisticsDeps, scope: StatsScope): Promise<StatisticsData> {
  const now = deps.now();
  const decks = await deps.listDecks();
  const scoped = scope === 'all' || decks.length === 0 ? decks : decks.filter((d) => d.languagePairId === decks[0].languagePairId);
  const cardIds = new Set<string>();
  for (const deck of scoped) {
    for (const id of await deps.listCardIdsByDeck(deck.id)) cardIds.add(id);
  }

  const sessions = await deps.listSessions();
  const minutesByDay = new Map<string, number>();
  const activeDays = new Set<string>();
  let scopedAttempts = 0;
  let correct30 = 0;
  let total30 = 0;
  for (const s of sessions) {
    const attempts = (await deps.attemptsBySession(s.id)).filter((a) => cardIds.has(a.cardId));
    if (attempts.length === 0) continue;
    scopedAttempts += attempts.length;
    for (const a of attempts) {
      activeDays.add(dayKey(a.answeredAt));
      if (now - a.answeredAt <= 30 * DAY) {
        total30 += 1;
        if (a.result !== 'again') correct30 += 1;
      }
    }
    const last = attempts[attempts.length - 1].answeredAt;
    const end = s.finalizedAt ?? last;
    const key = dayKey(s.startedAt);
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + Math.max(0, Math.round((end - s.startedAt) / 60_000)));
  }

  if (scopedAttempts < MIN_ATTEMPTS) {
    return { status: 'insufficient' };
  }

  // Minutes per weekday over the trailing 7 days, Monday-first like the kit.
  const weekly = Array.from({ length: 7 }, () => 0);
  for (let i = 0; i < 7; i += 1) {
    const ts = now - i * DAY;
    const weekday = (new Date(ts).getDay() + 6) % 7; // Monday=0
    weekly[weekday] = minutesByDay.get(dayKey(ts)) ?? 0;
  }

  const srs = (await deps.listSrs()).filter((s) => cardIds.has(s.cardId));
  const streaks = deriveStreaks(activeDays, now);

  const view: StatisticsView = {
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    heatmap: deriveHeatmap(minutesByDay, now),
    weeklyMinutes: weekly,
    weeklyLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    leitner: deriveLeitner(srs),
    leitnerLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
    accuracyPct: total30 > 0 ? Math.round((correct30 / total30) * 100) : 100,
    totalCards: cardIds.size,
    masteredCards: srs.length,
    dueCards: srs.filter((s) => s.dueAt <= now).length,
  };
  return { status: 'ready', view };
}

export interface StatisticsController {
  data: StatisticsData;
  scope: StatsScope;
  setScope: (scope: StatsScope) => void;
  reload: () => void;
}

export function useStatistics(deps: StatisticsDeps | null): StatisticsController {
  const [data, setData] = useState<StatisticsData>({ status: 'loading' });
  const [scope, setScopeValue] = useState<StatsScope>('pair');
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void load(deps, scope)
      .then((next) => {
        if (alive) setData(next);
      })
      .catch(() => {
        if (alive) {
          setData({
            status: 'error',
            message: 'Something went wrong loading your statistics. Check your connection and try again.',
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [deps, scope, epoch]);

  const setScope = useCallback((s: StatsScope) => {
    setScopeValue(s);
    setData({ status: 'loading' });
  }, []);
  const reload = useCallback(() => {
    setData({ status: 'loading' });
    setEpoch((n) => n + 1);
  }, []);

  return { data, scope, setScope, reload };
}
