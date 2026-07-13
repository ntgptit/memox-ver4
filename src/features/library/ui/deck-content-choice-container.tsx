/**
 * Deck-content-choice container (WBS 3.6) — resolves the production deck repository +
 * runtime clock, drives the controller, and routes on success. Persisting the choice
 * sets the deck's organisation; the parent then navigates to subdeck-list or
 * flashcard-list via `onChosen`.
 */

import { useEffect, useState } from 'react';

import { createLibraryRepositories } from '@/features/library/data';
import type { DeckOrganisation } from '@/features/library/domain';
import { isOk } from '@/shared';
import { systemClock } from '@/shared/runtime';

import { DeckContentChoiceScreen } from './deck-content-choice-screen';
import { useDeckContentChoice, type DeckContentChoiceDeps } from './use-deck-content-choice';

export function DeckContentChoiceContainer({
  deckId,
  onBack,
  onImport,
  onChosen,
}: {
  deckId: string;
  onBack?: () => void;
  onImport?: () => void;
  /** Called after the choice persists, so the route can navigate. */
  onChosen?: (organisation: DeckOrganisation, deckId: string) => void;
}) {
  const [deps, setDeps] = useState<DeckContentChoiceDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void createLibraryRepositories().then((repos) => {
      if (alive) setDeps({ decks: repos.decks, clock: systemClock });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useDeckContentChoice(deckId, deps);

  return (
    // Re-seed the name field once the deck resolves (deckName goes undefined → value).
    <DeckContentChoiceScreen
      key={ctrl.deckName ?? 'loading'}
      deckName={ctrl.deckName ?? ''}
      onBack={onBack}
      onImport={onImport}
      onChoose={async (input) => {
        const result = await ctrl.choose(input);
        if (isOk(result)) onChosen?.(input.organisation, deckId);
        return result;
      }}
    />
  );
}
