/**
 * Library controller (WBS 3.4 / 11.5) — the load path issues a FIXED number of
 * reads regardless of library size (query budget: 4 — decks, subdecks, card
 * counts, due counts; previously 1 + 4 per deck), and maps counts/due/subdecks
 * onto the deck views.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import type { Deck, Subdeck } from '@/features/library/domain';

import { useLibrary, type LibraryDeps } from '../use-library';

function deck(id: string, title: string): Deck {
  return { id, title, languagePairId: 'lp1', organisation: 'cards', createdAt: 1, updatedAt: 1 };
}

function subdeck(id: string, deckId: string, title: string): Subdeck {
  return { id, deckId, parentId: null, title, position: 0 };
}

function makeDeps(deckCount: number) {
  const calls = { listDecks: 0, listAllSubdecks: 0, countCardsByDecks: 0, countDueByDecks: 0 };
  const decks = Array.from({ length: deckCount }, (_, i) => deck(`d${i}`, `Deck ${i}`));
  const deps: LibraryDeps = {
    listDecks: async () => {
      calls.listDecks += 1;
      return decks;
    },
    listAllSubdecks: async () => {
      calls.listAllSubdecks += 1;
      return [subdeck('s1', 'd0', 'Unit 1'), subdeck('s2', 'd0', 'Unit 2')];
    },
    countCardsByDecks: async (ids) => {
      calls.countCardsByDecks += 1;
      return new Map(ids.map((id, i) => [id, i + 10]));
    },
    countDueByDecks: async () => {
      calls.countDueByDecks += 1;
      return new Map([['d0', 7]]);
    },
  };
  return { deps, calls };
}

describe('useLibrary — query budget (11.5)', () => {
  it('a 50-deck library loads with exactly 4 reads (no per-deck queries)', async () => {
    const { deps, calls } = makeDeps(50);
    const { result } = renderHook(() => useLibrary(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    expect(calls).toEqual({ listDecks: 1, listAllSubdecks: 1, countCardsByDecks: 1, countDueByDecks: 1 });
    if (result.current.data.status === 'ready') {
      expect(result.current.data.decks).toHaveLength(50);
    }
  });

  it('maps counts, due and subdecks onto the deck views', async () => {
    const { deps } = makeDeps(2);
    const { result } = renderHook(() => useLibrary(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    if (result.current.data.status !== 'ready') return;
    const [d0, d1] = result.current.data.decks;
    expect(d0).toMatchObject({ id: 'd0', cards: 10, due: 7, subdecks: 2 });
    expect(d0.upToDate).toBeUndefined();
    expect(d1).toMatchObject({ id: 'd1', cards: 11, subdecks: 0, upToDate: true });
    expect(d1.due).toBeUndefined();
  });

  it('search covers decks and subdecks from the single load', async () => {
    const { deps } = makeDeps(3);
    const { result } = renderHook(() => useLibrary(deps));
    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    const hits = result.current.searchLibrary('Unit');
    expect(hits.subdecks.map((s) => s.name)).toEqual(['Unit 1', 'Unit 2']);
    expect(result.current.searchLibrary('Deck 1').decks).toHaveLength(1);
  });
});
