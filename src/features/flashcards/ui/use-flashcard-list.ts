/**
 * Flashcard-list controller (WBS 4.3) — loads a deck's (or subdeck's) cards with
 * their SRS status (no state → new; due at `now` → due; otherwise mastered) into
 * {@link FlashcardListData}.
 */

import { useEffect, useState } from 'react';

import type { FlashcardListData, FlashcardView } from './flashcard-list-fixtures';

export interface FlashcardListDeps {
  getDeckTitle: (deckId: string) => Promise<string>;
  listCards: (deckId: string, subdeckId?: string) => Promise<{ id: string; term: string; meaning: string }[]>;
  /** Card ids that are due at now. */
  dueCardIds: (cardIds: readonly string[]) => Promise<ReadonlySet<string>>;
  /** Card ids that have any SRS state (studied at least once). */
  studiedCardIds: (cardIds: readonly string[]) => Promise<ReadonlySet<string>>;
}

export interface FlashcardListController {
  data: FlashcardListData;
  deckTitle: string;
  reload: () => void;
}

export function useFlashcardList(deckId: string, subdeckId: string | undefined, deps: FlashcardListDeps): FlashcardListController {
  const [data, setData] = useState<FlashcardListData>({ status: 'loading' });
  const [deckTitle, setDeckTitle] = useState('');
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [title, cards] = await Promise.all([deps.getDeckTitle(deckId), deps.listCards(deckId, subdeckId)]);
        const ids = cards.map((c) => c.id);
        const [due, studied] = await Promise.all([deps.dueCardIds(ids), deps.studiedCardIds(ids)]);
        const views: FlashcardView[] = cards.map((c) => ({
          id: c.id,
          term: c.term,
          meaning: c.meaning,
          status: due.has(c.id) ? 'due' : studied.has(c.id) ? 'mastered' : 'new',
        }));
        if (!cancelled) {
          setDeckTitle(title);
          setData({ status: 'ready', cards: views });
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
  }, [deckId, subdeckId, generation]);

  return { data, deckTitle, reload: () => setGeneration((g) => g + 1) };
}
