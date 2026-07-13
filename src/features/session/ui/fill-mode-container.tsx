/**
 * Fill-mode container (WBS 7.2) — resolves the card + session repositories and runtime
 * services, drives the round controller, and exits when the round completes.
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { FillModeScreen } from './fill-mode-screen';
import { useFillMode, type FillModeDeps } from './use-fill-mode';

export function FillModeContainer({
  deckId,
  onBack,
  onDone,
}: {
  deckId: string;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const [deps, setDeps] = useState<FillModeDeps | null>(null);

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
        });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const c = useFillMode(deckId, deps);

  return (
    <FillModeScreen
      phase={c.phase}
      meaning={c.meaning}
      term={c.term}
      input={c.input}
      hint={c.hint}
      done={c.done}
      total={c.total}
      onChangeInput={c.onChangeInput}
      onCheck={c.onCheck}
      onHint={c.onHint}
      onNext={c.onNext}
      onAccept={c.onAccept}
      onRetry={c.onRetry}
      onDone={onDone}
      onBack={onBack}
    />
  );
}
