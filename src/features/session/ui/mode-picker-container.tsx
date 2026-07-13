/**
 * Mode-picker container (WBS 5.4) — resolves the card + SRS repositories, drives the
 * controller, and hands mode/scope choices back to the route for navigation.
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';
import type { SessionStage } from '@/features/session/domain';
import { systemClock } from '@/shared/runtime';

import { ModePickerScreen } from './mode-picker-screen';
import { useModePicker, type ModePickerDeps } from './use-mode-picker';
import type { StudyScope } from './mode-picker-model';

export function ModePickerContainer({
  deckId,
  onBack,
  onAddWords,
  onStart,
}: {
  deckId: string;
  onBack?: () => void;
  onAddWords?: () => void;
  /** Navigate to the chosen mode's session, carrying the active scope. */
  onStart?: (mode: SessionStage, scope: StudyScope, deckId: string) => void;
}) {
  const [deps, setDeps] = useState<ModePickerDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createFlashcardRepositories(), createSessionRepositories()]).then(([flash, session]) => {
      if (alive) setDeps({ cards: flash.cards, srs: session.srs, clock: systemClock });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useModePicker(deckId, deps);

  return (
    <ModePickerScreen
      scope={ctrl.scope}
      scopeCount={ctrl.scopeCount}
      onScopeChange={ctrl.setScope}
      onStart={(mode) => onStart?.(mode, ctrl.scope, deckId)}
      onAddWords={onAddWords}
      onBack={onBack}
    />
  );
}
