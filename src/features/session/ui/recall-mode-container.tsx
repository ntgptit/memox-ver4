/**
 * Recall-mode container (WBS 7.1) — resolves the card + session repositories and
 * runtime services, drives the round controller, and exits when the round completes.
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { studyableCardRepo } from '@/features/flashcards/domain';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { RecallModeScreen } from './recall-mode-screen';
import { useRecallMode, type RecallModeDeps } from './use-recall-mode';

export function RecallModeContainer({
  deckId,
  onBack,
  onDone,
}: {
  deckId: string;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const [deps, setDeps] = useState<RecallModeDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createFlashcardRepositories(), createSessionRepositories()]).then(([flash, session]) => {
      if (alive) {
        setDeps({
          cards: studyableCardRepo(flash.cards),
          sessions: session.sessions,
          attempts: session.attempts,
          srs: session.srs,
          ids: randomId,
          clock: systemClock,
        });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useRecallMode(deckId, deps);

  return (
    <RecallModeScreen
      phase={ctrl.phase}
      term={ctrl.term}
      meaning={ctrl.meaning}
      done={ctrl.done}
      total={ctrl.total}
      onReveal={ctrl.reveal}
      onForgot={ctrl.forgot}
      onRemembered={ctrl.remembered}
      onNext={onDone}
      onBack={onBack}
    />
  );
}
