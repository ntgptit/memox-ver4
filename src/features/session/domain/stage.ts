/**
 * Session study stages (WBS 5.1).
 *
 * A full study session takes cards through five escalating recall stages, in this
 * fixed order (study-session spec: StageReview → StageMatch → StageGuess →
 * StageRecall → StageFill). Distinct from the SRS lifecycle stage in `./srs`.
 */

export type SessionStage = 'review' | 'match' | 'guess' | 'recall' | 'fill';

/** The five stages in their canonical order. */
export const STAGE_ORDER: readonly SessionStage[] = ['review', 'match', 'guess', 'recall', 'fill'];

/** The first stage a full session starts on. */
export function firstStage(): SessionStage {
  return STAGE_ORDER[0];
}

/** The stage after `stage`, or null if it is the last. */
export function nextStage(stage: SessionStage): SessionStage | null {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0 || i >= STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[i + 1];
}
