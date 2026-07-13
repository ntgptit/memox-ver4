/**
 * Repository + migration integration tests (WBS 11.2) over real (in-memory) SQLite.
 *
 * Proves the WHOLE persistence contract end-to-end, not just the runner logic:
 *   - the real migration chain applies v0→v1→v2→v3 incrementally (vN→vN+1),
 *     advancing `user_version` and creating the expected tables/columns;
 *   - re-running the registry is a no-op (forward-only, idempotent);
 *   - a multi-table transactional write rolls back atomically on failure;
 *   - the DB is the source of truth (writes are read back).
 */

import Database from 'better-sqlite3';

import { migrations, runMigrations, type MigrationDb } from '@/db/migrations';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';

function adapter(raw: Database.Database): MigrationDb {
  return {
    async getUserVersion() {
      return raw.pragma('user_version', { simple: true }) as number;
    },
    async setUserVersion(v) {
      raw.pragma(`user_version = ${v}`);
    },
    async execAsync(sql) {
      raw.exec(sql);
    },
    async withTransactionAsync(work) {
      raw.exec('BEGIN');
      try {
        await work();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

function tableNames(raw: Database.Database): string[] {
  return (raw.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map(
    (r) => r.name,
  );
}

function columnNames(raw: Database.Database, table: string): string[] {
  return (raw.pragma(`table_info(${table})`) as { name: string }[]).map((c) => c.name);
}

describe('migration chain v0→v3 (WBS 11.2)', () => {
  it('applies each version incrementally (vN→vN+1), advancing user_version + schema', async () => {
    const raw = new Database(':memory:');
    raw.pragma('foreign_keys = ON');
    const db = adapter(raw);

    // v0 → v1
    expect(await runMigrations(db, migrations.slice(0, 1))).toEqual({ ok: true, value: 1 });
    expect(raw.pragma('user_version', { simple: true })).toBe(1);
    expect(tableNames(raw)).toEqual(expect.arrayContaining(['language_pair', 'deck', 'subdeck']));

    // v1 → v2 (applied on a v1 DB)
    await runMigrations(db, migrations.slice(0, 2));
    expect(raw.pragma('user_version', { simple: true })).toBe(2);
    expect(tableNames(raw)).toEqual(expect.arrayContaining(['card', 'card_translation']));
    expect(columnNames(raw, 'deck')).toContain('card_count'); // added by v2

    // v2 → v3 (applied on a v2 DB)
    await runMigrations(db, migrations.slice(0, 3));
    expect(raw.pragma('user_version', { simple: true })).toBe(3);
    expect(tableNames(raw)).toEqual(expect.arrayContaining(['srs_state', 'session', 'attempt']));

    raw.close();
  });

  it('re-running the full registry is a no-op (forward-only, idempotent)', async () => {
    const raw = new Database(':memory:');
    raw.pragma('foreign_keys = ON');
    const db = adapter(raw);
    await runMigrations(db, migrations);
    const first = raw.pragma('user_version', { simple: true });
    const rerun = await runMigrations(db, migrations);
    expect(rerun).toEqual({ ok: true, value: migrations.length });
    expect(raw.pragma('user_version', { simple: true })).toBe(first); // unchanged
    raw.close();
  });

  it('the full registry reaches the latest version', async () => {
    const db = await createTestDatabase();
    const row = await db.get<{ user_version: number }>('PRAGMA user_version');
    expect(row?.user_version).toBe(migrations.length);
    db.close();
  });
});

describe('multi-table transactional write + rollback (WBS 11.2)', () => {
  let db: TestDatabase;
  beforeEach(async () => {
    db = await createTestDatabase();
  });
  afterEach(() => db.close());

  async function insertLangPair() {
    await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?,?,?,?)', [
      'lp1',
      'Spanish',
      'English',
      1,
    ]);
  }

  it('commits a deck + subdeck + card in one transaction', async () => {
    await insertLangPair();
    await db.tx(async (r) => {
      await r.run(
        'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)',
        ['d1', 'Spanish', 'lp1', 'cards', 1, 1],
      );
      await r.run(
        'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
        ['c1', 'd1', null, 'hola', 'hi', '[]', null, 1, 1],
      );
    });
    const deck = await db.get<{ card_count: number }>('SELECT card_count FROM deck WHERE id = ?', ['d1']);
    expect(deck?.card_count).toBe(1); // card trigger ran inside the committed tx
  });

  it('rolls back every table when any statement in the transaction fails', async () => {
    await insertLangPair();
    await expect(
      db.tx(async (r) => {
        await r.run(
          'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)',
          ['d1', 'Spanish', 'lp1', 'cards', 1, 1],
        );
        await r.run(
          'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
          ['c1', 'd1', null, 'x', 'y', '[]', null, 1, 1],
        );
        // Force the failure with an explicit throw rather than a DB constraint —
        // the CI SQLite build does not enforce CHECK/FK/PK consistently.
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');

    const decks = await db.all('SELECT id FROM deck');
    const cards = await db.all('SELECT id FROM card');
    expect(decks).toHaveLength(0); // the deck insert rolled back too
    expect(cards).toHaveLength(0);
  });
});

describe('DB is the source of truth (WBS 11.2)', () => {
  it('reads back exactly what was written', async () => {
    const db = await createTestDatabase();
    await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?,?,?,?)', [
      'lp1',
      'Spanish',
      'English',
      42,
    ]);
    const row = await db.get<{ learning: string; created_at: number }>(
      'SELECT learning, created_at FROM language_pair WHERE id = ?',
      ['lp1'],
    );
    expect(row).toEqual({ learning: 'Spanish', created_at: 42 });
    db.close();
  });
});
