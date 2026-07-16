/**
 * Deck-content-choice container (WBS 3.6) — resolves the production deck repository +
 * runtime clock, drives the controller, and routes on success. Persisting the choice
 * sets the deck's organisation; the parent then navigates to subdeck-list or
 * flashcard-list via `onChosen`.
 */

import { useEffect, useState } from 'react';

import { createLibraryRepositories } from '@/features/library/data';
import { createDeck, type DeckOrganisation } from '@/features/library/domain';
import type { LanguagePairRepository } from '@/features/languages/domain';
import { err, isErr, isOk, validationError } from '@/shared';
import { randomId, systemClock } from '@/shared/runtime';

import { DeckContentChoiceScreen } from './deck-content-choice-screen';
import { useDeckContentChoice, type DeckContentChoiceDeps } from './use-deck-content-choice';

/** The `/deck/new/content` sentinel: name + organise CREATE a brand-new deck (12.1). */
export const NEW_DECK_ID = 'new';

export function DeckContentChoiceContainer({
  deckId,
  onBack,
  onImport,
  onChosen,
  onNeedLanguagePair,
}: {
  deckId: string;
  onBack?: () => void;
  onImport?: () => void;
  /** Called after the choice persists, so the route can navigate. */
  onChosen?: (organisation: DeckOrganisation, deckId: string) => void;
  /** New-deck flow with no language pair yet — route to add-pair instead of erroring. */
  onNeedLanguagePair?: () => void;
}) {
  const [deps, setDeps] = useState<(DeckContentChoiceDeps & { languagePairs: LanguagePairRepository }) | null>(null);

  useEffect(() => {
    let alive = true;
    void createLibraryRepositories().then((repos) => {
      if (alive) setDeps({ decks: repos.decks, languagePairs: repos.languagePairs, clock: systemClock });
    });
    return () => {
      alive = false;
    };
  }, []);

  const creating = deckId === NEW_DECK_ID;
  const ctrl = useDeckContentChoice(deckId, deps);

  return (
    // Re-seed the name field once the deck resolves (deckName goes undefined → value).
    <DeckContentChoiceScreen
      key={ctrl.deckName ?? 'loading'}
      deckName={ctrl.deckName ?? ''}
      mode={creating ? 'create' : 'save'}
      onBack={onBack}
      onImport={onImport}
      onSubmit={async (input) => {
        if (creating) {
          // 12.1: actually CREATE the deck (the old flow only set organisation
          // on the non-existent id 'new' — every Create-deck button dead-ended).
          if (deps === null) return err(validationError([], 'Still loading — try again.'));
          const pairs = await deps.languagePairs.list();
          if (isErr(pairs)) return pairs;
          if (pairs.value.length === 0) {
            onNeedLanguagePair?.();
            return err(validationError([], 'Add a language pair first.'));
          }
          const created = await createDeck({ decks: deps.decks, ids: randomId, clock: systemClock }).execute({
            title: input.title,
            languagePairId: pairs.value[0].id,
            organisation: input.organisation,
          });
          if (isOk(created)) onChosen?.(input.organisation, created.value.id);
          return created;
        }
        const result = await ctrl.choose(input);
        if (isOk(result)) onChosen?.(input.organisation, deckId);
        return result;
      }}
    />
  );
}
