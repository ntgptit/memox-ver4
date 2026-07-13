/**
 * Ports the session domain depends on (WBS 5.1). Implemented by the data layer
 * (WBS 5.2) over `expo-sqlite`; the domain knows only these interfaces.
 */

import type { Repository, Observable, Result } from '@/shared';
import type { Session, Attempt } from './session';
import type { SrsState } from './srs';

/** Persistence + reactivity for study sessions. */
export interface SessionRepository extends Repository<Session>, Observable {
  /** The active (un-finalized) session for a deck, if any — for resume. */
  activeForDeck(deckId: string): Promise<Result<Session | null>>;
}

/** Persistence for per-stage attempts within a session. */
export interface AttemptRepository extends Repository<Attempt>, Observable {
  /** All attempts of a session, oldest first — the resume rebuild reads these. */
  listBySession(sessionId: string): Promise<Result<Attempt[]>>;
}

/** Persistence for per-card SRS scheduling state (keyed by cardId). */
export interface SrsStateRepository extends Repository<SrsState>, Observable {
  /** Cards due at or before `now`, across a set of cards. */
  dueCards(cardIds: readonly string[], now: number): Promise<Result<SrsState[]>>;
}
