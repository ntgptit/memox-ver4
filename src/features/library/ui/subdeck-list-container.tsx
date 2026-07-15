/**
 * Subdeck-list container (WBS 3.5 / 12.11 B3–B5, 12.12) — resolves the
 * library/flashcard/session repositories, drives {@link useSubdeckList},
 * forwards navigation intents, redirects cards-organisation decks to their
 * card list, and owns the rename/move/delete subdeck overlays (the domain use
 * cases existed; this wires them to the action sheet).
 */

import { useEffect, useState } from 'react';

import { Dialog, DialogInput, MxButton, Scrim, SelectSheet } from '@/design-system';
import { isErr, isOk } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { deleteSubdeck, moveSubdeckUseCase, renameSubdeckUseCase } from '../domain';
import { SubdeckListScreen, type SubdeckListScreenProps } from './subdeck-list-screen';
import { useSubdeckList, type SubdeckListDeps } from './use-subdeck-list';

export type SubdeckListContainerProps = Omit<SubdeckListScreenProps, 'data' | 'deckTitle' | 'initialUi'> & {
  deckId: string;
  /** 12.12: called when the deck's organisation is `cards` — no subdeck tree. */
  onCardsOrganisation?: () => void;
};

interface Mutations {
  rename: (id: string, title: string) => Promise<boolean>;
  move: (id: string, newParentId: string | null) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function SubdeckListContainer({ deckId, onCardsOrganisation, ...props }: SubdeckListContainerProps) {
  const [wiring, setWiring] = useState<{ deps: SubdeckListDeps; mutations: Mutations } | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      async ([lib, flash, session]) => {
        if (!alive) return;
        // 12.12: cards-organisation decks open on their card list instead.
        const deck = await lib.decks.getById(deckId);
        if (!isErr(deck) && deck.value.organisation === 'cards') {
          if (alive) onCardsOrganisation?.();
          return;
        }
        const rename = renameSubdeckUseCase({ subdecks: lib.subdecks });
        const move = moveSubdeckUseCase({ subdecks: lib.subdecks });
        const remove = deleteSubdeck({ subdecks: lib.subdecks });
        if (!alive) return;
        setWiring({
          deps: {
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
          },
          mutations: {
            rename: async (id, title) => isOk(await rename.execute({ subdeckId: id, title })),
            move: async (id, newParentId) => isOk(await move.execute({ subdeckId: id, newParentId })),
            remove: async (id) => isOk(await remove.execute(id)),
          },
        });
      },
    );
    return () => {
      alive = false;
    };
  }, [deckId, onCardsOrganisation]);

  if (wiring === null) {
    return <SubdeckListScreen data={{ status: 'loading' }} deckTitle="" {...props} />;
  }
  return <LoadedSubdecks deckId={deckId} wiring={wiring} {...props} />;
}

type SubdeckAction = { kind: 'rename' | 'move' | 'delete'; id: string } | null;

function LoadedSubdecks({
  deckId,
  wiring,
  ...props
}: Omit<SubdeckListContainerProps, 'deckId' | 'onCardsOrganisation'> & {
  deckId: string;
  wiring: { deps: SubdeckListDeps; mutations: Mutations };
}) {
  const controller = useSubdeckList(deckId, wiring.deps);
  const [action, setAction] = useState<SubdeckAction>(null);
  const [draft, setDraft] = useState('');

  const subdecks = controller.data.status === 'ready' ? controller.data.subdecks : [];
  const active = action === null ? null : (subdecks.find((s) => s.id === action.id) ?? null);
  const close = () => setAction(null);
  const run = (work: Promise<boolean>) => {
    void work.then((ok) => {
      if (ok) controller.reload();
      close();
    });
  };

  return (
    <>
      <SubdeckListScreen
        data={controller.data}
        deckTitle={controller.deckTitle}
        onRetry={controller.reload}
        onRenameSubdeck={(id) => {
          setDraft(subdecks.find((s) => s.id === id)?.name ?? '');
          setAction({ kind: 'rename', id });
        }}
        onMoveSubdeck={(id) => setAction({ kind: 'move', id })}
        onDeleteSubdeck={(id) => setAction({ kind: 'delete', id })}
        {...props}
      />

      {action?.kind === 'rename' && active !== null && (
        <Scrim align="center" onDismiss={close} node="subdeck-list/rename-scrim">
          <Dialog
            node="subdeck-list/rename-dialog"
            icon="edit"
            title="Rename subdeck"
            actionsLayout="end"
            body={
              <DialogInput node="subdeck-list/rename-input" label="Subdeck name" value={draft} onChangeText={setDraft} />
            }
            actions={[
              <MxButton key="cancel" variant="ghost" onPress={close} node="subdeck-list/rename-cancel">
                Cancel
              </MxButton>,
              <MxButton
                key="ok"
                variant="primary"
                onPress={() => run(wiring.mutations.rename(action.id, draft))}
                node="subdeck-list/rename-ok"
              >
                Save
              </MxButton>,
            ]}
          />
        </Scrim>
      )}

      {action?.kind === 'move' && active !== null && (
        <Scrim onDismiss={close} node="subdeck-list/move-scrim">
          <SelectSheet
            title={`Move “${active.name}”`}
            node="subdeck-list/move-sheet"
            options={[
              {
                key: 'root',
                icon: 'stacks',
                label: 'Deck root',
                onPress: () => run(wiring.mutations.move(action.id, null)),
                node: 'subdeck-list/move-root',
              },
              ...subdecks
                .filter((s) => s.id !== action.id)
                .map((s) => ({
                  key: s.id,
                  icon: 'style',
                  label: s.name,
                  onPress: () => run(wiring.mutations.move(action.id, s.id)),
                  node: `subdeck-list/move-${s.id}`,
                })),
            ]}
          />
        </Scrim>
      )}

      {action?.kind === 'delete' && active !== null && (
        <Scrim align="center" onDismiss={close} node="subdeck-list/delete-scrim">
          <Dialog
            node="subdeck-list/delete-dialog"
            icon="delete"
            tone="error"
            title="Delete subdeck?"
            text={`“${active.name}” and its card assignments will be removed. This cannot be undone.`}
            actionsLayout="end"
            actions={[
              <MxButton key="cancel" variant="ghost" onPress={close} node="subdeck-list/delete-cancel">
                Cancel
              </MxButton>,
              <MxButton
                key="ok"
                variant="primary"
                danger
                onPress={() => run(wiring.mutations.remove(action.id))}
                node="subdeck-list/delete-ok"
              >
                Delete
              </MxButton>,
            ]}
          />
        </Scrim>
      )}
    </>
  );
}
