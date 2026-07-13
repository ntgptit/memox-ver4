/**
 * Deck-settings container (WBS 4.5) — resolves the library + flashcard repositories
 * and the shared DB, drives the controller, and navigates away after a delete.
 */

import { useEffect, useState } from 'react';

import { getSqlDatabase } from '@/db/sql';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { systemClock } from '@/shared/runtime';

import { DeckSettingsScreen } from './deck-settings-screen';
import { useDeckSettings, type DeckSettingsDeps } from './use-deck-settings';

export function DeckSettingsContainer({
  deckId,
  onBack,
  onDeleted,
  onExport,
}: {
  deckId: string;
  onBack?: () => void;
  onDeleted?: () => void;
  onExport?: () => void;
}) {
  const [deps, setDeps] = useState<DeckSettingsDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), getSqlDatabase()]).then(
      ([lib, flash, db]) => {
        if (alive) {
          setDeps({
            decks: lib.decks,
            languagePairs: lib.languagePairs,
            cards: flash.cards,
            db,
            clock: systemClock,
          });
        }
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useDeckSettings(deckId, deps);

  return (
    // Re-seed once the deck title resolves (goes '' → value), so the rename dialog seeds.
    <DeckSettingsScreen
      key={ctrl.deckTitle || 'loading'}
      deckTitle={ctrl.deckTitle}
      languagePairs={ctrl.languagePairs}
      currentPairId={ctrl.currentPairId}
      onRename={ctrl.rename}
      onMove={ctrl.move}
      onReset={ctrl.reset}
      onDelete={ctrl.remove}
      onExport={onExport}
      onBack={onBack}
      onDone={onDeleted}
    />
  );
}
