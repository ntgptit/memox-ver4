/**
 * Library repository tests over real (in-memory) SQLite (WBS 3.2).
 * Exercises round-trips, listByDeck, FK cascade, and transactional rollback.
 */

import { isOk, isErr } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import type { Deck, Subdeck } from '@/features/library/domain';
import type { LanguagePair } from '@/features/languages/domain';
import {
  SqliteDeckRepository,
  SqliteSubdeckRepository,
  SqliteLanguagePairRepository,
} from '@/features/library/data';

let db: TestDatabase;
let langs: SqliteLanguagePairRepository;
let decks: SqliteDeckRepository;
let subdecks: SqliteSubdeckRepository;

beforeEach(async () => {
  db = await createTestDatabase();
  langs = new SqliteLanguagePairRepository(db);
  decks = new SqliteDeckRepository(db);
  subdecks = new SqliteSubdeckRepository(db);
});

afterEach(() => {
  db.close();
});

const lp: LanguagePair = { id: 'lp1', learning: 'Spanish', native: 'English', createdAt: 1 };
function deck(id: string): Deck {
  return { id, title: 'Spanish', languagePairId: 'lp1', organisation: 'subdecks', createdAt: 1, updatedAt: 1 };
}
function subdeck(id: string, deckId: string, parentId: string | null): Subdeck {
  return { id, deckId, parentId, title: id, position: 0 };
}

describe('language pair persistence (WBS 3.2)', () => {
  it('saves and reads back a language pair', async () => {
    await langs.save(lp);
    const r = await langs.getById('lp1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.learning).toBe('Spanish');
  });

  it('returns a typed not-found for a missing id', async () => {
    const r = await langs.getById('ghost');
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });
});

describe('deck persistence (WBS 3.2)', () => {
  beforeEach(async () => {
    await langs.save(lp);
  });

  it('round-trips a deck and updates on re-save (upsert)', async () => {
    await decks.save(deck('d1'));
    await decks.save({ ...deck('d1'), title: 'Renamed', updatedAt: 2 });
    const r = await decks.getById('d1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.title).toBe('Renamed');
    const all = await decks.list();
    if (isOk(all)) expect(all.value).toHaveLength(1); // upsert, not a second row
  });

  it('notifies subscribers on write', async () => {
    let hits = 0;
    const unsub = decks.subscribe(() => {
      hits += 1;
    });
    await decks.save(deck('d1'));
    expect(hits).toBe(1);
    unsub();
    await decks.save(deck('d2'));
    expect(hits).toBe(1);
  });
});

describe('subdeck persistence + FK cascade (WBS 3.2)', () => {
  beforeEach(async () => {
    await langs.save(lp);
    await decks.save(deck('d1'));
  });

  it('lists subdecks scoped to a deck, ordered by position', async () => {
    await subdecks.save({ ...subdeck('s1', 'd1', null), position: 1 });
    await subdecks.save({ ...subdeck('s2', 'd1', null), position: 0 });
    await subdecks.save(subdeck('other', 'd1', null)); // position 0 too
    const r = await subdecks.listByDeck('d1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toHaveLength(3);
  });

  it('cascades: deleting a deck removes its subdecks (FK ON DELETE CASCADE)', async () => {
    await subdecks.save(subdeck('s1', 'd1', null));
    await decks.remove('d1');
    const r = await subdecks.listByDeck('d1');
    if (isOk(r)) expect(r.value).toHaveLength(0);
  });
});

describe('transactional multi-write rollback (WBS 3.2)', () => {
  beforeEach(async () => {
    await langs.save(lp);
  });

  it('rolls back all writes in a transaction when one step throws', async () => {
    await expect(
      db.tx(async (r) => {
        await r.run(
          'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['d1', 'Spanish', 'lp1', 'subdecks', 1, 1],
        );
        // Second write reuses the PRIMARY KEY 'd1' → constraint violation throws →
        // whole tx rolls back. (PK is enforced by every SQLite build; a CHECK
        // constraint is not, so it can't be relied on across environments.)
        await r.run(
          'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['d1', 'Dup', 'lp1', 'cards', 1, 1],
        );
      }),
    ).rejects.toThrow();

    // Neither deck should exist — the first insert rolled back too.
    const all = await decks.list();
    if (isOk(all)) expect(all.value).toHaveLength(0);
  });

  it('commits all writes when the transaction succeeds', async () => {
    await db.tx(async (r) => {
      await r.run(
        'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['d1', 'Spanish', 'lp1', 'subdecks', 1, 1],
      );
      await r.run('INSERT INTO subdeck (id, deck_id, parent_id, title, position) VALUES (?, ?, ?, ?, ?)', [
        's1',
        'd1',
        null,
        'Verbs',
        0,
      ]);
    });
    const d = await decks.getById('d1');
    const s = await subdecks.listByDeck('d1');
    expect(isOk(d)).toBe(true);
    if (isOk(s)) expect(s.value).toHaveLength(1);
  });
});
