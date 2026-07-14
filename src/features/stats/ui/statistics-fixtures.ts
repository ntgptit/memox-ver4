/**
 * Statistics slice (WBS 8.1) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/statistics/Statistics.jsx` VERBATIM: streak 12/28, the
 * 14-week heatmap opacity pattern, weekly minutes [12,18,9,24,15,30,20] M–S,
 * Leitner boxes [40,28,22,18,12,9,6,4], accuracy 88%, overview 1240/680/96.
 * 5 states (contract §6).
 */

export type StatsScope = 'pair' | 'all';

export interface StatisticsView {
  readonly currentStreak: number;
  readonly longestStreak: number;
  /** 14 weeks × 7 days of intensity (0–1), column-major like the kit. */
  readonly heatmap: readonly (readonly number[])[];
  readonly weeklyMinutes: readonly number[];
  readonly weeklyLabels: readonly string[];
  readonly leitner: readonly number[];
  readonly leitnerLabels: readonly string[];
  readonly accuracyPct: number;
  readonly totalCards: number;
  readonly masteredCards: number;
  readonly dueCards: number;
}

export type StatisticsData =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'insufficient' }
  | { readonly status: 'ready'; readonly view: StatisticsView };

export type StatisticsUiState = 'loaded' | 'scope-switch' | 'insufficient' | 'loading' | 'error';

/** Kit heatmap: opacity [0.08,0.25,0.45,0.7,1][(w*7 + d*3) % 5]. */
const HEATMAP: readonly (readonly number[])[] = Array.from({ length: 14 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => [0.08, 0.25, 0.45, 0.7, 1][(w * 7 + d * 3) % 5]),
);

/** Kit loaded view, verbatim. */
export const STATISTICS_VIEW: StatisticsView = {
  currentStreak: 12,
  longestStreak: 28,
  heatmap: HEATMAP,
  weeklyMinutes: [12, 18, 9, 24, 15, 30, 20],
  weeklyLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  leitner: [40, 28, 22, 18, 12, 9, 6, 4],
  leitnerLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
  accuracyPct: 88,
  totalCards: 1240,
  masteredCards: 680,
  dueCards: 96,
};

export interface StatisticsFixture {
  readonly data: StatisticsData;
  readonly ui: StatisticsUiState;
  readonly scope: StatsScope;
}

/** Fixtures keyed by canonical state name (contract §6 — 5 states). */
export const STATISTICS_FIXTURES: Record<StatisticsUiState, StatisticsFixture> = {
  loaded: { data: { status: 'ready', view: STATISTICS_VIEW }, ui: 'loaded', scope: 'pair' },
  'scope-switch': { data: { status: 'ready', view: STATISTICS_VIEW }, ui: 'scope-switch', scope: 'all' },
  insufficient: { data: { status: 'insufficient' }, ui: 'insufficient', scope: 'pair' },
  loading: { data: { status: 'loading' }, ui: 'loading', scope: 'pair' },
  error: {
    data: { status: 'error', message: 'Something went wrong loading your statistics. Check your connection and try again.' },
    ui: 'error',
    scope: 'pair',
  },
};

export type StatisticsFixtureKey = keyof typeof STATISTICS_FIXTURES;
