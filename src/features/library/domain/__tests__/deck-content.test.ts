/**
 * Deck-content-choice domain (WBS 3.6) — `reorganiseDeck` + `setDeckContentUseCase`.
 * Proves name+organise persists atomically, a blank name short-circuits, and a
 * missing deck surfaces not-found.
 */

import { reorganiseDeck, setDeckContentUseCase, makeDeck, type Deck, type DeckRepository } from '@/features/library/domain';
import { ok, err, notFoundError, isErr, isOk, type Result, type AppError } from '@/shared';
import { fixedClock } from '@/shared/testing/fixtures';

function seedDeck(): Deck {
  const d = makeDeck({ id: 'd1', title: 'Untitled', languagePairId: 'lp1', organisation: 'cards', createdAt: 100 });
  if (isErr(d)) throw new Error('fixture');
  return d.value;
}

class FakeDeckRepo implements DeckRepository {
  saved: Deck[] = [];
  constructor(private readonly decks: Deck[] = []) {}
  subscribe() {
    return () => {};
  }
  async getById(id: string): Promise<Result<Deck, AppError>> {
    const d = this.decks.find((x) => x.id === id) ?? this.saved.find((x) => x.id === id);
    return d ? ok(d) : err(notFoundError('Deck'));
  }
  async list(): Promise<Result<Deck[], AppError>> {
    return ok(this.decks);
  }
  async save(e: Deck): Promise<Result<Deck, AppError>> {
    this.saved.push(e);
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

describe('reorganiseDeck', () => {
  it('sets organisation and bumps updatedAt, leaving other fields', () => {
    const deck = seedDeck();
    const next = reorganiseDeck(deck, 'subdecks', 500);
    expect(next.organisation).toBe('subdecks');
    expect(next.updatedAt).toBe(500);
    expect(next.id).toBe(deck.id);
    expect(next.title).toBe(deck.title);
    expect(deck.organisation).toBe('cards'); // immutable
  });
});

describe('setDeckContentUseCase', () => {
  it('renames + organises + persists in one step', async () => {
    const repo = new FakeDeckRepo([seedDeck()]);
    const r = await setDeckContentUseCase({ decks: repo, clock: fixedClock(900) }).execute({
      deckId: 'd1',
      title: '  TOPIK I  ',
      organisation: 'subdecks',
    });
    expect(isOk(r)).toBe(true);
    expect(repo.saved).toHaveLength(1);
    expect(repo.saved[0]).toMatchObject({ id: 'd1', title: 'TOPIK I', organisation: 'subdecks', updatedAt: 900 });
  });

  it('rejects a blank name without persisting', async () => {
    const repo = new FakeDeckRepo([seedDeck()]);
    const r = await setDeckContentUseCase({ decks: repo, clock: fixedClock() }).execute({
      deckId: 'd1',
      title: '   ',
      organisation: 'cards',
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('validation');
    expect(repo.saved).toHaveLength(0);
  });

  it('surfaces not-found for a missing deck', async () => {
    const repo = new FakeDeckRepo([]);
    const r = await setDeckContentUseCase({ decks: repo, clock: fixedClock() }).execute({
      deckId: 'ghost',
      title: 'X',
      organisation: 'cards',
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });
});
