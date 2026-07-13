/**
 * Study session model + state machine (WBS 5.1).
 *
 * A session runs an ordered set of cards through one or more {@link SessionStage}s
 * (`full` = all five in order; a single stage = just that mode). Progress is a pure
 * function of the session + how many attempts have been recorded, so resuming after
 * a restart just recomputes position from the persisted attempts (DoD: resume
 * rebuilds state). Pure domain (WBS 0.6 Results, no UI/DB).
 */

import { ok, err, validationError, type Result } from '@/shared';
import { STAGE_ORDER, type SessionStage } from './stage';
import type { Grade } from './srs';

export type SessionStatus = 'active' | 'finalized';

/** `full` runs all five stages; otherwise the session runs a single stage/mode. */
export type SessionMode = 'full' | SessionStage;

export interface Session {
  readonly id: string;
  readonly deckId: string;
  readonly mode: SessionMode;
  /** The cards to study, in presentation order. */
  readonly cardIds: readonly string[];
  readonly status: SessionStatus;
  readonly startedAt: number;
  readonly finalizedAt: number | null;
}

export interface Attempt {
  readonly id: string;
  readonly sessionId: string;
  readonly cardId: string;
  readonly stage: SessionStage;
  readonly result: Grade;
  readonly answeredAt: number;
}

export interface MakeSessionInput {
  id: string;
  deckId: string;
  mode: SessionMode;
  cardIds: readonly string[];
  startedAt: number;
}

/** The stages this session runs, in order. */
export function stagesFor(mode: SessionMode): readonly SessionStage[] {
  return mode === 'full' ? STAGE_ORDER : [mode];
}

/** Start a session. Requires at least one card. */
export function makeSession(input: MakeSessionInput): Result<Session> {
  if (input.cardIds.length === 0) {
    return err(validationError([{ field: 'cardIds', message: 'Add cards before studying.' }]));
  }
  return ok({
    id: input.id,
    deckId: input.deckId,
    mode: input.mode,
    cardIds: input.cardIds,
    status: 'active',
    startedAt: input.startedAt,
    finalizedAt: null,
  });
}

/** The current position within a session, or done. */
export interface SessionPosition {
  readonly stage: SessionStage;
  readonly cardId: string;
  /** 0-based index into the full (stage × card) sequence. */
  readonly index: number;
  readonly total: number;
}

export interface SessionProgress {
  readonly done: boolean;
  readonly position: SessionPosition | null;
  readonly total: number;
  readonly completed: number;
}

/**
 * Where the session stands given how many attempts have been recorded. The sequence
 * is stage-major: every card through stage 1, then every card through stage 2, …
 * Deterministic, so resume = call this with the persisted attempt count.
 */
export function sessionProgress(session: Session, attemptCount: number): SessionProgress {
  const stages = stagesFor(session.mode);
  const cards = session.cardIds.length;
  const total = stages.length * cards;
  const completed = Math.min(attemptCount, total);

  if (completed >= total) {
    return { done: true, position: null, total, completed: total };
  }
  const stageIndex = Math.floor(completed / cards);
  const cardIndex = completed % cards;
  return {
    done: false,
    total,
    completed,
    position: {
      stage: stages[stageIndex],
      cardId: session.cardIds[cardIndex],
      index: completed,
      total,
    },
  };
}

/** Finalize a session (all stages done, or the user ended it). Idempotent-safe. */
export function finalizeSession(session: Session, finalizedAt: number): Session {
  return { ...session, status: 'finalized', finalizedAt };
}
