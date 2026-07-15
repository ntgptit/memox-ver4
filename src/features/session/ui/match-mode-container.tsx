/**
 * Match-mode container (WBS 6.2) — resolves the card + session repositories and runtime
 * services, drives the board controller, and exits when the round completes.
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { studyableCardRepo } from '@/features/flashcards/domain';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { MatchModeScreen } from './match-mode-screen';
import { useMatchMode, type MatchModeDeps } from './use-match-mode';

export function MatchModeContainer({
  deckId,
  onBack,
  onDone,
}: {
  deckId: string;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const [deps, setDeps] = useState<MatchModeDeps | null>(null);

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

  const c = useMatchMode(deckId, deps);

  return (
    <MatchModeScreen
      phase={c.phase}
      left={c.left}
      right={c.right}
      done={c.done}
      total={c.total}
      onTap={c.onTap}
      onNext={onDone}
      onBack={onBack}
    />
  );
}
