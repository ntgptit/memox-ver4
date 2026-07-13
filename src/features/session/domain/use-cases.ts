/**
 * Study-session use cases (WBS 5.1): start, record an answer (attempt + SRS update),
 * resume, and finalize. Pure orchestration over the ports; each returns a
 * {@link Result}. Factory functions inject ports + services for testability.
 */

import { isErr, ok, type Result, type UseCase, type IdGenerator, type Clock } from '@/shared';
import {
  makeSession,
  finalizeSession as finalizeSessionEntity,
  sessionProgress,
  type Session,
  type Attempt,
  type SessionMode,
  type SessionProgress,
} from './session';
import type { SessionStage } from './stage';
import { schedule, initialSrsState, type Grade, type SrsState } from './srs';
import type { SessionRepository, AttemptRepository, SrsStateRepository } from './ports';

export interface SessionDeps {
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface StartSessionInput {
  deckId: string;
  mode: SessionMode;
  cardIds: readonly string[];
}

/** Start (or restart) a study session over an ordered set of cards. */
export function startSession(deps: Pick<SessionDeps, 'sessions' | 'ids' | 'clock'>): UseCase<StartSessionInput, Session> {
  return {
    async execute(input) {
      const built = makeSession({
        id: deps.ids(),
        deckId: input.deckId,
        mode: input.mode,
        cardIds: input.cardIds,
        startedAt: deps.clock(),
      });
      return built.ok ? deps.sessions.save(built.value) : built;
    },
  };
}

export interface RecordAnswerInput {
  sessionId: string;
  cardId: string;
  stage: SessionStage;
  grade: Grade;
}

export interface RecordAnswerOutput {
  attempt: Attempt;
  srs: SrsState;
}

/**
 * Record one answer: persist the {@link Attempt} and advance the card's SRS state
 * with the grade. A brand-new card starts from {@link initialSrsState}.
 */
export function recordAnswer(
  deps: Pick<SessionDeps, 'attempts' | 'srs' | 'ids' | 'clock'>,
): UseCase<RecordAnswerInput, RecordAnswerOutput> {
  return {
    async execute(input) {
      const now = deps.clock();

      const existing = await deps.srs.getById(input.cardId);
      const current: SrsState = existing.ok ? existing.value : initialSrsState(input.cardId, now);
      const nextSrs = schedule(current, input.grade, now);
      const savedSrs = await deps.srs.save(nextSrs);
      if (isErr(savedSrs)) {
        return savedSrs;
      }

      const attempt: Attempt = {
        id: deps.ids(),
        sessionId: input.sessionId,
        cardId: input.cardId,
        stage: input.stage,
        result: input.grade,
        answeredAt: now,
      };
      const savedAttempt = await deps.attempts.save(attempt);
      if (isErr(savedAttempt)) {
        return savedAttempt;
      }
      return ok({ attempt: savedAttempt.value, srs: savedSrs.value });
    },
  };
}

/** Resume a session: rebuild its progress from the persisted attempts. */
export function resumeSession(
  deps: Pick<SessionDeps, 'sessions' | 'attempts'>,
): UseCase<string, { session: Session; progress: SessionProgress }> {
  return {
    async execute(sessionId) {
      const session = await deps.sessions.getById(sessionId);
      if (isErr(session)) {
        return session;
      }
      const attempts = await deps.attempts.listBySession(sessionId);
      if (isErr(attempts)) {
        return attempts;
      }
      return ok({
        session: session.value,
        progress: sessionProgress(session.value, attempts.value.length),
      });
    },
  };
}

/** Finalize a session (mark it done). */
export function finalizeSessionUseCase(deps: Pick<SessionDeps, 'sessions' | 'clock'>): UseCase<string, Session> {
  return {
    async execute(sessionId) {
      const found = await deps.sessions.getById(sessionId);
      if (isErr(found)) {
        return found;
      }
      return deps.sessions.save(finalizeSessionEntity(found.value, deps.clock()));
    },
  };
}

/** The cards from a set that are due for review now. */
export function getDueCards(deps: Pick<SessionDeps, 'srs' | 'clock'>): UseCase<readonly string[], SrsState[]> {
  return {
    execute(cardIds): Promise<Result<SrsState[]>> {
      return deps.srs.dueCards(cardIds, deps.clock());
    },
  };
}
