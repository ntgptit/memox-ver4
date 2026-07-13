/**
 * Row ↔ entity mappers for the session domain (WBS 5.2). Pure. `session.card_ids` is
 * a JSON array text (the ordered card set, for lossless resume).
 */

import type {
  Session,
  SessionMode,
  SessionStatus,
  Attempt,
  SessionStage,
  Grade,
  SrsState,
  SrsStage,
} from '@/features/session/domain';

export interface SrsStateRow {
  card_id: string;
  due_at: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  stage: string;
}

export interface SessionRow {
  id: string;
  deck_id: string;
  mode: string;
  card_ids: string;
  status: string;
  started_at: number;
  finalized_at: number | null;
}

export interface AttemptRow {
  id: string;
  session_id: string;
  card_id: string;
  stage: string;
  result: string;
  answered_at: number;
}

function parseCardIds(json: string): string[] {
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function serializeCardIds(ids: readonly string[]): string {
  return JSON.stringify(ids);
}

export function rowToSrsState(row: SrsStateRow): SrsState {
  return {
    cardId: row.card_id,
    dueAt: row.due_at,
    interval: row.interval,
    ease: row.ease,
    reps: row.reps,
    lapses: row.lapses,
    stage: row.stage as SrsStage,
  };
}

export function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    deckId: row.deck_id,
    mode: row.mode as SessionMode,
    cardIds: parseCardIds(row.card_ids),
    status: row.status as SessionStatus,
    startedAt: row.started_at,
    finalizedAt: row.finalized_at,
  };
}

export function rowToAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    sessionId: row.session_id,
    cardId: row.card_id,
    stage: row.stage as SessionStage,
    result: row.result as Grade,
    answeredAt: row.answered_at,
  };
}
