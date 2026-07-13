/**
 * Languages controller (WBS 3.3) — wiring tests over in-memory fake repositories.
 *
 * Proves the hook loads pairs, counts their decks, reacts to repository changes,
 * and routes add/remove through the domain use cases (including validation).
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import type { LanguagePair, LanguagePairRepository } from '@/features/languages/domain';
import type { Deck, DeckRepository } from '@/features/library/domain';
import { ok, err, notFoundError, isErr, isOk, type Result, type AppError } from '@/shared';
import { sequentialIds, fixedClock } from '@/shared/testing/fixtures';

import { useLanguages, type LanguagesDeps } from '../use-languages';

class FakeLanguageRepo implements LanguagePairRepository {
  private items = new Map<string, LanguagePair>();
  private subs = new Set<() => void>();
  private emit() {
    this.subs.forEach((f) => f());
  }
  subscribe(fn: () => void) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }
  async getById(id: string): Promise<Result<LanguagePair, AppError>> {
    const v = this.items.get(id);
    return v ? ok(v) : err(notFoundError('LanguagePair'));
  }
  async list(): Promise<Result<LanguagePair[], AppError>> {
    return ok([...this.items.values()]);
  }
  async save(e: LanguagePair): Promise<Result<LanguagePair, AppError>> {
    this.items.set(e.id, e);
    this.emit();
    return ok(e);
  }
  async remove(id: string): Promise<Result<void, AppError>> {
    this.items.delete(id);
    this.emit();
    return ok(undefined);
  }
}

class FakeDeckRepo implements DeckRepository {
  constructor(private readonly decks: Deck[] = []) {}
  subscribe() {
    return () => {};
  }
  async getById(id: string): Promise<Result<Deck, AppError>> {
    const v = this.decks.find((d) => d.id === id);
    return v ? ok(v) : err(notFoundError('Deck'));
  }
  async list(): Promise<Result<Deck[], AppError>> {
    return ok(this.decks);
  }
  async save(e: Deck): Promise<Result<Deck, AppError>> {
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

function deck(id: string, languagePairId: string): Deck {
  return { id, title: id, languagePairId, organisation: 'cards', createdAt: 0, updatedAt: 0 };
}

function makeDeps(decks: Deck[] = []): LanguagesDeps {
  return {
    languagePairs: new FakeLanguageRepo(),
    decks: new FakeDeckRepo(decks),
    ids: sequentialIds('lp'),
    clock: fixedClock(1000),
  };
}

describe('useLanguages', () => {
  it('null deps → loading, and writes are no-ops that fail cleanly', async () => {
    const { result } = renderHook(() => useLanguages(null));
    expect(result.current.data.status).toBe('loading');
    const r = await result.current.add({ learning: 'Korean', native: 'English' });
    expect(isErr(r)).toBe(true);
  });

  it('loads pairs and counts their decks', async () => {
    const deps = makeDeps([deck('d1', 'lp-1'), deck('d2', 'lp-1'), deck('d3', 'lp-2')]);
    await deps.languagePairs.save({ id: 'lp-1', learning: 'Korean', native: 'English', createdAt: 1 });
    await deps.languagePairs.save({ id: 'lp-2', learning: 'Japanese', native: 'English', createdAt: 2 });

    const { result } = renderHook(() => useLanguages(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));

    const data = result.current.data;
    if (data.status !== 'ready') throw new Error('expected ready');
    expect(data.pairs).toHaveLength(2);
    expect(data.pairs.find((p) => p.id === 'lp-1')?.deckCount).toBe(2);
    expect(data.pairs.find((p) => p.id === 'lp-2')?.deckCount).toBe(1);
  });

  it('add persists a pair and the subscription refreshes the list', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useLanguages(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));

    let r!: Result<LanguagePair, AppError>;
    await act(async () => {
      r = await result.current.add({ learning: 'Korean', native: 'English' });
    });
    expect(isOk(r)).toBe(true);

    await waitFor(() => {
      const d = result.current.data;
      expect(d.status === 'ready' && d.pairs.length === 1).toBe(true);
    });
  });

  it('add rejects an invalid (identical) pair without persisting', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useLanguages(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));

    const r = await result.current.add({ learning: 'Korean', native: 'Korean' });
    expect(isErr(r)).toBe(true);
    const list = await deps.languagePairs.list();
    expect(isOk(list) && list.value).toHaveLength(0);
  });

  it('remove deletes the pair and refreshes', async () => {
    const deps = makeDeps();
    await deps.languagePairs.save({ id: 'lp-1', learning: 'Korean', native: 'English', createdAt: 1 });
    const { result } = renderHook(() => useLanguages(deps));
    await waitFor(() => {
      const d = result.current.data;
      expect(d.status === 'ready' && d.pairs.length === 1).toBe(true);
    });

    await act(async () => {
      await result.current.remove('lp-1');
    });
    await waitFor(() => {
      const d = result.current.data;
      expect(d.status === 'ready' && d.pairs.length === 0).toBe(true);
    });
  });
});
