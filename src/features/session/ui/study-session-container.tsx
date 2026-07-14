/**
 * Study-session container (WBS 5.5) — resolves the card + session repositories,
 * drives the 5-stage (or due-review) orchestrator, and forwards the exit /
 * completion intents (done → the study-result screen).
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';
import { randomId, systemClock } from '@/shared/runtime';

import { StudySessionScreen } from './study-session-screen';
import { useStudySession, type StudySessionDeps, type StudySessionMode } from './use-study-session';

export function StudySessionContainer({
  deckId,
  mode = 'full',
  onDone,
  onLeave,
}: {
  deckId: string;
  mode?: StudySessionMode;
  /** Session finalized — navigate to the result screen. */
  onDone?: (sessionId: string) => void;
  onLeave?: () => void;
}) {
  const [deps, setDeps] = useState<StudySessionDeps | null>(null);

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

  const ctrl = useStudySession(deckId, mode, deps, onDone);

  return (
    <StudySessionScreen
      ui={ctrl.ui}
      label={ctrl.label}
      done={ctrl.done}
      total={ctrl.total}
      content={ctrl.content}
      fillValue={ctrl.fillValue}
      onFillChange={ctrl.setFillValue}
      onNext={ctrl.next}
      onPickOption={ctrl.pickOption}
      onReveal={ctrl.reveal}
      onCheck={ctrl.check}
      onDueRelearn={ctrl.dueRelearn}
      onDueNext={ctrl.dueNext}
      onClose={ctrl.requestExit}
      onExitStay={ctrl.stay}
      onExitLeave={onLeave}
      onSaveErrorBack={ctrl.saveErrorBack}
      onSaveErrorRetry={ctrl.saveErrorRetry}
      onRestart={ctrl.restart}
      onBackToDeck={onLeave}
    />
  );
}
