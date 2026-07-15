/**
 * Recall-mode controller (WBS 7.1) — runs a single-mode recall round over a deck's
 * cards. Starts a session (5.1), steps card-by-card, and persists each self-grade via
 * `recordAnswer` (5.2, transactional attempt + SRS). "Forgot" (grade `again`) re-queues
 * the card so it returns this round; "Got it" (grade `good`) advances. The round is
 * complete when every card has been remembered. Deps injected for tests.
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

import type { RecallPhase } from './recall-mode-screen';

export interface RecallModeDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface RecallModeController {
  phase: RecallPhase;
  term: string;
  meaning: string;
  done: number;
  total: number;
  reveal: () => void;
  forgot: () => void;
  remembered: () => void;
}

const EMPTY_CARD: Card = {
  id: '',
  deckId: '',
  subdeckId: null,
  term: '',
  meaning: '',
  tags: [],
  audioRef: null,
  hidden: false,
  createdAt: 0,
  updatedAt: 0,
};

export function useRecallMode(deckId: string, deps: RecallModeDeps | null): RecallModeController {
  const [queue, setQueue] = useState<readonly Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<RecallPhase>('before-reveal');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.cards.listByDeck(deckId).then(async (res) => {
      if (!alive || isErr(res)) return;
      const cards = res.value;
      setQueue(cards);
      setTotal(cards.length);
      if (cards.length === 0) {
        setPhase('complete');
        return;
      }
      const session = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: 'recall',
        cardIds: cards.map((c) => c.id),
      });
      if (alive && !isErr(session)) setSessionId(session.value.id);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const current = queue[index] ?? EMPTY_CARD;

  const finalize = () => {
    if (deps && sessionId) {
      void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(sessionId);
    }
  };

  const grade = (kind: 'forgot' | 'remembered') => {
    if (!deps || sessionId === null || phase === 'complete') return;
    const card = current;
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock }).execute({
      sessionId,
      cardId: card.id,
      stage: 'recall',
      grade: kind === 'forgot' ? 'again' : 'good',
    });

    setPhase('before-reveal');
    if (kind === 'forgot') {
      // Re-queue so the card returns later this round; not yet counted as done.
      setQueue((q) => [...q, card]);
      setIndex((i) => i + 1);
      return;
    }
    const nextRemembered = rememberedCount + 1;
    setRememberedCount(nextRemembered);
    if (nextRemembered >= total) {
      setPhase('complete');
      finalize();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return {
    phase,
    term: current.term,
    meaning: current.meaning,
    done: rememberedCount,
    total,
    reveal: () => setPhase('revealed'),
    forgot: () => grade('forgot'),
    remembered: () => grade('remembered'),
  };
}
