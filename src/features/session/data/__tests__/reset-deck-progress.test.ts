/**
 * Deck-progress reset (WBS 4.5) over real (in-memory) SQLite — atomic clear of a
 * deck's SRS state + attempts, and a rollback test proving neither table is left
 * half-cleared when the transaction fails.
 */

import { isOk, isErr } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import type { SqlDatabase } from '@/db/sql';
import { resetDeckProgress } from '@/features/session/data';

let db: TestDatabase;

async function seed() {
  await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?,?,?,?)', ['lp1', 'Spanish', 'English', 1]);
  await db.run('INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)', [
    'd1',
    'Spanish',
    'lp1',
    'cards',
    1,
    1,
  ]);
  await db.run('INSERT INTO session (id, deck_id, mode, card_ids, status, started_at, finalized_at) VALUES (?,?,?,?,?,?,?)', [
    's1',
    'd1',
    'full',
    '["c1","c2"]',
    'active',
    5,
    null,
  ]);
  for (const id of ['c1', 'c2']) {
    await db.run(
      'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, 'd1', null, id, 'm', '[]', null, 1, 1],
    );
    await db.run('INSERT INTO srs_state (card_id, due_at, interval, ease, reps, lapses, stage) VALUES (?,?,?,?,?,?,?)', [
      id,
      100,
      1,
      2.5,
      3,
      0,
      'review',
    ]);
    await db.run('INSERT INTO attempt (id, session_id, card_id, stage, result, answered_at) VALUES (?,?,?,?,?,?)', [
      `att-${id}`,
      's1',
      id,
      'review',
      'good',
      10,
    ]);
  }
}

async function count(table: string): Promise<number> {
  const rows = await db.all<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return rows[0]?.n ?? 0;
}

beforeEach(async () => {
  db = await createTestDatabase();
  await seed();
});

afterEach(() => {
  db.close();
});

describe('resetDeckProgress (WBS 4.5)', () => {
  it('clears SRS state + attempts for the given cards', async () => {
    expect(await count('srs_state')).toBe(2);
    expect(await count('attempt')).toBe(2);

    const r = await resetDeckProgress(db, ['c1', 'c2']);
    expect(isOk(r)).toBe(true);
    expect(await count('srs_state')).toBe(0);
    expect(await count('attempt')).toBe(0);
  });

  it('no-ops for an empty card set', async () => {
    const r = await resetDeckProgress(db, []);
    expect(isOk(r)).toBe(true);
    expect(await count('srs_state')).toBe(2);
  });

  it('rolls back both deletes when the transaction fails', async () => {
    // Wrap the DB so the srs_state DELETE throws — the attempt DELETE must roll back.
    const failing: SqlDatabase = {
      ...db,
      tx: (work) =>
        db.tx((r) =>
          work({
            ...r,
            run: (sql, params) =>
              sql.includes('FROM srs_state') ? Promise.reject(new Error('delete failed')) : r.run(sql, params),
          }),
        ),
    };
    const r = await resetDeckProgress(failing, ['c1', 'c2']);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('storage');
    expect(await count('attempt')).toBe(2); // attempt DELETE rolled back
    expect(await count('srs_state')).toBe(2);
  });
});
