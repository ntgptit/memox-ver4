/**
 * Session-domain repositories over SQLite (WBS 5.2).
 *
 * Implement the WBS 5.1 ports against the {@link SqlDatabase} port. Sessions persist
 * their ordered card set (JSON) + status so a kill/restart resumes losslessly;
 * attempts persist per stage; SRS state is keyed by card. Reads return typed
 * {@link Result}s; writes upsert + emit a change signal (ADR 0003).
 */

import { ok, err, notFoundError, type Result } from '@/shared';
import type {
  Session,
  Attempt,
  SrsState,
  SessionRepository,
  AttemptRepository,
  SrsStateRepository,
} from '@/features/session/domain';
import { createChangeSignal } from '@/db/change-signal';
import type { SqlDatabase } from '@/db/sql';
import {
  rowToSession,
  rowToAttempt,
  rowToSrsState,
  serializeCardIds,
  type SessionRow,
  type AttemptRow,
  type SrsStateRow,
} from './mappers';

export class SqliteSessionRepository implements SessionRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<Session>> {
    const row = await this.db.get<SessionRow>('SELECT * FROM session WHERE id = ?', [id]);
    return row ? ok(rowToSession(row)) : err(notFoundError('Session'));
  }

  async list(): Promise<Result<Session[]>> {
    const rows = await this.db.all<SessionRow>('SELECT * FROM session ORDER BY started_at');
    return ok(rows.map(rowToSession));
  }

  async activeForDeck(deckId: string): Promise<Result<Session | null>> {
    const row = await this.db.get<SessionRow>(
      "SELECT * FROM session WHERE deck_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1",
      [deckId],
    );
    return ok(row ? rowToSession(row) : null);
  }

  async save(entity: Session): Promise<Result<Session>> {
    await this.db.run(
      `INSERT INTO session (id, deck_id, mode, card_ids, status, started_at, finalized_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         mode = excluded.mode,
         card_ids = excluded.card_ids,
         status = excluded.status,
         finalized_at = excluded.finalized_at`,
      [
        entity.id,
        entity.deckId,
        entity.mode,
        serializeCardIds(entity.cardIds),
        entity.status,
        entity.startedAt,
        entity.finalizedAt,
      ],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM session WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}

export class SqliteAttemptRepository implements AttemptRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<Attempt>> {
    const row = await this.db.get<AttemptRow>('SELECT * FROM attempt WHERE id = ?', [id]);
    return row ? ok(rowToAttempt(row)) : err(notFoundError('Attempt'));
  }

  async list(): Promise<Result<Attempt[]>> {
    const rows = await this.db.all<AttemptRow>('SELECT * FROM attempt ORDER BY answered_at');
    return ok(rows.map(rowToAttempt));
  }

  async listBySession(sessionId: string): Promise<Result<Attempt[]>> {
    const rows = await this.db.all<AttemptRow>(
      'SELECT * FROM attempt WHERE session_id = ? ORDER BY answered_at',
      [sessionId],
    );
    return ok(rows.map(rowToAttempt));
  }

  async save(entity: Attempt): Promise<Result<Attempt>> {
    await this.db.run(
      `INSERT INTO attempt (id, session_id, card_id, stage, result, answered_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET stage = excluded.stage, result = excluded.result`,
      [entity.id, entity.sessionId, entity.cardId, entity.stage, entity.result, entity.answeredAt],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM attempt WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}

export class SqliteSrsStateRepository implements SrsStateRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  /** `id` is the card id (srs_state is keyed by card). */
  async getById(id: string): Promise<Result<SrsState>> {
    const row = await this.db.get<SrsStateRow>('SELECT * FROM srs_state WHERE card_id = ?', [id]);
    return row ? ok(rowToSrsState(row)) : err(notFoundError('SrsState'));
  }

  async list(): Promise<Result<SrsState[]>> {
    const rows = await this.db.all<SrsStateRow>('SELECT * FROM srs_state');
    return ok(rows.map(rowToSrsState));
  }

  async dueCards(cardIds: readonly string[], now: number): Promise<Result<SrsState[]>> {
    if (cardIds.length === 0) {
      return ok([]);
    }
    const placeholders = cardIds.map(() => '?').join(', ');
    const rows = await this.db.all<SrsStateRow>(
      `SELECT * FROM srs_state WHERE card_id IN (${placeholders}) AND due_at <= ? ORDER BY due_at`,
      [...cardIds, now],
    );
    return ok(rows.map(rowToSrsState));
  }

  async dueCountByDeck(now: number): Promise<Result<ReadonlyMap<string, number>>> {
    const rows = await this.db.all<{ deck_id: string; due: number }>(
      `SELECT c.deck_id AS deck_id, COUNT(*) AS due
         FROM srs_state s JOIN card c ON c.id = s.card_id
        WHERE s.due_at <= ?
        GROUP BY c.deck_id`,
      [now],
    );
    return ok(new Map(rows.map((r) => [r.deck_id, r.due])));
  }

  async save(entity: SrsState): Promise<Result<SrsState>> {
    await this.db.run(
      `INSERT INTO srs_state (card_id, due_at, interval, ease, reps, lapses, stage)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(card_id) DO UPDATE SET
         due_at = excluded.due_at,
         interval = excluded.interval,
         ease = excluded.ease,
         reps = excluded.reps,
         lapses = excluded.lapses,
         stage = excluded.stage`,
      [entity.cardId, entity.dueAt, entity.interval, entity.ease, entity.reps, entity.lapses, entity.stage],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM srs_state WHERE card_id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}
