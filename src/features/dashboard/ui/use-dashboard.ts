/**
 * Dashboard controller (WBS 5.3) — loads decks/SRS/session data and derives the
 * Today numbers (due summary, daily-goal minutes, words learned, streak, library
 * mastery) plus the canonical UI state. Pure derivation helpers are exported for
 * unit tests; the repository wiring lives in the container.
 */

import { useCallback, useEffect, useState } from 'react';

import type { DashboardData, DashboardDeckView, DashboardStats, DashboardUiState } from './dashboard-fixtures';

export interface DashboardDeckSource {
  readonly id: string;
  readonly title: string;
}

export interface DashboardSessionSource {
  readonly id: string;
  readonly startedAt: number;
  readonly finalizedAt: number | null;
}

export interface DashboardAttemptSource {
  readonly cardId: string;
  readonly answeredAt: number;
}

export interface DashboardDeps {
  listDecks: () => Promise<readonly DashboardDeckSource[]>;
  listCardIdsByDeck: (deckId: string) => Promise<readonly string[]>;
  /** Card ids due at or before now, out of `ids`. */
  dueCardIds: (ids: readonly string[]) => Promise<ReadonlySet<string>>;
  /** Card ids with any SRS state (studied at least once), out of `ids`. */
  studiedCardIds: (ids: readonly string[]) => Promise<ReadonlySet<string>>;
  listSessions: () => Promise<readonly DashboardSessionSource[]>;
  attemptsBySession: (sessionId: string) => Promise<readonly DashboardAttemptSource[]>;
  now: () => number;
}

/** The daily goal, in minutes (kit constant). */
export const DAILY_GOAL_MINUTES = 20;

/** Local calendar-day key (YYYY-MM-DD) for a timestamp. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Streak = consecutive study days ending today — or ending yesterday when today
 * has no study yet (the streak survives until the day is actually missed).
 */
export function deriveStreak(activeDays: ReadonlySet<string>, now: number): number {
  const DAY = 24 * 60 * 60 * 1000;
  let cursor = now;
  if (!activeDays.has(dayKey(cursor))) cursor -= DAY;
  let streak = 0;
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

/** Time-of-day greeting (the kit fixture's "Good evening" at fixed hours). */
export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Compact minutes display for the Today strip ("12m"). */
function minutesLabel(minutes: number): string {
  return `${minutes}m`;
}

export interface DashboardController {
  data: DashboardData;
  ui: DashboardUiState;
  reload: () => void;
}

interface Loaded {
  data: DashboardData;
  ui: DashboardUiState;
}

async function load(deps: DashboardDeps): Promise<Loaded> {
  const now = deps.now();
  const today = dayKey(now);

  const decks = await deps.listDecks();
  if (decks.length === 0) {
    return {
      ui: 'empty',
      data: {
        status: 'ready',
        greeting: greetingForHour(new Date(now).getHours()),
        decks: [],
        dueCards: 0,
        dueDecks: 0,
        stats: {
          goalPct: 0,
          minutes: 0,
          goalMinutes: DAILY_GOAL_MINUTES,
          studiedToday: minutesLabel(0),
          wordsToday: '0',
          streak: 0,
          masteredPct: '0%',
        },
      },
    };
  }

  // Per-deck cards → due/studied sets → deck views + totals.
  let totalCards = 0;
  let totalStudied = 0;
  let dueCards = 0;
  let dueDecks = 0;
  const views: DashboardDeckView[] = [];
  for (const deck of decks) {
    const ids = await deps.listCardIdsByDeck(deck.id);
    const due = ids.length > 0 ? (await deps.dueCardIds(ids)).size : 0;
    const studied = ids.length > 0 ? (await deps.studiedCardIds(ids)).size : 0;
    totalCards += ids.length;
    totalStudied += studied;
    dueCards += due;
    if (due > 0) dueDecks += 1;
    views.push({
      id: deck.id,
      icon: 'style',
      tone: 'accent',
      name: deck.title,
      meta: `${ids.length.toLocaleString('en-US')} cards · ${due > 0 ? `${due} due` : 'up to date'}`,
      due,
      progress: ids.length > 0 ? Math.round((studied / ids.length) * 100) : 0,
    });
  }

  // Today's sessions → minutes studied + words touched; all days → streak.
  const sessions = await deps.listSessions();
  const activeDays = new Set<string>();
  let minutes = 0;
  const wordsToday = new Set<string>();
  for (const s of sessions) {
    const attempts = await deps.attemptsBySession(s.id);
    for (const a of attempts) activeDays.add(dayKey(a.answeredAt));
    if (dayKey(s.startedAt) !== today) continue;
    const last = attempts.length > 0 ? attempts[attempts.length - 1].answeredAt : s.startedAt;
    const end = s.finalizedAt ?? last;
    minutes += Math.max(0, Math.round((end - s.startedAt) / 60_000));
    for (const a of attempts) if (dayKey(a.answeredAt) === today) wordsToday.add(a.cardId);
  }

  const streak = deriveStreak(activeDays, now);
  const studiedToday = activeDays.has(today);
  const goalPct = Math.min(100, Math.round((minutes / DAILY_GOAL_MINUTES) * 100));
  const stats: DashboardStats = {
    goalPct,
    minutes: Math.min(minutes, DAILY_GOAL_MINUTES),
    goalMinutes: DAILY_GOAL_MINUTES,
    studiedToday: minutesLabel(minutes),
    wordsToday: String(wordsToday.size),
    streak,
    masteredPct: `${totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0}%`,
  };

  const ui: DashboardUiState =
    dueCards === 0
      ? 'caught-up'
      : goalPct >= 100
        ? 'goal-met'
        : !studiedToday && streak === 0 && activeDays.size > 0
          ? 'streak-reset'
          : !studiedToday
            ? 'not-studied'
            : 'loaded';

  return {
    ui,
    data: {
      status: 'ready',
      greeting: greetingForHour(new Date(now).getHours()),
      decks: views,
      dueCards,
      dueDecks,
      stats,
    },
  };
}

export function useDashboard(deps: DashboardDeps): DashboardController {
  const [state, setState] = useState<Loaded>({ data: { status: 'loading' }, ui: 'loading' });
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    let alive = true;
    void load(deps).then((next) => {
      if (alive) setState(next);
    });
    return () => {
      alive = false;
    };
  }, [deps, epoch]);

  const reload = useCallback(() => setEpoch((n) => n + 1), []);
  return { data: state.data, ui: state.ui, reload };
}
