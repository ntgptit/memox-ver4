/**
 * Guess-mode controller (WBS 6.3) — runs a guess round over a deck's cards, reusing the
 * session-play pattern (7.1): start a session, build deterministic options per card,
 * and persist each pick via `recordAnswer` (correct→`good`, wrong→`again`). A feedback
 * step (correct/wrong) precedes advancing so the learner sees the right answer.
 */

import { useEffect, useState } from 'react';

import type { Card, CardRepository } from '@/features/flashcards/domain';
import {
  startSession,
  recordAnswer,
  finalizeSessionUseCase,
  type SessionRepository,
  type AttemptRepository,
  type SrsStateRepository,
} from '@/features/session/domain';
import { isErr, type IdGenerator, type Clock } from '@/shared';

import type { GuessPhase } from './guess-mode-screen';
import { buildOptions } from './guess-options';

export interface GuessModeDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface GuessModeController {
  phase: GuessPhase;
  term: string;
  options: readonly string[];
  correctIndex: number;
  pickedIndex: number | null;
  done: number;
  total: number;
  pick: (i: number) => void;
  advance: () => void;
}

export function useGuessMode(deckId: string, deps: GuessModeDeps | null): GuessModeController {
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<GuessPhase>('waiting');
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.cards.listByDeck(deckId).then(async (res) => {
      if (!alive || isErr(res)) return;
      setCards(res.value);
      if (res.value.length === 0) {
        setPhase('complete');
        return;
      }
      const session = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: 'guess',
        cardIds: res.value.map((c) => c.id),
      });
      if (alive && !isErr(session)) setSessionId(session.value.id);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const { options, correctIndex } = buildOptions(cards, index);
  const current = cards[index];

  const pick = (i: number) => {
    if (!deps || sessionId === null || phase !== 'waiting' || !current) return;
    const correct = i === correctIndex;
    setPickedIndex(i);
    setPhase(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((n) => n + 1);
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock }).execute({
      sessionId,
      cardId: current.id,
      stage: 'guess',
      grade: correct ? 'good' : 'again',
    });
  };

  const advance = () => {
    if (phase !== 'correct' && phase !== 'wrong') return;
    const nextIndex = index + 1;
    setPickedIndex(null);
    if (nextIndex >= cards.length) {
      setPhase('complete');
      if (deps && sessionId) {
        void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(sessionId);
      }
      return;
    }
    setIndex(nextIndex);
    setPhase('waiting');
  };

  return {
    phase,
    term: current?.term ?? '',
    options,
    correctIndex,
    pickedIndex,
    done: correctCount,
    total: cards.length,
    pick,
    advance,
  };
}
