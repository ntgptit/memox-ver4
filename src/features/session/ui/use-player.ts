/**
 * Player controller (WBS 7.3) — hands-free deck playback. Loads the deck's
 * cards, speaks each card (term then meaning, at the chosen rate) and advances
 * automatically when speech finishes; the transport (prev/next/play-pause) and
 * the speed control re-drive playback. Speech failure → the error state; the
 * end panel offers replay.
 */

import { useCallback, useEffect, useState } from 'react';

import type { Card, CardRepository } from '@/features/flashcards/domain';
import { isErr } from '@/shared';

import type { PlayerData, PlayerSpeed, PlayerUiState } from './player-fixtures';

export interface PlayerDeps {
  cards: CardRepository;
  getDeckTitle: (deckId: string) => Promise<string>;
  /**
   * Speak one card at `rate`; `onDone` fires when playback finishes, `onError`
   * on a playback failure. Returns a stop handle.
   */
  speakCard: (term: string, meaning: string, rate: number, onDone: () => void, onError: () => void) => () => void;
}

export interface PlayerController {
  data: PlayerData;
  ui: PlayerUiState;
  speed: PlayerSpeed;
  playPause: () => void;
  prev: () => void;
  next: () => void;
  openSpeed: () => void;
  setSpeed: (speed: PlayerSpeed) => void;
  retry: () => void;
  replay: () => void;
}

export function usePlayer(deckId: string, deps: PlayerDeps | null): PlayerController {
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'playing' | 'paused' | 'speed' | 'error' | 'end'>('loading');
  const [speed, setSpeedValue] = useState<PlayerSpeed>('1');
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void (async () => {
      const [listed, title] = await Promise.all([deps.cards.listByDeck(deckId), deps.getDeckTitle(deckId)]);
      if (!alive) return;
      if (isErr(listed)) {
        setPhase('error');
        return;
      }
      setDeckTitle(title);
      setCards(listed.value);
      setIndex(0);
      setPhase(listed.value.length === 0 ? 'end' : 'playing');
    })();
    return () => {
      alive = false;
    };
  }, [deckId, deps, epoch]);

  // Hands-free loop: while playing, speak the current card; done → advance.
  const playing = phase === 'playing' || phase === 'speed';
  useEffect(() => {
    if (deps === null || !playing) return;
    const card = cards[index];
    if (card === undefined) return;
    let alive = true;
    const stop = deps.speakCard(
      card.term,
      card.meaning,
      Number(speed),
      () => {
        if (!alive) return;
        setIndex((i) => {
          if (i + 1 >= cards.length) {
            setPhase('end');
            return i;
          }
          return i + 1;
        });
      },
      () => {
        if (alive) setPhase('error');
      },
    );
    return () => {
      alive = false;
      stop();
    };
  }, [deps, playing, cards, index, speed]);

  const playPause = useCallback(() => {
    setPhase((p) => (p === 'paused' ? 'playing' : p === 'playing' || p === 'speed' ? 'paused' : p));
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + dir)));
    },
    [cards.length],
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);

  const openSpeed = useCallback(() => setPhase((p) => (p === 'playing' || p === 'paused' ? 'speed' : p)), []);
  const setSpeed = useCallback((s: PlayerSpeed) => {
    setSpeedValue(s);
    setPhase('playing');
  }, []);

  const retry = useCallback(() => {
    setPhase('loading');
    setEpoch((n) => n + 1);
  }, []);
  const replay = useCallback(() => {
    setIndex(0);
    setPhase('playing');
  }, []);

  const card = cards[index];
  const data: PlayerData =
    phase === 'error'
      ? { status: 'error', message: "Couldn't load the audio for this deck. Check your connection and try again." }
      : {
          status: 'ready',
          deckTitle,
          term: card?.term ?? '',
          meaning: card?.meaning ?? '',
          index,
          total: cards.length,
        };

  const ui: PlayerUiState =
    phase === 'error' ? 'error' : phase === 'end' ? 'end' : phase === 'speed' ? 'speed' : phase === 'paused' ? 'paused' : 'playing';

  return { data, ui, speed, playPause, prev, next, openSpeed, setSpeed, retry, replay };
}
