/**
 * Subdeck-list controller (WBS 3.5) — loads a deck's subdecks with their card/due
 * counts (4.2 cards grouped by subdeckId; 5.2 SRS due states) into
 * {@link SubdeckListData}.
 */

import { useEffect, useState } from 'react';

import type { SubdeckListData, SubdeckView } from './subdeck-list-fixtures';

export interface SubdeckListDeps {
  getDeckTitle: (deckId: string) => Promise<string>;
  listSubdecks: (deckId: string) => Promise<{ id: string; title: string }[]>;
  /** Card ids per subdeck id for the deck (cards grouped by their subdeckId). */
  cardIdsBySubdeck: (deckId: string) => Promise<ReadonlyMap<string, readonly string[]>>;
  countDue: (cardIds: readonly string[]) => Promise<number>;
}

export interface SubdeckListController {
  data: SubdeckListData;
  deckTitle: string;
  reload: () => void;
}

export function useSubdeckList(deckId: string, deps: SubdeckListDeps): SubdeckListController {
  const [data, setData] = useState<SubdeckListData>({ status: 'loading' });
  const [deckTitle, setDeckTitle] = useState('');
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [title, subs, byId] = await Promise.all([
          deps.getDeckTitle(deckId),
          deps.listSubdecks(deckId),
          deps.cardIdsBySubdeck(deckId),
        ]);
        const views: SubdeckView[] = [];
        for (const s of subs) {
          const ids = byId.get(s.id) ?? [];
          const due = ids.length > 0 ? await deps.countDue(ids) : 0;
          views.push({
            id: s.id,
            icon: 'style',
            name: s.title,
            cards: ids.length,
            due: due > 0 ? due : undefined,
            upToDate: due === 0 ? true : undefined,
          });
        }
        if (!cancelled) {
          setDeckTitle(title);
          setData({ status: 'ready', subdecks: views });
        }
      } catch {
        if (!cancelled) {
          setData({ status: 'error', message: 'Something went wrong. Check your connection and try again.' });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, generation]);

  return { data, deckTitle, reload: () => setGeneration((g) => g + 1) };
}
