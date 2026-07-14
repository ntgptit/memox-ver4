/**
 * Study-result slice (WBS 7.4) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/study-result/StudyResult.jsx` HEAD map and fixture numbers
 * VERBATIM (24 cards · 88% · 6:30, 8 wrong, streak 12→13, goal 14/20 vs 22/20).
 */

export type StudyResultKind = 'standard' | 'goal-met' | 'goal-missed' | 'many-wrong';

/** The session summary a finished result screen shows. */
export interface StudyResultSummary {
  readonly kind: StudyResultKind;
  /** Stat trio (display strings, kit "24" / "88%" / "6:30"). */
  readonly cards: string;
  readonly correctPct: string;
  readonly minutes: string;
  /** Missed-card count (drives the many-wrong copy/CTA). */
  readonly wrong: number;
  /** Streak card numbers. */
  readonly streakDays: number;
  readonly goalDone: number;
  readonly goalMinutes: number;
  readonly goalPct: number;
  /** Minutes left to today's goal (goal-missed hero copy). */
  readonly goalLeft: number;
}

export type StudyResultData =
  | { readonly status: 'finalizing'; readonly retry: boolean }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly summary: StudyResultSummary };

export type StudyResultUiState =
  | 'standard'
  | 'goal-met'
  | 'goal-missed'
  | 'many-wrong'
  | 'finalizing'
  | 'retry-finalize'
  | 'finalize-error';

export interface StudyResultFixture {
  readonly data: StudyResultData;
  readonly ui: StudyResultUiState;
}

/** Kit loaded-state summary (standard). */
export const STUDY_RESULT_SUMMARY: StudyResultSummary = {
  kind: 'standard',
  cards: '24',
  correctPct: '88%',
  minutes: '6:30',
  wrong: 8,
  streakDays: 12,
  goalDone: 14,
  goalMinutes: 20,
  goalPct: 70,
  goalLeft: 6,
};

const summary = (over: Partial<StudyResultSummary>): StudyResultData => ({
  status: 'ready',
  summary: { ...STUDY_RESULT_SUMMARY, ...over },
});

/** Fixtures keyed by canonical state name (contract §6 — 7 states). */
export const STUDY_RESULT_FIXTURES: Record<StudyResultUiState, StudyResultFixture> = {
  standard: { data: summary({}), ui: 'standard' },
  // Kit goal-met: streak already incremented, 22/20 minutes, full bar.
  'goal-met': {
    data: summary({ kind: 'goal-met', streakDays: 13, goalDone: 22, goalPct: 100, goalLeft: 0 }),
    ui: 'goal-met',
  },
  'goal-missed': { data: summary({ kind: 'goal-missed' }), ui: 'goal-missed' },
  'many-wrong': { data: summary({ kind: 'many-wrong' }), ui: 'many-wrong' },
  finalizing: { data: { status: 'finalizing', retry: false }, ui: 'finalizing' },
  'retry-finalize': { data: { status: 'finalizing', retry: true }, ui: 'retry-finalize' },
  'finalize-error': { data: { status: 'error' }, ui: 'finalize-error' },
};

export type StudyResultFixtureKey = keyof typeof STUDY_RESULT_FIXTURES;
