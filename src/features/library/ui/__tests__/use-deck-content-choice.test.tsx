/**
 * Deck-content-choice controller (WBS 3.6) — wiring over an in-memory deck repo.
 * Loads the deck name, persists name+organisation via the use case, and no-ops
 * cleanly before the repositories resolve.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { makeDeck, type Deck, type DeckRepository } from '@/features/library/domain';
import { ok, err, notFoundError, isErr, isOk, type Result, type AppError } from '@/shared';
import { fixedClock } from '@/shared/testing/fixtures';

import { useDeckContentChoice, type DeckContentChoiceDeps } from '../use-deck-content-choice';

function seedDeck(): Deck {
  const d = makeDeck({ id: 'd1', title: 'My deck', languagePairId: 'lp1', organisation: 'cards', createdAt: 1 });
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

function deps(decks: Deck[] = []): DeckContentChoiceDeps {
  return { decks: new FakeDeckRepo(decks), clock: fixedClock(500) };
}

describe('useDeckContentChoice', () => {
  it('null deps → no name, choose fails cleanly', async () => {
    const { result } = renderHook(() => useDeckContentChoice('d1', null));
    expect(result.current.deckName).toBeUndefined();
    const r = await result.current.choose({ title: 'X', organisation: 'cards' });
    expect(isErr(r)).toBe(true);
  });

  it('loads the deck name', async () => {
    const d = deps([seedDeck()]);
    const { result } = renderHook(() => useDeckContentChoice('d1', d));
    await waitFor(() => expect(result.current.deckName).toBe('My deck'));
  });

  it('choose persists name + organisation via the use case', async () => {
    const repo = new FakeDeckRepo([seedDeck()]);
    const { result } = renderHook(() => useDeckContentChoice('d1', { decks: repo, clock: fixedClock(500) }));
    await waitFor(() => expect(result.current.deckName).toBe('My deck'));

    const r = await result.current.choose({ title: 'Renamed', organisation: 'subdecks' });
    expect(isOk(r)).toBe(true);
    expect(repo.saved[0]).toMatchObject({ title: 'Renamed', organisation: 'subdecks', updatedAt: 500 });
  });
});
