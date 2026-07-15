/**
 * Flashcard repositories over SQLite (WBS 4.2).
 *
 * Implement the WBS 4.1 ports against the {@link SqlDatabase} port. `deck.card_count`
 * is maintained by DB triggers (migration v2), so `countByDeck` just reads it and it
 * stays consistent inside any transaction. Reads return typed {@link Result}s; writes
 * upsert and emit a change signal (ADR 0003).
 */

import { ok, err, notFoundError, type Result } from '@/shared';
import type {
  Card,
  CardTranslation,
  CardRepository,
  CardTranslationRepository,
} from '@/features/flashcards/domain';
import { createChangeSignal } from '@/db/change-signal';
import type { SqlDatabase } from '@/db/sql';
import {
  rowToCard,
  rowToCardTranslation,
  serializeTags,
  type CardRow,
  type CardTranslationRow,
} from './mappers';

export class SqliteCardRepository implements CardRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<Card>> {
    const row = await this.db.get<CardRow>('SELECT * FROM card WHERE id = ?', [id]);
    return row ? ok(rowToCard(row)) : err(notFoundError('Card'));
  }

  async list(): Promise<Result<Card[]>> {
    const rows = await this.db.all<CardRow>('SELECT * FROM card ORDER BY created_at');
    return ok(rows.map(rowToCard));
  }

  async listByDeck(deckId: string): Promise<Result<Card[]>> {
    const rows = await this.db.all<CardRow>('SELECT * FROM card WHERE deck_id = ? ORDER BY created_at', [
      deckId,
    ]);
    return ok(rows.map(rowToCard));
  }

  async countByDeck(deckId: string): Promise<Result<number>> {
    const row = await this.db.get<{ card_count: number }>('SELECT card_count FROM deck WHERE id = ?', [
      deckId,
    ]);
    return row ? ok(row.card_count) : err(notFoundError('Deck'));
  }

  async countByDecks(deckIds: readonly string[]): Promise<Result<ReadonlyMap<string, number>>> {
    if (deckIds.length === 0) {
      return ok(new Map());
    }
    const placeholders = deckIds.map(() => '?').join(', ');
    const rows = await this.db.all<{ id: string; card_count: number }>(
      `SELECT id, card_count FROM deck WHERE id IN (${placeholders})`,
      [...deckIds],
    );
    return ok(new Map(rows.map((r) => [r.id, r.card_count])));
  }

  async save(entity: Card): Promise<Result<Card>> {
    await this.db.run(
      `INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         subdeck_id = excluded.subdeck_id,
         term = excluded.term,
         meaning = excluded.meaning,
         tags = excluded.tags,
         audio_ref = excluded.audio_ref,
         updated_at = excluded.updated_at`,
      [
        entity.id,
        entity.deckId,
        entity.subdeckId,
        entity.term,
        entity.meaning,
        serializeTags(entity.tags),
        entity.audioRef,
        entity.createdAt,
        entity.updatedAt,
      ],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM card WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}

export class SqliteCardTranslationRepository implements CardTranslationRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async getById(id: string): Promise<Result<CardTranslation>> {
    const row = await this.db.get<CardTranslationRow>('SELECT * FROM card_translation WHERE id = ?', [id]);
    return row ? ok(rowToCardTranslation(row)) : err(notFoundError('CardTranslation'));
  }

  async list(): Promise<Result<CardTranslation[]>> {
    const rows = await this.db.all<CardTranslationRow>('SELECT * FROM card_translation ORDER BY position');
    return ok(rows.map(rowToCardTranslation));
  }

  async listByCard(cardId: string): Promise<Result<CardTranslation[]>> {
    const rows = await this.db.all<CardTranslationRow>(
      'SELECT * FROM card_translation WHERE card_id = ? ORDER BY position',
      [cardId],
    );
    return ok(rows.map(rowToCardTranslation));
  }

  async save(entity: CardTranslation): Promise<Result<CardTranslation>> {
    await this.db.run(
      `INSERT INTO card_translation (id, card_id, text, position) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET text = excluded.text, position = excluded.position`,
      [entity.id, entity.cardId, entity.text, entity.position],
    );
    this.signal.emit();
    return ok(entity);
  }

  async remove(id: string): Promise<Result<void>> {
    await this.db.run('DELETE FROM card_translation WHERE id = ?', [id]);
    this.signal.emit();
    return ok(undefined);
  }
}
