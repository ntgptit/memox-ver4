/**
 * Deck-settings controller (WBS 4.5) — wiring over in-memory fakes. Loads deck + pairs,
 * renames/moves (persist + local state update), resets (lists cards → transactional
 * clear), and deletes.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { makeDeck, type Deck, type DeckRepository } from '@/features/library/domain';
import type { LanguagePair, LanguagePairRepository } from '@/features/languages/domain';
import type { Card, CardRepository } from '@/features/flashcards/domain';
import type { SqlDatabase } from '@/db/sql';
import { ok, err, notFoundError, isErr, isOk, type Result, type AppError } from '@/shared';

import { useDeckSettings, type DeckSettingsDeps } from '../use-deck-settings';

function seedDeck(): Deck {
  const d = makeDeck({ id: 'd1', title: 'Deck', languagePairId: 'lp1', organisation: 'cards', createdAt: 1 });
  if (isErr(d)) throw new Error('fixture');
  return d.value;
}

class FakeDeckRepo implements DeckRepository {
  saved: Deck[] = [];
  removed: string[] = [];
  constructor(private readonly decks: Deck[]) {}
  subscribe() {
    return () => {};
  }
  async getById(id: string): Promise<Result<Deck, AppError>> {
    const d = this.saved.find((x) => x.id === id) ?? this.decks.find((x) => x.id === id);
    return d ? ok(d) : err(notFoundError('Deck'));
  }
  async list(): Promise<Result<Deck[], AppError>> {
    return ok(this.decks);
  }
  async save(e: Deck): Promise<Result<Deck, AppError>> {
    this.saved.push(e);
    return ok(e);
  }
  async remove(id: string): Promise<Result<void, AppError>> {
    this.removed.push(id);
    return ok(undefined);
  }
}

class FakePairRepo implements LanguagePairRepository {
  constructor(private readonly pairs: LanguagePair[]) {}
  subscribe() {
    return () => {};
  }
  async getById(): Promise<Result<LanguagePair, AppError>> {
    return err(notFoundError('LanguagePair'));
  }
  async list(): Promise<Result<LanguagePair[], AppError>> {
    return ok(this.pairs);
  }
  async save(e: LanguagePair): Promise<Result<LanguagePair, AppError>> {
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
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
  async getById(): Promise<Result<Card, AppError>> {
    return ok(this.cards[0]);
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

const fakeDb = {
  run: async () => {},
  get: async () => undefined,
  all: async () => [],
  tx: async (work: (r: { run: () => Promise<void> }) => Promise<void>) => work({ run: async () => {} }),
} as unknown as SqlDatabase;

function pair(id: string, learning: string): LanguagePair {
  return { id, learning, native: 'English', createdAt: 1 };
}

function deps(): DeckSettingsDeps {
  return {
    decks: new FakeDeckRepo([seedDeck()]),
    languagePairs: new FakePairRepo([pair('lp1', 'Korean'), pair('lp2', 'Japanese')]),
    cards: new FakeCardRepo([{ id: 'c1' } as unknown as Card, { id: 'c2' } as unknown as Card]),
    db: fakeDb,
    clock: () => 500,
  };
}

describe('useDeckSettings', () => {
  it('loads the deck title, current pair, and pair options', async () => {
    const { result } = renderHook(() => useDeckSettings('d1', deps()));
    await waitFor(() => expect(result.current.deckTitle).toBe('Deck'));
    expect(result.current.currentPairId).toBe('lp1');
    expect(result.current.languagePairs).toEqual([
      { id: 'lp1', label: 'Korean → English' },
      { id: 'lp2', label: 'Japanese → English' },
    ]);
  });

  it('rename persists and updates the title', async () => {
    const d = deps();
    const { result } = renderHook(() => useDeckSettings('d1', d));
    await waitFor(() => expect(result.current.deckTitle).toBe('Deck'));
    const r = await result.current.rename('Renamed');
    expect(isOk(r)).toBe(true);
    await waitFor(() => expect(result.current.deckTitle).toBe('Renamed'));
  });

  it('move persists and updates the current pair', async () => {
    const d = deps();
    const { result } = renderHook(() => useDeckSettings('d1', d));
    await waitFor(() => expect(result.current.currentPairId).toBe('lp1'));
    const r = await result.current.move('lp2');
    expect(isOk(r)).toBe(true);
    await waitFor(() => expect(result.current.currentPairId).toBe('lp2'));
  });

  it('reset lists the deck cards then clears (ok)', async () => {
    const { result } = renderHook(() => useDeckSettings('d1', deps()));
    await waitFor(() => expect(result.current.deckTitle).toBe('Deck'));
    const r = await result.current.reset();
    expect(isOk(r)).toBe(true);
  });

  it('remove deletes the deck', async () => {
    const d = deps();
    const { result } = renderHook(() => useDeckSettings('d1', d));
    await waitFor(() => expect(result.current.deckTitle).toBe('Deck'));
    const r = await result.current.remove();
    expect(isOk(r)).toBe(true);
    expect((d.decks as FakeDeckRepo).removed).toContain('d1');
  });

  it('null deps → writes fail cleanly', async () => {
    const { result } = renderHook(() => useDeckSettings('d1', null));
    expect(isErr(await result.current.rename('x'))).toBe(true);
    expect(isErr(await result.current.remove())).toBe(true);
  });
});
