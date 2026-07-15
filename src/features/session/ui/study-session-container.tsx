/**
 * Study-session container (WBS 5.5) — resolves the card + session repositories,
 * drives the 5-stage (or due-review) orchestrator, and forwards the exit /
 * completion intents (done → the study-result screen).
 */

import { useEffect, useState } from 'react';

import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';
import { createSettingsRepository, loadStudySettings } from '@/features/settings/data';
import type { CardRepository } from '@/features/flashcards/domain';
import { isErr, ok } from '@/shared';
import { randomId, systemClock } from '@/shared/runtime';

import { StudySessionScreen } from './study-session-screen';
import { useStudySession, type StudySessionDeps, type StudySessionMode } from './use-study-session';

/**
 * Study-settings behavior (WBS 10.1): with `shuffle` on, the deck's cards enter
 * the session in a randomized order — a thin decorator over the card repo so
 * the orchestrator stays unchanged.
 */
function withShuffle(cards: CardRepository): CardRepository {
  return {
    ...cards,
    getById: (id) => cards.getById(id),
    list: () => cards.list(),
    save: (c) => cards.save(c),
    remove: (id) => cards.remove(id),
    countByDeck: (deckId) => cards.countByDeck(deckId),
    subscribe: (onChange) => cards.subscribe(onChange),
    async listByDeck(deckId) {
      const r = await cards.listByDeck(deckId);
      if (isErr(r)) return r;
      const out = [...r.value];
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return ok(out);
    },
  };
}

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
    void Promise.all([
      createFlashcardRepositories(),
      createSessionRepositories(),
      createSettingsRepository().then(loadStudySettings),
    ]).then(([flash, session, study]) => {
      if (alive) {
        setDeps({
          cards: study.shuffle ? withShuffle(flash.cards) : flash.cards,
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
