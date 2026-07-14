/**
 * Library controller (WBS 3.4) — loads the deck list with its counts (cards from 4.2,
 * subdecks from 3.2, due from 5.2's SRS states) into {@link LibraryData}, and exposes
 * a synchronous in-memory search over the loaded library for the screen's search mode.
 */

import { useCallback, useEffect, useState } from 'react';

import { isErr, type Result } from '@/shared';
import type { Deck, Subdeck } from '../domain';

import type { LibraryData, LibraryDeckView, LibrarySubdeckView } from './library-fixtures';
import type { LibrarySearchResults } from './library-screen';

export interface LibraryDeps {
  listDecks: () => Promise<Deck[]>;
  listSubdecksByDeck: (deckId: string) => Promise<Subdeck[]>;
  countCardsByDeck: (deckId: string) => Promise<number>;
  /** Due-card count for a deck at `now` (SRS states, 5.2). */
  countDueByDeck: (deckId: string) => Promise<number>;
}

export interface LibraryController {
  data: LibraryData;
  reload: () => void;
  searchLibrary: (query: string) => LibrarySearchResults;
}

export function useLibrary(deps: LibraryDeps): LibraryController {
  const [data, setData] = useState<LibraryData>({ status: 'loading' });
  const [subdecks, setSubdecks] = useState<readonly LibrarySubdeckView[]>([]);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const decks = await deps.listDecks();
        const views: LibraryDeckView[] = [];
        const subViews: LibrarySubdeckView[] = [];
        for (const deck of decks) {
          const [subs, cards, due] = await Promise.all([
            deps.listSubdecksByDeck(deck.id),
            deps.countCardsByDeck(deck.id),
            deps.countDueByDeck(deck.id),
          ]);
          views.push({
            id: deck.id,
            icon: 'style',
            name: deck.title,
            cards,
            due: due > 0 ? due : undefined,
            upToDate: due === 0 ? true : undefined,
            subdecks: subs.length,
          });
          for (const s of subs) {
            subViews.push({ id: s.id, icon: 'style', name: s.title, cards: 0, parent: deck.title });
          }
        }
        if (!cancelled) {
          setSubdecks(subViews);
          setData({ status: 'ready', decks: views });
        }
      } catch {
        // Local reads failing entirely is unexpected; surface the offline banner
        // with whatever we have rather than a dead screen.
        if (!cancelled) setData({ status: 'ready', decks: [], offline: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  const searchLibrary = useCallback(
    (query: string): LibrarySearchResults => {
      const needle = query.trim().toLowerCase();
      if (data.status !== 'ready' || needle === '') return { decks: [], subdecks: [] };
      return {
        decks: data.decks.filter((d) => d.name.toLowerCase().includes(needle)),
        subdecks: subdecks.filter((s) => s.name.toLowerCase().includes(needle)),
      };
    },
    [data, subdecks],
  );

  return { data, reload: () => setGeneration((g) => g + 1), searchLibrary };
}

/** Small helper for wiring the SRS due count from repository primitives. */
export function makeCountDueByDeck(deps: {
  listCardIdsByDeck: (deckId: string) => Promise<string[]>;
  dueCards: (cardIds: readonly string[], now: number) => Promise<Result<unknown[]>>;
  now: () => number;
}): (deckId: string) => Promise<number> {
  return async (deckId) => {
    const ids = await deps.listCardIdsByDeck(deckId);
    if (ids.length === 0) return 0;
    const due = await deps.dueCards(ids, deps.now());
    return isErr(due) ? 0 : due.value.length;
  };
}
