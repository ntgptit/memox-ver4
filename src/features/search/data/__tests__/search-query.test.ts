/**
 * Library search query (WBS 4.6) over real (in-memory) SQLite. Matches term + meaning,
 * derives per-hit status from SRS state, and treats LIKE wildcards literally.
 */

import { isOk, isErr } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import { searchLibrary } from '@/features/search/data';

let db: TestDatabase;
const NOW = 1000;

async function seed() {
  await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?,?,?,?)', ['lp1', 'Korean', 'English', 1]);
  await db.run('INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)', [
    'd1',
    'TOPIK I',
    'lp1',
    'cards',
    1,
    1,
  ]);
  const cards: [string, string, string][] = [
    ['c1', '공부하다', 'to study'],
    ['c2', '좋아하다', 'to like'],
    ['c3', '하다', 'to do'],
    ['c4', '100%_off', 'a literal percent'],
  ];
  for (const [id, term, meaning] of cards) {
    await db.run(
      'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, 'd1', null, term, meaning, '[]', null, 1, 1],
    );
  }
  // c1 due (due_at <= now), c2 mastered (due_at > now), c3 has no SRS row → new.
  await db.run('INSERT INTO srs_state (card_id, due_at, interval, ease, reps, lapses, stage) VALUES (?,?,?,?,?,?,?)', [
    'c1',
    500,
    1,
    2.5,
    2,
    0,
    'review',
  ]);
  await db.run('INSERT INTO srs_state (card_id, due_at, interval, ease, reps, lapses, stage) VALUES (?,?,?,?,?,?,?)', [
    'c2',
    5000,
    10,
    2.6,
    6,
    0,
    'review',
  ]);
}

beforeEach(async () => {
  db = await createTestDatabase();
  await seed();
});
afterEach(() => db.close());

describe('searchLibrary (WBS 4.6)', () => {
  it('returns [] for a blank query', async () => {
    const r = await searchLibrary(db, '   ', NOW);
    expect(isOk(r) && r.value).toEqual([]);
  });

  it('matches on term and carries deck + status', async () => {
    const r = await searchLibrary(db, '하다', NOW);
    if (isErr(r)) throw new Error('search failed');
    const terms = r.value.map((h) => h.term);
    expect(terms).toEqual(expect.arrayContaining(['공부하다', '좋아하다', '하다']));
    const c1 = r.value.find((h) => h.cardId === 'c1');
    expect(c1).toMatchObject({ deckTitle: 'TOPIK I', status: 'due' });
    expect(r.value.find((h) => h.cardId === 'c2')?.status).toBe('mastered');
    expect(r.value.find((h) => h.cardId === 'c3')?.status).toBe('new');
  });

  it('matches on meaning too', async () => {
    const r = await searchLibrary(db, 'study', NOW);
    if (isErr(r)) throw new Error('search failed');
    expect(r.value.map((h) => h.cardId)).toEqual(['c1']);
  });

  it('treats % and _ as literals (LIKE escaping)', async () => {
    const r = await searchLibrary(db, '%_off', NOW);
    if (isErr(r)) throw new Error('search failed');
    expect(r.value.map((h) => h.cardId)).toEqual(['c4']);
  });
});
