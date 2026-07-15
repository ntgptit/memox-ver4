/**
 * Player container (WBS 7.3) — resolves the card/deck repositories, wires
 * expo-speech hands-free playback (term → meaning → auto-advance) into
 * {@link usePlayer}, and forwards the exit intent.
 */

import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

import { isErr } from '@/shared';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { studyableCardRepo } from '@/features/flashcards/domain';
import { createLibraryRepositories } from '@/features/library/data';

import { PlayerScreen } from './player-screen';
import { usePlayer, type PlayerDeps } from './use-player';

export function PlayerContainer({ deckId, onBack }: { deckId: string; onBack?: () => void }) {
  const [deps, setDeps] = useState<PlayerDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createFlashcardRepositories(), createLibraryRepositories()]).then(([flash, lib]) => {
      if (!alive) return;
      setDeps({
        cards: studyableCardRepo(flash.cards),
        getDeckTitle: async (id) => {
          const r = await lib.decks.getById(id);
          return isErr(r) ? '' : r.value.title;
        },
        speakCard: (term, meaning, rate, onDone, onError) => {
          let stopped = false;
          Speech.speak(term, {
            rate,
            onDone: () => {
              if (stopped) return;
              Speech.speak(meaning, {
                rate,
                onDone: () => {
                  if (!stopped) onDone();
                },
                onError: () => {
                  if (!stopped) onError();
                },
              });
            },
            onError: () => {
              if (!stopped) onError();
            },
          });
          return () => {
            stopped = true;
            void Speech.stop();
          };
        },
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = usePlayer(deckId, deps);

  return (
    <PlayerScreen
      data={ctrl.data}
      ui={ctrl.ui}
      speed={ctrl.speed}
      onBack={onBack}
      onPrev={ctrl.prev}
      onNext={ctrl.next}
      onPlayPause={ctrl.playPause}
      onSpeedOpen={ctrl.openSpeed}
      onSpeedChange={ctrl.setSpeed}
      onRetry={ctrl.retry}
      onReplay={ctrl.replay}
      onClose={onBack}
    />
  );
}
