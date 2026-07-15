/**
 * Guess-mode container (WBS 6.3) — resolves the card + session repositories and runtime
 * services, drives the round controller, and exits when the round completes.
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { studyableCardRepo } from '@/features/flashcards/domain';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { GuessModeScreen } from './guess-mode-screen';
import { useGuessMode, type GuessModeDeps } from './use-guess-mode';

export function GuessModeContainer({
  deckId,
  onBack,
  onDone,
}: {
  deckId: string;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const [deps, setDeps] = useState<GuessModeDeps | null>(null);

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

  const ctrl = useGuessMode(deckId, deps);

  return (
    <GuessModeScreen
      phase={ctrl.phase}
      term={ctrl.term}
      options={ctrl.options}
      correctIndex={ctrl.correctIndex}
      pickedIndex={ctrl.pickedIndex}
      done={ctrl.done}
      total={ctrl.total}
      onPick={ctrl.pick}
      onContinue={ctrl.advance}
      onDone={onDone}
      onBack={onBack}
    />
  );
}
