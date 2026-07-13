/**
 * In-memory fake repositories for session-play controller tests (WBS 6.x/7.x).
 * Track saves so a test can assert what was persisted, without a real DB.
 */

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

export function makeCard(id: string, term: string, meaning: string): Card {
  return { id, deckId: 'd1', subdeckId: null, term, meaning, tags: [], audioRef: null, createdAt: 0, updatedAt: 0 };
}

export class FakeCardRepo implements CardRepository {
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

export class FakeSessionRepo implements SessionRepository {
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

export class FakeAttemptRepo implements AttemptRepository {
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

export class FakeSrsRepo implements SrsStateRepository {
  saved = new Map<string, SrsState>();
  subscribe() {
    return () => {};
  }
  async dueCards(): Promise<Result<SrsState[], AppError>> {
    return ok([...this.saved.values()]);
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
