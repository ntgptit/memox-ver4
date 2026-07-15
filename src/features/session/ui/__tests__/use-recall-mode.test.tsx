/**
 * Recall-mode controller (WBS 7.1) — session-play over in-memory fakes. Starts a
 * session, steps cards, persists each grade (attempt + SRS), re-queues "forgot", and
 * completes + finalizes when every card is remembered.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import type { Card, CardRepository } from '@/features/flashcards/domain';
import type {
  Session,
  Attempt,
  SrsState,
  SessionRepository,
  AttemptRepository,
  SrsStateRepository,
} from '@/features/session/domain';
import { ok, err, notFoundError, type Result, type AppError } from '@/shared';
import { sequentialIds, fixedClock } from '@/shared/testing/fixtures';

import { useRecallMode, type RecallModeDeps } from '../use-recall-mode';

function card(id: string, term: string, meaning: string): Card {
  return { id, deckId: 'd1', subdeckId: null, term, meaning, tags: [], audioRef: null, createdAt: 0, updatedAt: 0 };
}

class FakeCardRepo implements CardRepository {
  constructor(private readonly cards: Card[]) {}
  subscribe() {
    return () => {};
  }
  async listByDeck(): Promise<Result<Card[], AppError>> {
    return ok(this.cards);
  }
  async countByDeck(): Promise<Result<number, AppError>> {
    return ok(this.cards.length);
  }
  async countByDecks(deckIds: readonly string[]): Promise<Result<ReadonlyMap<string, number>, AppError>> {
    return ok(new Map(deckIds.map((id) => [id, this.cards.length])));
  }
  async getById(id: string): Promise<Result<Card, AppError>> {
    const c = this.cards.find((x) => x.id === id);
    return c ? ok(c) : err(notFoundError('Card'));
  }
  async list(): Promise<Result<Card[], AppError>> {
    return ok(this.cards);
  }
  async save(e: Card): Promise<Result<Card, AppError>> {
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

class FakeSessionRepo implements SessionRepository {
  saved: Session[] = [];
  subscribe() {
    return () => {};
  }
  async activeForDeck(): Promise<Result<Session | null, AppError>> {
    return ok(null);
  }
  async getById(id: string): Promise<Result<Session, AppError>> {
    const s = [...this.saved].reverse().find((x) => x.id === id);
    return s ? ok(s) : err(notFoundError('Session'));
  }
  async list(): Promise<Result<Session[], AppError>> {
    return ok(this.saved);
  }
  async save(e: Session): Promise<Result<Session, AppError>> {
    this.saved.push(e);
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

class FakeAttemptRepo implements AttemptRepository {
  saved: Attempt[] = [];
  subscribe() {
    return () => {};
  }
  async listBySession(): Promise<Result<Attempt[], AppError>> {
    return ok(this.saved);
  }
  async getById(): Promise<Result<Attempt, AppError>> {
    return err(notFoundError('Attempt'));
  }
  async list(): Promise<Result<Attempt[], AppError>> {
    return ok(this.saved);
  }
  async save(e: Attempt): Promise<Result<Attempt, AppError>> {
    this.saved.push(e);
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

class FakeSrsRepo implements SrsStateRepository {
  saved = new Map<string, SrsState>();
  subscribe() {
    return () => {};
  }
  async dueCards(): Promise<Result<SrsState[], AppError>> {
    return ok([...this.saved.values()]);
  }
  async dueCountByDeck(): Promise<Result<ReadonlyMap<string, number>, AppError>> {
    return ok(new Map());
  }
  async getById(id: string): Promise<Result<SrsState, AppError>> {
    const s = this.saved.get(id);
    return s ? ok(s) : err(notFoundError('SrsState'));
  }
  async list(): Promise<Result<SrsState[], AppError>> {
    return ok([...this.saved.values()]);
  }
  async save(e: SrsState): Promise<Result<SrsState, AppError>> {
    this.saved.set(e.cardId, e);
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

function deps(cards: Card[]): RecallModeDeps & { _s: FakeSessionRepo; _a: FakeAttemptRepo; _srs: FakeSrsRepo } {
  const _s = new FakeSessionRepo();
  const _a = new FakeAttemptRepo();
  const _srs = new FakeSrsRepo();
  return { cards: new FakeCardRepo(cards), sessions: _s, attempts: _a, srs: _srs, ids: sequentialIds('x'), clock: fixedClock(1000), _s, _a, _srs };
}

const TWO = [card('c1', '친구', 'friend'), card('c2', '학교', 'school')];

describe('useRecallMode', () => {
  it('loads the first card and starts a session', async () => {
    const d = deps(TWO);
    const { result } = renderHook(() => useRecallMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('친구'));
    expect(result.current.phase).toBe('before-reveal');
    expect(result.current.total).toBe(2);
    await waitFor(() => expect(d._s.saved).toHaveLength(1)); // session started
  });

  it('reveal → remembered advances and persists an attempt + SRS', async () => {
    const d = deps(TWO);
    const { result } = renderHook(() => useRecallMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('친구'));
    await waitFor(() => expect(d._s.saved).toHaveLength(1));

    act(() => result.current.reveal());
    expect(result.current.phase).toBe('revealed');
    await act(async () => result.current.remembered());

    expect(d._a.saved).toHaveLength(1);
    expect(d._a.saved[0]).toMatchObject({ cardId: 'c1', stage: 'recall', result: 'good' });
    expect(d._srs.saved.has('c1')).toBe(true);
    expect(result.current.term).toBe('학교'); // advanced
    expect(result.current.done).toBe(1);
  });

  it('remembering every card completes + finalizes the session', async () => {
    const d = deps(TWO);
    const { result } = renderHook(() => useRecallMode('d1', d));
    await waitFor(() => expect(d._s.saved).toHaveLength(1));

    act(() => result.current.reveal());
    await act(async () => result.current.remembered());
    act(() => result.current.reveal());
    await act(async () => result.current.remembered());

    expect(result.current.phase).toBe('complete');
    expect(result.current.done).toBe(2);
    await waitFor(() => expect(d._s.saved.some((s) => s.finalizedAt !== null)).toBe(true));
  });

  it('forgot re-queues the card (grade again) and does not count as done', async () => {
    const d = deps([card('c1', '친구', 'friend')]);
    const { result } = renderHook(() => useRecallMode('d1', d));
    await waitFor(() => expect(d._s.saved).toHaveLength(1));

    act(() => result.current.reveal());
    await act(async () => result.current.forgot());
    expect(d._a.saved[0]).toMatchObject({ cardId: 'c1', result: 'again' });
    expect(result.current.done).toBe(0);
    expect(result.current.phase).toBe('before-reveal');
    expect(result.current.term).toBe('친구'); // re-queued, same card returns
  });

  it('an empty deck completes immediately', async () => {
    const d = deps([]);
    const { result } = renderHook(() => useRecallMode('d1', d));
    await waitFor(() => expect(result.current.phase).toBe('complete'));
    expect(result.current.total).toBe(0);
  });
});
