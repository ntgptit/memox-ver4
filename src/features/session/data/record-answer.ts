/**
 * Transactional answer persistence (WBS 5.2).
 *
 * Recording an answer must persist the {@link Attempt} AND the advanced
 * {@link SrsState} together — or neither. `persistAnswer` wraps both writes in one
 * transaction (ADR 0005 `tx`), so a failure rolls both back and the SRS never
 * advances without its attempt (DoD: SRS updates transactional, rollback test).
 */

import { ok, err, storageError, type Result } from '@/shared';
import type { Attempt, SrsState } from '@/features/session/domain';
import type { SqlDatabase } from '@/db/sql';

export async function persistAnswer(
  db: SqlDatabase,
  attempt: Attempt,
  srs: SrsState,
): Promise<Result<{ attempt: Attempt; srs: SrsState }>> {
  try {
    await db.tx(async (r) => {
      await r.run(
        `INSERT INTO srs_state (card_id, due_at, interval, ease, reps, lapses, stage)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(card_id) DO UPDATE SET
           due_at = excluded.due_at, interval = excluded.interval, ease = excluded.ease,
           reps = excluded.reps, lapses = excluded.lapses, stage = excluded.stage`,
        [srs.cardId, srs.dueAt, srs.interval, srs.ease, srs.reps, srs.lapses, srs.stage],
      );
      await r.run(
        `INSERT INTO attempt (id, session_id, card_id, stage, result, answered_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attempt.id, attempt.sessionId, attempt.cardId, attempt.stage, attempt.result, attempt.answeredAt],
      );
    });
    return ok({ attempt, srs });
  } catch (cause) {
    return err(storageError('Could not save your answer.', cause));
  }
}
