/**
 * Flashcard-list container (WBS 4.3) — resolves the library/flashcard/session
 * repositories, drives {@link useFlashcardList}, and wires the delete use case.
 */

import { useEffect, useState } from 'react';

import { isErr, ok, err, storageError, type AppError, type Result } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { deleteCard } from '../domain';
import { FlashcardListScreen, type FlashcardListScreenProps } from './flashcard-list-screen';
import { useFlashcardList, type FlashcardListDeps } from './use-flashcard-list';

export type FlashcardListContainerProps = Omit<FlashcardListScreenProps, 'data' | 'deckTitle' | 'initialUi' | 'onDeleteCard'> & {
  deckId: string;
  subdeckId?: string;
};

interface Wiring {
  deps: FlashcardListDeps;
  remove: (id: string) => Promise<Result<unknown, AppError>>;
}

export function FlashcardListContainer({ deckId, subdeckId, ...props }: FlashcardListContainerProps) {
  const [wiring, setWiring] = useState<Wiring | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      ([lib, flash, session]) => {
        if (!alive) return;
        const removeUseCase = deleteCard({ cards: flash.cards });
        setWiring({
          deps: {
            getDeckTitle: async (id) => {
              const r = await lib.decks.getById(id);
              return isErr(r) ? '' : r.value.title;
            },
            listCards: async (id, sub) => {
              const r = await flash.cards.listByDeck(id);
              if (isErr(r)) return [];
              const cards = sub === undefined ? r.value : r.value.filter((c) => c.subdeckId === sub);
              return cards.map((c) => ({ id: c.id, term: c.term, meaning: c.meaning }));
            },
            dueCardIds: async (ids) => {
              if (ids.length === 0) return new Set<string>();
              const r = await session.srs.dueCards(ids, systemClock());
              return new Set(isErr(r) ? [] : r.value.map((s) => s.cardId));
            },
            studiedCardIds: async (ids) => {
              if (ids.length === 0) return new Set<string>();
              // The SRS repo has no bulk by-cards read; the full state list is small
              // (one row per studied card) and local.
              const r = await session.srs.list();
              const idSet = new Set(ids);
              return new Set(isErr(r) ? [] : r.value.filter((s) => idSet.has(s.cardId)).map((s) => s.cardId));
            },
          },
          remove: async (id) => {
            try {
              return await removeUseCase.execute(id);
            } catch {
              return err(storageError('Could not delete the card.'));
            }
          },
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  if (wiring === null) {
    return <FlashcardListScreen data={{ status: 'loading' }} deckTitle="" {...props} />;
  }
  return <LoadedCards deckId={deckId} subdeckId={subdeckId} wiring={wiring} {...props} />;
}

function LoadedCards({
  deckId,
  subdeckId,
  wiring,
  ...props
}: Omit<FlashcardListContainerProps, 'deckId' | 'subdeckId'> & { deckId: string; subdeckId?: string; wiring: Wiring }) {
  const controller = useFlashcardList(deckId, subdeckId, wiring.deps);
  return (
    <FlashcardListScreen
      data={controller.data}
      deckTitle={controller.deckTitle}
      onRetry={controller.reload}
      onDeleteCard={async (id) => {
        const r = await wiring.remove(id);
        if (!isErr(r)) controller.reload();
        return isErr(r) ? r : ok(undefined);
      }}
      {...props}
    />
  );
}
