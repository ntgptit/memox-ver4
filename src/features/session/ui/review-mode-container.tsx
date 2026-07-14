/**
 * Review-mode container (WBS 6.1) — resolves the card + session repositories and
 * runtime services (expo-speech for pronunciation), drives the browse-round
 * controller, and forwards the exit intents.
 */

import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { ReviewModeScreen } from './review-mode-screen';
import { useReviewMode, type ReviewModeDeps } from './use-review-mode';

export function ReviewModeContainer({
  deckId,
  onBack,
  onStudyNow,
}: {
  deckId: string;
  onBack?: () => void;
  onStudyNow?: () => void;
}) {
  const [deps, setDeps] = useState<ReviewModeDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createFlashcardRepositories(), createSessionRepositories()]).then(([flash, session]) => {
      if (alive) {
        setDeps({
          cards: flash.cards,
          sessions: session.sessions,
          attempts: session.attempts,
          srs: session.srs,
          ids: randomId,
          clock: systemClock,
          speak: (term) => Speech.speak(term),
        });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useReviewMode(deckId, deps);

  return (
    <ReviewModeScreen
      data={ctrl.data}
      ui={ctrl.ui}
      onBack={onBack}
      onPrev={ctrl.prev}
      onNext={ctrl.next}
      onEditStart={ctrl.editStart}
      onEditCancel={ctrl.editCancel}
      onEditSave={ctrl.editSave}
      onPlayAudio={ctrl.playAudio}
      onRetry={ctrl.reload}
      onStudyNow={onStudyNow}
      onBackToDeck={onBack}
    />
  );
}
