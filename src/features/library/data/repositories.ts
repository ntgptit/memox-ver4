/**
 * Library repositories over SQLite (WBS 3.2).
 *
 * Implement the WBS 3.1 ports (`DeckRepository`/`SubdeckRepository`/
 * `LanguagePairRepository`) against the {@link SqlDatabase} port. Reads return typed
 * {@link Result}s (not-found is typed); writes upsert and emit a change signal
 * (ADR 0003). SQL lives only here — nothing above the data layer sees it.
 */

import { ok, err, notFoundError, type Result } from '@/shared';
import type { Deck, Subdeck, DeckRepository, SubdeckRepository } from '@/features/library/domain';
import type { LanguagePair, LanguagePairRepository } from '@/features/languages/domain';
import { createChangeSignal } from '@/db/change-signal';
import type { SqlDatabase } from '@/db/sql';
import {
  rowToDeck,
  rowToSubdeck,
  rowToLanguagePair,
  type DeckRow,
  type SubdeckRow,
  type LanguagePairRow,
} from './mappers';

export class SqliteLanguagePairRepository implements LanguagePairRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<LanguagePair>> {
    const row = await this.db.get<LanguagePairRow>('SELECT * FROM language_pair WHERE id = ?', [id]);
    return row ? ok(rowToLanguagePair(row)) : err(notFoundError('LanguagePair'));
  }

  async list(): Promise<Result<LanguagePair[]>> {
    const rows = await this.db.all<LanguagePairRow>('SELECT * FROM language_pair ORDER BY created_at');
    return ok(rows.map(rowToLanguagePair));
  }

  async save(entity: LanguagePair): Promise<Result<LanguagePair>> {
    await this.db.run(
      `INSERT INTO language_pair (id, learning, native, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET learning = excluded.learning, native = excluded.native`,
      [entity.id, entity.learning, entity.native, entity.createdAt],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM language_pair WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}

export class SqliteDeckRepository implements DeckRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<Deck>> {
    const row = await this.db.get<DeckRow>('SELECT * FROM deck WHERE id = ?', [id]);
    return row ? ok(rowToDeck(row)) : err(notFoundError('Deck'));
  }

  async list(): Promise<Result<Deck[]>> {
    const rows = await this.db.all<DeckRow>('SELECT * FROM deck ORDER BY created_at');
    return ok(rows.map(rowToDeck));
  }

  async save(entity: Deck): Promise<Result<Deck>> {
    await this.db.run(
      `INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         organisation = excluded.organisation,
         updated_at = excluded.updated_at`,
      [entity.id, entity.title, entity.languagePairId, entity.organisation, entity.createdAt, entity.updatedAt],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM deck WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}

export class SqliteSubdeckRepository implements SubdeckRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<Subdeck>> {
    const row = await this.db.get<SubdeckRow>('SELECT * FROM subdeck WHERE id = ?', [id]);
    return row ? ok(rowToSubdeck(row)) : err(notFoundError('Subdeck'));
  }

  async list(): Promise<Result<Subdeck[]>> {
    const rows = await this.db.all<SubdeckRow>('SELECT * FROM subdeck ORDER BY position');
    return ok(rows.map(rowToSubdeck));
  }

  async listByDeck(deckId: string): Promise<Result<Subdeck[]>> {
    const rows = await this.db.all<SubdeckRow>(
      'SELECT * FROM subdeck WHERE deck_id = ? ORDER BY position',
      [deckId],
    );
    return ok(rows.map(rowToSubdeck));
  }

  async save(entity: Subdeck): Promise<Result<Subdeck>> {
    await this.db.run(
      `INSERT INTO subdeck (id, deck_id, parent_id, title, position) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         parent_id = excluded.parent_id,
         title = excluded.title,
         position = excluded.position`,
      [entity.id, entity.deckId, entity.parentId, entity.title, entity.position],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM subdeck WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}
