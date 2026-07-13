/**
 * Spaced-repetition scheduling (WBS 5.1).
 *
 * A deterministic SM-2-style scheduler over the `srs_state` model (ADR 0005:
 * dueAt/interval/ease/reps/lapses/stage). Given the current state + a grade + the
 * current time, `schedule` returns the next state — no randomness, so the same
 * inputs always produce the same due date (DoD: deterministic due/relearn logic).
 */

export type SrsStage = 'new' | 'learning' | 'review' | 'relearning';

/** How well the card was recalled. */
export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  readonly cardId: string;
  /** When the card is next due, epoch ms. */
  readonly dueAt: number;
  /** Scheduling interval in whole days (0 while learning). */
  readonly interval: number;
  /** Ease factor (SM-2), clamped to [MIN_EASE, ∞). */
  readonly ease: number;
  /** Successful reviews so far. */
  readonly reps: number;
  /** Times the card lapsed (graded `again` from review). */
  readonly lapses: number;
  readonly stage: SrsStage;
}

export const DAY_MS = 86_400_000;
/** A lapsed / relearning card comes back after this delay (10 minutes). */
export const RELEARN_MS = 600_000;

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const EASE_DELTA: Record<Grade, number> = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 };

function clampEase(ease: number): number {
  return ease < MIN_EASE ? MIN_EASE : ease;
}

/** The starting state for a brand-new card: due immediately, stage `new`. */
export function initialSrsState(cardId: string, now: number): SrsState {
  return { cardId, dueAt: now, interval: 0, ease: DEFAULT_EASE, reps: 0, lapses: 0, stage: 'new' };
}

/** Is the card due for review at `now`? */
export function isDue(state: SrsState, now: number): boolean {
  return state.dueAt <= now;
}

function isLearning(stage: SrsStage): boolean {
  return stage === 'new' || stage === 'learning' || stage === 'relearning';
}

/**
 * Compute the next SRS state from a grade. `again` lapses the card into relearning
 * (short delay); other grades graduate/advance it with an SM-2 interval. Pure +
 * deterministic.
 */
export function schedule(state: SrsState, grade: Grade, now: number): SrsState {
  const ease = clampEase(state.ease + EASE_DELTA[grade]);

  if (grade === 'again') {
    return {
      ...state,
      ease,
      stage: 'relearning',
      interval: 0,
      lapses: state.lapses + 1,
      dueAt: now + RELEARN_MS,
    };
  }

  let interval: number;
  if (isLearning(state.stage)) {
    // Graduating from learning/relearning: 4 days on easy, 1 day otherwise.
    interval = grade === 'easy' ? 4 : 1;
  } else {
    // Reviewing: grow the interval by an ease-derived factor.
    const factor = grade === 'hard' ? 1.2 : grade === 'easy' ? ease * 1.3 : ease;
    interval = Math.max(1, Math.round(state.interval * factor));
  }

  return {
    ...state,
    ease,
    stage: 'review',
    reps: state.reps + 1,
    interval,
    dueAt: now + interval * DAY_MS,
  };
}
