/**
 * Dashboard slice (WBS 5.3) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/dashboard/Dashboard.jsx` constants VERBATIM (DECKS,
 * CAUGHT_DECKS and the per-state numbers), so the golden shots stay
 * pixel-comparable with the kit references.
 */

import type { MxIconTileTone } from '@/design-system';

export interface DashboardDeckView {
  readonly id: string;
  readonly icon: string;
  readonly tone: MxIconTileTone;
  readonly name: string;
  readonly meta: string;
  readonly due: number;
  readonly progress: number;
}

/** Kit DECKS, verbatim. */
export const DASHBOARD_DECKS: readonly DashboardDeckView[] = [
  { id: 'd-topik', icon: 'translate', tone: 'accent', name: 'TOPIK I — Vocabulary', meta: '320 cards · 48 due', due: 48, progress: 72 },
  { id: 'd-grammar', icon: 'menu_book', tone: 'warning', name: 'Basic Grammar', meta: '180 cards · 23 due', due: 23, progress: 54 },
  { id: 'd-conv', icon: 'record_voice_over', tone: 'success', name: 'Daily Conversation', meta: '150 cards · 6 due', due: 6, progress: 88 },
];

/** Kit CAUGHT_DECKS — 0 due everywhere so rows never contradict the caught-up hero. */
export const DASHBOARD_CAUGHT_DECKS: readonly DashboardDeckView[] = [
  { id: 'd-topik', icon: 'translate', tone: 'accent', name: 'TOPIK I — Vocabulary', meta: '320 cards · up to date', due: 0, progress: 100 },
  { id: 'd-grammar', icon: 'menu_book', tone: 'warning', name: 'Basic Grammar', meta: '180 cards · up to date', due: 0, progress: 100 },
  { id: 'd-conv', icon: 'record_voice_over', tone: 'success', name: 'Daily Conversation', meta: '150 cards · up to date', due: 0, progress: 100 },
];

/** The study numbers a loaded dashboard shows (kit per-state constants). */
export interface DashboardStats {
  /** Daily-goal completion percent (goal card + its bar). */
  readonly goalPct: number;
  /** Goal-card minutes line ("14 of 20 minutes · 6 minutes left"). */
  readonly minutes: number;
  readonly goalMinutes: number;
  /** Today strip values (kit renders these as display strings). */
  readonly studiedToday: string;
  readonly wordsToday: string;
  readonly streak: number;
  readonly masteredPct: string;
}

/** Kit loaded-state stats (also streak-reset/goal-met bases — see fixtures). */
export const DASHBOARD_STATS: DashboardStats = {
  goalPct: 70,
  minutes: 14,
  goalMinutes: 20,
  studiedToday: '12m',
  wordsToday: '24',
  streak: 12,
  masteredPct: '55%',
};

export type DashboardData =
  | { readonly status: 'loading' }
  | {
      readonly status: 'ready';
      readonly greeting: string;
      readonly decks: readonly DashboardDeckView[];
      /** Continue-studying caption numbers ("24 cards due across 3 decks"). */
      readonly dueCards: number;
      readonly dueDecks: number;
      readonly stats: DashboardStats;
    };

export type DashboardUiState =
  | 'loaded'
  | 'not-studied'
  | 'goal-met'
  | 'streak-reset'
  | 'caught-up'
  | 'empty'
  | 'loading'
  | 'create-sheet';

export interface DashboardFixture {
  readonly data: DashboardData;
  readonly ui: DashboardUiState;
}

const GREETING = 'Good evening, Linh';

const ready = (over: Partial<Extract<DashboardData, { status: 'ready' }>> = {}): DashboardData => ({
  status: 'ready',
  greeting: GREETING,
  decks: DASHBOARD_DECKS,
  dueCards: 24,
  dueDecks: DASHBOARD_DECKS.length,
  stats: DASHBOARD_STATS,
  ...over,
});

/** Fixtures keyed by canonical state name (contract §6 — 8 states). */
export const DASHBOARD_FIXTURES: Record<DashboardUiState, DashboardFixture> = {
  loaded: { data: ready(), ui: 'loaded' },
  // Kit not-studied: nothing studied today — 0 goal progress, zeroed today strip.
  'not-studied': {
    data: ready({ stats: { ...DASHBOARD_STATS, goalPct: 0, minutes: 0, studiedToday: '0m', wordsToday: '0' } }),
    ui: 'not-studied',
  },
  // Kit goal-met: 100% + streak already incremented (13).
  'goal-met': {
    data: ready({ stats: { ...DASHBOARD_STATS, goalPct: 100, minutes: 20, streak: 13 } }),
    ui: 'goal-met',
  },
  'streak-reset': { data: ready({ stats: { ...DASHBOARD_STATS, streak: 0 } }), ui: 'streak-reset' },
  'caught-up': { data: ready({ decks: DASHBOARD_CAUGHT_DECKS, dueCards: 0 }), ui: 'caught-up' },
  empty: { data: ready({ decks: [] }), ui: 'empty' },
  loading: { data: { status: 'loading' }, ui: 'loading' },
  'create-sheet': { data: ready(), ui: 'create-sheet' },
};

export type DashboardFixtureKey = keyof typeof DASHBOARD_FIXTURES;
