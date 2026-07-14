/**
 * Library container (WBS 3.4) — resolves the library/flashcard/session repositories,
 * drives {@link useLibrary}, and navigates into decks / the card editor / import.
 */

import { useEffect, useState } from 'react';

import { isErr } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { LibraryScreen } from './library-screen';
import { useLibrary, makeCountDueByDeck, type LibraryDeps } from './use-library';

export interface LibraryContainerProps {
  onOpenDeck?: (id: string) => void;
  onStudyDeck?: (id: string) => void;
  onCreateDeck?: () => void;
  onAddCard?: () => void;
  onImport?: () => void;
}

export function LibraryContainer(props: LibraryContainerProps) {
  const [deps, setDeps] = useState<LibraryDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      ([lib, flash, session]) => {
        if (!alive) return;
        setDeps({
          listDecks: async () => {
            const r = await lib.decks.list();
            return isErr(r) ? [] : r.value;
          },
          listSubdecksByDeck: async (deckId) => {
            const r = await lib.subdecks.listByDeck(deckId);
            return isErr(r) ? [] : r.value;
          },
          countCardsByDeck: async (deckId) => {
            const r = await flash.cards.countByDeck(deckId);
            return isErr(r) ? 0 : r.value;
          },
          countDueByDeck: makeCountDueByDeck({
            listCardIdsByDeck: async (deckId) => {
              const r = await flash.cards.listByDeck(deckId);
              return isErr(r) ? [] : r.value.map((c) => c.id);
            },
            dueCards: (ids, now) => session.srs.dueCards(ids, now),
            now: systemClock,
          }),
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  // Stay on the loading skeleton until the repositories resolve; mount the
  // controller only with real deps so its load effect runs exactly once.
  if (deps === null) {
    return <LibraryScreen data={{ status: 'loading' }} {...props} />;
  }
  return <LoadedLibrary deps={deps} {...props} />;
}

function LoadedLibrary({ deps, ...props }: LibraryContainerProps & { deps: LibraryDeps }) {
  const controller = useLibrary(deps);
  return (
    <LibraryScreen
      data={controller.data}
      searchLibrary={controller.searchLibrary}
      onRetrySync={controller.reload}
      {...props}
    />
  );
}
