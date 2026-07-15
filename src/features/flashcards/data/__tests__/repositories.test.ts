/**
 * Flashcard repository tests over real (in-memory) SQLite (WBS 4.2).
 * Exercises tags JSON, listByDeck, deck.card_count trigger maintenance,
 * transactional rollback (count stays consistent), FK cascade, and translations.
 */

import { isOk, isErr } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import type { Card, CardTranslation } from '@/features/flashcards/domain';
import { SqliteCardRepository, SqliteCardTranslationRepository } from '@/features/flashcards/data';

let db: TestDatabase;
let cards: SqliteCardRepository;
let translations: SqliteCardTranslationRepository;

async function seedDeck() {
  await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?, ?, ?, ?)', [
    'lp1',
    'Spanish',
    'English',
    1,
  ]);
  await db.run(
    'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['d1', 'Spanish', 'lp1', 'cards', 1, 1],
  );
}

function card(id: string, term: string, tags: string[] = []): Card {
  return {
    id,
    deckId: 'd1',
    subdeckId: null,
    term,
    meaning: 'm',
    tags,
    audioRef: null,
    createdAt: 1,
    updatedAt: 1,
  };
}

beforeEach(async () => {
  db = await createTestDatabase();
  cards = new SqliteCardRepository(db);
  translations = new SqliteCardTranslationRepository(db);
  await seedDeck();
});

afterEach(() => {
  db.close();
});

describe('card persistence (WBS 4.2)', () => {
  it('round-trips a card including tags (JSON)', async () => {
    await cards.save(card('c1', 'hola', ['greeting', 'a1']));
    const r = await cards.getById('c1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.term).toBe('hola');
      expect(r.value.tags).toEqual(['greeting', 'a1']);
    }
  });

  it('lists cards scoped to a deck', async () => {
    await cards.save(card('c1', 'a'));
    await cards.save(card('c2', 'b'));
    const r = await cards.listByDeck('d1');
    if (isOk(r)) expect(r.value).toHaveLength(2);
  });

  it('upsert edits in place (no duplicate row)', async () => {
    await cards.save(card('c1', 'hola'));
    await cards.save({ ...card('c1', 'hola'), meaning: 'hello!', updatedAt: 2 });
    const all = await cards.list();
    if (isOk(all)) expect(all.value).toHaveLength(1);
    const r = await cards.getById('c1');
    if (isOk(r)) expect(r.value.meaning).toBe('hello!');
  });
});

describe('deck card-count maintenance (WBS 4.2)', () => {
  it('increments on insert and decrements on delete (trigger-maintained)', async () => {
    expect(await countOf('d1')).toBe(0);
    await cards.save(card('c1', 'a'));
    await cards.save(card('c2', 'b'));
    expect(await countOf('d1')).toBe(2);
    await cards.remove('c1');
    expect(await countOf('d1')).toBe(1);
  });

  it('does not double-count when editing an existing card', async () => {
    await cards.save(card('c1', 'a'));
    await cards.save({ ...card('c1', 'a'), meaning: 'edited', updatedAt: 2 });
    expect(await countOf('d1')).toBe(1);
  });
});

describe('transactional edits keep the count consistent (WBS 4.2)', () => {
  it('rolls back the insert AND the count when the transaction throws', async () => {
    await expect(
      db.tx(async (r) => {
        await r.run(
          'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          ['c1', 'd1', null, 'hola', 'hi', '[]', null, 1, 1],
        );
        throw new Error('boom');
      }),
    ).rejects.toThrow();
    expect(await countOf('d1')).toBe(0); // trigger increment rolled back with the row
    const r = await cards.listByDeck('d1');
    if (isOk(r)) expect(r.value).toHaveLength(0);
  });
});

describe('FK cascade + translations (WBS 4.2)', () => {
  it('deleting a card cascades its translations', async () => {
    await cards.save(card('c1', 'hola'));
    await translations.save(translation('t1', 'c1', 'hi'));
    await cards.remove('c1');
    const r = await translations.listByCard('c1');
    if (isOk(r)) expect(r.value).toHaveLength(0);
  });

  it('deleting a deck cascades its cards (and their count is moot)', async () => {
    await cards.save(card('c1', 'hola'));
    await db.run('DELETE FROM deck WHERE id = ?', ['d1']);
    const r = await cards.listByDeck('d1');
    if (isOk(r)) expect(r.value).toHaveLength(0);
  });

  it('countByDeck returns not-found for a missing deck', async () => {
    const r = await cards.countByDeck('ghost');
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });
});

describe('batched counts (WBS 11.5 — no per-deck query)', () => {
  it('countByDecks returns every requested deck in ONE read, skipping ghosts', async () => {
    await db.run(
      'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)',
      ['d2', 'Verbs', 'lp1', 'cards', 1, 1],
    );
    await cards.save(card('c1', 'hola'));
    await cards.save(card('c2', 'adiós'));
    const r = await cards.countByDecks(['d1', 'd2', 'ghost']);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.get('d1')).toBe(2);
      expect(r.value.get('d2')).toBe(0);
      expect(r.value.has('ghost')).toBe(false);
    }
  });

  it('countByDecks on an empty id set returns an empty map', async () => {
    const r = await cards.countByDecks([]);
    expect(isOk(r) && r.value.size).toBe(0);
  });
});

function translation(id: string, cardId: string, text: string): CardTranslation {
  return { id, cardId, text, position: 0 };
}

async function countOf(deckId: string): Promise<number> {
  const r = await cards.countByDeck(deckId);
  return isOk(r) ? r.value : -1;
}
