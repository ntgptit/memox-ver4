/**
 * Study-session shell slice (WBS 5.5) — view model + state-matrix fixtures.
 * Mirrors the kit's `_features/study-session/StudySession.jsx` META VERBATIM
 * (stage labels + cumulative done/total across the 5-stage NewLearn flow, the
 * due-review pair 학교/school, the guess options school/hospital/park, the
 * match columns). 10 states (contract §6).
 */

export type StudySessionUiState =
  | 'stage1-review'
  | 'stage2-match'
  | 'stage3-guess'
  | 'stage4-recall'
  | 'stage5-fill'
  | 'relearn'
  | 'due-review'
  | 'exit'
  | 'resume-error'
  | 'answer-save-error';

export interface StageMeta {
  readonly label: string;
  readonly done: number;
  readonly total: number;
}

/** Kit META, verbatim. */
export const STUDY_SESSION_META: Record<Exclude<StudySessionUiState, 'resume-error'>, StageMeta> = {
  'stage1-review': { label: 'Stage 1 · Review', done: 4, total: 25 },
  'stage2-match': { label: 'Stage 2 · Match', done: 8, total: 25 },
  'stage3-guess': { label: 'Stage 3 · Guess', done: 12, total: 25 },
  'stage4-recall': { label: 'Stage 4 · Recall', done: 16, total: 25 },
  'stage5-fill': { label: 'Stage 5 · Fill', done: 21, total: 25 },
  relearn: { label: 'Stage 3 · Guess', done: 12, total: 25 },
  'due-review': { label: 'Review · due cards', done: 10, total: 20 },
  exit: { label: 'Stage 1 · Review', done: 4, total: 25 },
  'answer-save-error': { label: 'Stage 5 · Fill', done: 21, total: 25 },
};

/** The per-stage card content the shell bodies show (kit mock values). */
export interface StageContent {
  readonly term: string;
  readonly meaning: string;
  /** Review stage extra line ("noun · a place of learning"). */
  readonly note: string;
  /** Guess options (correct first in the kit mock). */
  readonly options: readonly string[];
  /** Match columns. */
  readonly left: readonly string[];
  readonly right: readonly string[];
}

/** Kit stage-body fixture content, verbatim. */
export const STAGE_CONTENT: StageContent = {
  term: '학교',
  meaning: 'school',
  note: 'noun · a place of learning',
  options: ['school', 'hospital', 'park'],
  left: ['school', 'love', 'friend'],
  right: ['사랑', '친구', '학교'],
};

/** Recall stage prompt (kit uses 친구 there). */
export const RECALL_TERM = '친구';

export type StudySessionFixtureKey = StudySessionUiState;
export const STUDY_SESSION_STATES: readonly StudySessionUiState[] = [
  'stage1-review',
  'stage2-match',
  'stage3-guess',
  'stage4-recall',
  'stage5-fill',
  'relearn',
  'due-review',
  'exit',
  'resume-error',
  'answer-save-error',
];
