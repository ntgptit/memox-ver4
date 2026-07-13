/**
 * Deck-content-choice controller (WBS 3.6) — loads the deck's current name and wires
 * the name+organise write through `setDeckContentUseCase` (3.1) over the deck
 * repository (3.2). Deps are injected so tests drive it with in-memory fakes.
 */

import { useEffect, useState } from 'react';

import { setDeckContentUseCase, type DeckOrganisation, type DeckRepository } from '@/features/library/domain';
import { isErr, err, unexpectedError, type Result, type AppError, type Clock } from '@/shared';

export interface DeckContentChoiceDeps {
  decks: DeckRepository;
  clock: Clock;
}

export interface DeckContentChoiceController {
  /** Loaded deck name (seed for the field); undefined until the deck resolves. */
  deckName: string | undefined;
  choose: (input: { title: string; organisation: DeckOrganisation }) => Promise<Result<unknown, AppError>>;
}

/**
 * Drive the deck-content-choice screen for `deckId`. `deps === null` means the
 * production repositories are still resolving — name stays undefined and writes no-op.
 */
export function useDeckContentChoice(deckId: string, deps: DeckContentChoiceDeps | null): DeckContentChoiceController {
  const [deckName, setDeckName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.decks.getById(deckId).then((res) => {
      if (alive && !isErr(res)) setDeckName(res.value.title);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const choose: DeckContentChoiceController['choose'] = async (input) => {
    if (!deps) return err(unexpectedError('Not ready yet.'));
    return setDeckContentUseCase({ decks: deps.decks, clock: deps.clock }).execute({ deckId, ...input });
  };

  return { deckName, choose };
}
