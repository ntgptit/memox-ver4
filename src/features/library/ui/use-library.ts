/**
 * Library controller (WBS 3.4) — loads the deck list with its counts (cards from 4.2,
 * subdecks from 3.2, due from 5.2's SRS states) into {@link LibraryData}, and exposes
 * a synchronous in-memory search over the loaded library for the screen's search mode.
 */

import { useCallback, useEffect, useState } from 'react';

import type { Deck, Subdeck } from '../domain';

import type { LibraryData, LibraryDeckView, LibrarySubdeckView } from './library-fixtures';
import type { LibrarySearchResults } from './library-screen';

export interface LibraryDeps {
  listDecks: () => Promise<Deck[]>;
  /** ALL subdecks in one read (11.5: no per-deck subdeck query). */
  listAllSubdecks: () => Promise<Subdeck[]>;
  /** Card counts for all decks in one read (11.5: no per-deck count query). */
  countCardsByDecks: (deckIds: readonly string[]) => Promise<ReadonlyMap<string, number>>;
  /** Due-card counts per deck at now, in one read (SRS states, 5.2 / 11.5). */
  countDueByDecks: () => Promise<ReadonlyMap<string, number>>;
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
        // 11.5: a FIXED number of reads regardless of library size (was 1 + 4
        // per deck) — one deck list, one subdeck list, one count map, one due map.
        const decks = await deps.listDecks();
        const [allSubdecks, cardCounts, dueCounts] = await Promise.all([
          deps.listAllSubdecks(),
          deps.countCardsByDecks(decks.map((d) => d.id)),
          deps.countDueByDecks(),
        ]);
        const subsByDeck = new Map<string, Subdeck[]>();
        for (const s of allSubdecks) {
          const list = subsByDeck.get(s.deckId);
          if (list === undefined) subsByDeck.set(s.deckId, [s]);
          else list.push(s);
        }
        const views: LibraryDeckView[] = [];
        const subViews: LibrarySubdeckView[] = [];
        for (const deck of decks) {
          const subs = subsByDeck.get(deck.id) ?? [];
          const cards = cardCounts.get(deck.id) ?? 0;
          const due = dueCounts.get(deck.id) ?? 0;
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

