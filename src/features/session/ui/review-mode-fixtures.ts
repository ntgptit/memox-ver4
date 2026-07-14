/**
 * Review-mode slice (WBS 6.1) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/review-mode/ReviewMode.jsx` VERBATIM (term 학교 · meaning
 * school · progress 7/20). 6 states (contract §6).
 */

export type ReviewModeData =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly term: string; readonly meaning: string; readonly done: number; readonly total: number };

export type ReviewModeUiState = 'browsing' | 'editing' | 'audio' | 'loading' | 'error' | 'end';

export interface ReviewModeFixture {
  readonly data: ReviewModeData;
  readonly ui: ReviewModeUiState;
}

const READY: ReviewModeData = { status: 'ready', term: '학교', meaning: 'school', done: 7, total: 20 };

/** Fixtures keyed by canonical state name (contract §6 — 6 states). */
export const REVIEW_MODE_FIXTURES: Record<ReviewModeUiState, ReviewModeFixture> = {
  browsing: { data: READY, ui: 'browsing' },
  editing: { data: READY, ui: 'editing' },
  audio: { data: READY, ui: 'audio' },
  loading: { data: { status: 'loading' }, ui: 'loading' },
  error: {
    data: { status: 'error', message: 'Something went wrong loading your cards. Check your connection and try again.' },
    ui: 'error',
  },
  end: { data: { status: 'ready', term: '', meaning: '', done: 20, total: 20 }, ui: 'end' },
};

export type ReviewModeFixtureKey = keyof typeof REVIEW_MODE_FIXTURES;
