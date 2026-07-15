/**
 * Flashcard-list container (WBS 4.3) — resolves the library/flashcard/session
 * repositories, drives {@link useFlashcardList}, and wires the delete use case.
 */

import { useEffect, useState } from 'react';

import { Scrim, SelectSheet } from '@/design-system';
import { isErr, isOk, ok, err, storageError, type AppError, type Result } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { deleteCard, moveCardUseCase, setCardHiddenUseCase } from '../domain';
import { FlashcardListScreen, type FlashcardListScreenProps } from './flashcard-list-screen';
import { useFlashcardList, type FlashcardListDeps } from './use-flashcard-list';

export type FlashcardListContainerProps = Omit<FlashcardListScreenProps, 'data' | 'deckTitle' | 'initialUi' | 'onDeleteCard'> & {
  deckId: string;
  subdeckId?: string;
};

interface Wiring {
  deps: FlashcardListDeps;
  remove: (id: string) => Promise<Result<unknown, AppError>>;
  move: (cardId: string, subdeckId: string | null) => Promise<boolean>;
  setHidden: (cardId: string, hidden: boolean) => Promise<boolean>;
  listSubdecks: () => Promise<{ id: string; title: string }[]>;
}

export function FlashcardListContainer({ deckId, subdeckId, ...props }: FlashcardListContainerProps) {
  const [wiring, setWiring] = useState<Wiring | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      ([lib, flash, session]) => {
        if (!alive) return;
        const removeUseCase = deleteCard({ cards: flash.cards });
        const move = moveCardUseCase({ cards: flash.cards, clock: systemClock });
        const setHidden = setCardHiddenUseCase({ cards: flash.cards, clock: systemClock });
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
              return cards.map((c) => ({ id: c.id, term: c.term, meaning: c.meaning, hidden: c.hidden }));
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
          move: async (cardId, sub) => isOk(await move.execute({ cardId, subdeckId: sub })),
          setHidden: async (cardId, hidden) => isOk(await setHidden.execute({ cardId, hidden })),
          listSubdecks: async () => {
            const r = await lib.subdecks.listByDeck(deckId);
            return isErr(r) ? [] : r.value.map((s) => ({ id: s.id, title: s.title }));
          },
        });
      },
    );
    return () => {
      alive = false;
    };
  }, [deckId]);

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
  const [moving, setMoving] = useState<string | null>(null);
  const [subdecks, setSubdecks] = useState<{ id: string; title: string }[]>([]);

  const cards = controller.data.status === 'ready' ? controller.data.cards : [];

  const openMove = (id: string) => {
    void wiring.listSubdecks().then(setSubdecks);
    setMoving(id);
  };
  const runMove = (sub: string | null) => {
    if (moving === null) return;
    void wiring.move(moving, sub).then((ok) => {
      if (ok) controller.reload();
      setMoving(null);
    });
  };

  return (
    <>
      <FlashcardListScreen
        data={controller.data}
        deckTitle={controller.deckTitle}
        onRetry={controller.reload}
        onDeleteCard={async (id) => {
          const r = await wiring.remove(id);
          if (!isErr(r)) controller.reload();
          return isErr(r) ? r : ok(undefined);
        }}
        onMoveCard={openMove}
        onHideCard={(id) => {
          const card = cards.find((c) => c.id === id);
          void wiring.setHidden(id, !(card?.hidden ?? false)).then((ok) => {
            if (ok) controller.reload();
          });
        }}
        {...props}
      />

      {moving !== null && (
        <Scrim onDismiss={() => setMoving(null)} node="flashcard-list/move-scrim">
          <SelectSheet
            title="Move card to"
            node="flashcard-list/move-sheet"
            options={[
              { key: 'root', icon: 'stacks', label: 'Deck root', onPress: () => runMove(null), node: 'flashcard-list/move-root' },
              ...subdecks.map((s) => ({
                key: s.id,
                icon: 'style',
                label: s.title,
                onPress: () => runMove(s.id),
                node: `flashcard-list/move-${s.id}`,
              })),
            ]}
          />
        </Scrim>
      )}
    </>
  );
}
