/**
 * Session-domain persistence tests over real (in-memory) SQLite (WBS 5.2).
 * Covers session round-trip + resume, attempts per stage, SRS due queries, and the
 * transactional answer writer (atomic + rollback).
 */

import { isOk, isErr } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import { sessionProgress, type Session, type Attempt, type SrsState } from '@/features/session/domain';
import {
  SqliteSessionRepository,
  SqliteAttemptRepository,
  SqliteSrsStateRepository,
  persistAnswer,
} from '@/features/session/data';

let db: TestDatabase;
let sessions: SqliteSessionRepository;
let attempts: SqliteAttemptRepository;
let srs: SqliteSrsStateRepository;

async function seed() {
  await db.run('INSERT INTO language_pair (id, learning, native, created_at) VALUES (?,?,?,?)', [
    'lp1',
    'Spanish',
    'English',
    1,
  ]);
  await db.run(
    'INSERT INTO deck (id, title, language_pair_id, organisation, created_at, updated_at) VALUES (?,?,?,?,?,?)',
    ['d1', 'Spanish', 'lp1', 'cards', 1, 1],
  );
  for (const id of ['c1', 'c2']) {
    await db.run(
      'INSERT INTO card (id, deck_id, subdeck_id, term, meaning, tags, audio_ref, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, 'd1', null, id, 'm', '[]', null, 1, 1],
    );
  }
}

const session: Session = {
  id: 's1',
  deckId: 'd1',
  mode: 'full',
  cardIds: ['c1', 'c2'],
  status: 'active',
  startedAt: 5,
  finalizedAt: null,
};

function attempt(id: string, cardId: string): Attempt {
  return { id, sessionId: 's1', cardId, stage: 'review', result: 'good', answeredAt: 10 };
}

function srsState(cardId: string, reps: number): SrsState {
  return { cardId, dueAt: 100, interval: 1, ease: 2.5, reps, lapses: 0, stage: 'review' };
}

beforeEach(async () => {
  db = await createTestDatabase();
  sessions = new SqliteSessionRepository(db);
  attempts = new SqliteAttemptRepository(db);
  srs = new SqliteSrsStateRepository(db);
  await seed();
});

afterEach(() => {
  db.close();
});

describe('session persistence + resume (WBS 5.2)', () => {
  it('round-trips a session preserving the ordered card set (JSON)', async () => {
    await sessions.save(session);
    const r = await sessions.getById('s1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.cardIds).toEqual(['c1', 'c2']);
      expect(r.value.mode).toBe('full');
      expect(r.value.status).toBe('active');
    }
  });

  it('activeForDeck finds the un-finalized session', async () => {
    await sessions.save(session);
    const r = await sessions.activeForDeck('d1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value?.id).toBe('s1');
  });

  it('finalized sessions are not returned by activeForDeck', async () => {
    await sessions.save({ ...session, status: 'finalized', finalizedAt: 20 });
    const r = await sessions.activeForDeck('d1');
    if (isOk(r)) expect(r.value).toBeNull();
  });

  it('resumes losslessly: rebuilds progress from persisted session + attempts', async () => {
    await sessions.save(session);
    await attempts.save(attempt('a1', 'c1'));
    await attempts.save(attempt('a2', 'c2'));
    await attempts.save(attempt('a3', 'c1'));

    // Simulate a fresh start: reload from the DB and rebuild.
    const reloaded = await sessions.getById('s1');
    const persisted = await attempts.listBySession('s1');
    expect(isOk(reloaded)).toBe(true);
    if (isOk(reloaded) && isOk(persisted)) {
      expect(persisted.value).toHaveLength(3);
      const progress = sessionProgress(reloaded.value, persisted.value.length);
      expect(progress.completed).toBe(3);
      expect(progress.position?.stage).toBe('match'); // index 3 → stage floor(3/2)=1
      expect(progress.position?.cardId).toBe('c2');
    }
  });
});

describe('SRS state persistence (WBS 5.2)', () => {
  it('upserts SRS state keyed by card and reads it back', async () => {
    await srs.save(srsState('c1', 1));
    await srs.save(srsState('c1', 2)); // upsert
    const r = await srs.getById('c1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.reps).toBe(2);
  });

  it('dueCards returns only cards due at or before now', async () => {
    await srs.save({ ...srsState('c1', 1), dueAt: 50 });
    await srs.save({ ...srsState('c2', 1), dueAt: 500 });
    const r = await srs.dueCards(['c1', 'c2'], 100);
    if (isOk(r)) expect(r.value.map((s) => s.cardId)).toEqual(['c1']);
  });

  it('dueCards on an empty set returns empty', async () => {
    const r = await srs.dueCards([], 100);
    if (isOk(r)) expect(r.value).toEqual([]);
  });
});

describe('persistAnswer — transactional attempt + SRS (WBS 5.2)', () => {
  beforeEach(async () => {
    await sessions.save(session); // attempts FK-reference the session
  });

  it('commits the attempt and SRS advance together', async () => {
    const r = await persistAnswer(db, attempt('a1', 'c1'), srsState('c1', 1));
    expect(isOk(r)).toBe(true);
    const savedSrs = await srs.getById('c1');
    const savedAttempts = await attempts.listBySession('s1');
    if (isOk(savedSrs)) expect(savedSrs.value.reps).toBe(1);
    if (isOk(savedAttempts)) expect(savedAttempts.value).toHaveLength(1);
  });

  it('rolls back the SRS advance when the attempt write fails (duplicate id)', async () => {
    await persistAnswer(db, attempt('a1', 'c1'), srsState('c1', 1)); // reps 1 committed
    // Same attempt id → PK conflict inside the tx → both writes roll back.
    const r = await persistAnswer(db, attempt('a1', 'c1'), srsState('c1', 99));
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('storage');
    const savedSrs = await srs.getById('c1');
    if (isOk(savedSrs)) expect(savedSrs.value.reps).toBe(1); // NOT advanced to 99
  });
});
