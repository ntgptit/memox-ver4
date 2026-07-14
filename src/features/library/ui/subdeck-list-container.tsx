/**
 * Subdeck-list container (WBS 3.5) — resolves the library/flashcard/session
 * repositories, drives {@link useSubdeckList}, and forwards navigation intents.
 */

import { useEffect, useState } from 'react';

import { isErr } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { SubdeckListScreen, type SubdeckListScreenProps } from './subdeck-list-screen';
import { useSubdeckList, type SubdeckListDeps } from './use-subdeck-list';

export type SubdeckListContainerProps = Omit<SubdeckListScreenProps, 'data' | 'deckTitle' | 'initialUi'> & {
  deckId: string;
};

export function SubdeckListContainer({ deckId, ...props }: SubdeckListContainerProps) {
  const [deps, setDeps] = useState<SubdeckListDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      ([lib, flash, session]) => {
        if (!alive) return;
        setDeps({
          getDeckTitle: async (id) => {
            const r = await lib.decks.getById(id);
            return isErr(r) ? '' : r.value.title;
          },
          listSubdecks: async (id) => {
            const r = await lib.subdecks.listByDeck(id);
            return isErr(r) ? [] : r.value.map((s) => ({ id: s.id, title: s.title }));
          },
          cardIdsBySubdeck: async (id) => {
            const r = await flash.cards.listByDeck(id);
            const map = new Map<string, string[]>();
            if (!isErr(r)) {
              for (const c of r.value) {
                if (c.subdeckId === null) continue;
                const arr = map.get(c.subdeckId) ?? [];
                arr.push(c.id);
                map.set(c.subdeckId, arr);
              }
            }
            return map;
          },
          countDue: async (ids) => {
            const r = await session.srs.dueCards(ids, systemClock());
            return isErr(r) ? 0 : r.value.length;
          },
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  if (deps === null) {
    return <SubdeckListScreen data={{ status: 'loading' }} deckTitle="" {...props} />;
  }
  return <LoadedSubdecks deckId={deckId} deps={deps} {...props} />;
}

function LoadedSubdecks({
  deckId,
  deps,
  ...props
}: Omit<SubdeckListContainerProps, 'deckId'> & { deckId: string; deps: SubdeckListDeps }) {
  const controller = useSubdeckList(deckId, deps);
  return <SubdeckListScreen data={controller.data} deckTitle={controller.deckTitle} onRetry={controller.reload} {...props} />;
}
