/**
 * Unit tests for session use cases (WBS 5.1) over in-memory fake repositories.
 * Covers start, record-answer (attempt + SRS update from a new card), resume, and due.
 */

import { ok, err, isOk, isErr, notFoundError } from '@/shared';
import type {
  Session,
  Attempt,
  SrsState,
  SessionRepository,
  AttemptRepository,
  SrsStateRepository,
} from '@/features/session/domain';
import {
  startSession,
  recordAnswer,
  resumeSession,
  finalizeSessionUseCase,
  getDueCards,
  isDue,
  DAY_MS,
} from '@/features/session/domain';

class FakeSessionRepo implements SessionRepository {
  items = new Map<string, Session>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const s = this.items.get(id);
    return s ? ok(s) : err(notFoundError('Session'));
  }
  async list() {
    return ok([...this.items.values()]);
  }
  async activeForDeck(deckId: string) {
    const s = [...this.items.values()].find((x) => x.deckId === deckId && x.status === 'active');
    return ok(s ?? null);
  }
  async save(s: Session) {
    this.items.set(s.id, s);
    return ok(s);
  }
  async remove(id: string) {
    this.items.delete(id);
    return ok(undefined);
  }
}

class FakeAttemptRepo implements AttemptRepository {
  items = new Map<string, Attempt>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const a = this.items.get(id);
    return a ? ok(a) : err(notFoundError('Attempt'));
  }
  async list() {
    return ok([...this.items.values()]);
  }
  async listBySession(sessionId: string) {
    return ok([...this.items.values()].filter((a) => a.sessionId === sessionId));
  }
  async save(a: Attempt) {
    this.items.set(a.id, a);
    return ok(a);
  }
  async remove(id: string) {
    this.items.delete(id);
    return ok(undefined);
  }
}

class FakeSrsRepo implements SrsStateRepository {
  items = new Map<string, SrsState>();
  subscribe() {
    return () => {};
  }
  async getById(cardId: string) {
    const s = this.items.get(cardId);
    return s ? ok(s) : err(notFoundError('SrsState'));
  }
  async list() {
    return ok([...this.items.values()]);
  }
  async dueCards(cardIds: readonly string[], now: number) {
    return ok(
      cardIds
        .map((id) => this.items.get(id))
        .filter((s): s is SrsState => s !== undefined && isDue(s, now)),
    );
  }
  async dueCountByDeck() {
    return ok(new Map<string, number>());
  }
  async save(s: SrsState) {
    this.items.set(s.cardId, s);
    return ok(s);
  }
  async remove(id: string) {
    this.items.delete(id);
    return ok(undefined);
  }
}

const clock = () => 1_000_000;
function idSeq(prefix: string) {
  let n = 0;
  return () => `${prefix}${(n += 1)}`;
}

describe('startSession (WBS 5.1)', () => {
  it('persists an active session', async () => {
    const sessions = new FakeSessionRepo();
    const r = await startSession({ sessions, ids: idSeq('s'), clock }).execute({
      deckId: 'd1',
      mode: 'full',
      cardIds: ['a', 'b'],
    });
    expect(isOk(r)).toBe(true);
    expect(sessions.items.size).toBe(1);
  });

  it('refuses an empty card set', async () => {
    const sessions = new FakeSessionRepo();
    const r = await startSession({ sessions, ids: idSeq('s'), clock }).execute({
      deckId: 'd1',
      mode: 'full',
      cardIds: [],
    });
    expect(isErr(r)).toBe(true);
    expect(sessions.items.size).toBe(0);
  });
});

describe('recordAnswer (WBS 5.1)', () => {
  it('records an attempt and schedules a brand-new card from its initial state', async () => {
    const attempts = new FakeAttemptRepo();
    const srs = new FakeSrsRepo();
    const r = await recordAnswer({ attempts, srs, ids: idSeq('a'), clock }).execute({
      sessionId: 's1',
      cardId: 'c1',
      stage: 'review',
      grade: 'good',
    });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.attempt.result).toBe('good');
      expect(r.value.srs.stage).toBe('review');
      expect(r.value.srs.dueAt).toBe(1_000_000 + DAY_MS); // good on new → 1 day
    }
    expect(attempts.items.size).toBe(1);
    expect(srs.items.get('c1')?.reps).toBe(1);
  });
});

describe('resumeSession (WBS 5.1)', () => {
  it('rebuilds progress from persisted attempts', async () => {
    const sessions = new FakeSessionRepo();
    const attempts = new FakeAttemptRepo();
    await sessions.save({
      id: 's1',
      deckId: 'd1',
      mode: 'full',
      cardIds: ['a', 'b'],
      status: 'active',
      startedAt: 0,
      finalizedAt: null,
    });
    // record 3 attempts
    for (let i = 0; i < 3; i += 1) {
      await attempts.save({
        id: `at${i}`,
        sessionId: 's1',
        cardId: 'a',
        stage: 'review',
        result: 'good',
        answeredAt: i,
      });
    }
    const r = await resumeSession({ sessions, attempts }).execute('s1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.progress.completed).toBe(3);
      expect(r.value.progress.position?.stage).toBe('match'); // index 3 → stage floor(3/2)=1 (match)
    }
  });

  it('fails for an unknown session', async () => {
    const r = await resumeSession({ sessions: new FakeSessionRepo(), attempts: new FakeAttemptRepo() }).execute('ghost');
    expect(isErr(r)).toBe(true);
  });
});

describe('finalizeSession + getDueCards (WBS 5.1)', () => {
  it('finalizes an existing session', async () => {
    const sessions = new FakeSessionRepo();
    await sessions.save({
      id: 's1',
      deckId: 'd1',
      mode: 'review',
      cardIds: ['a'],
      status: 'active',
      startedAt: 0,
      finalizedAt: null,
    });
    const r = await finalizeSessionUseCase({ sessions, clock }).execute('s1');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.status).toBe('finalized');
  });

  it('returns only the due cards', async () => {
    const srs = new FakeSrsRepo();
    await srs.save({ cardId: 'a', dueAt: 0, interval: 1, ease: 2.5, reps: 1, lapses: 0, stage: 'review' });
    await srs.save({ cardId: 'b', dueAt: 9_000_000, interval: 5, ease: 2.5, reps: 2, lapses: 0, stage: 'review' });
    const r = await getDueCards({ srs, clock }).execute(['a', 'b']);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.map((s) => s.cardId)).toEqual(['a']); // b is due in the future
    }
  });
});
