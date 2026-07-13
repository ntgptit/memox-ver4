/**
 * Fill-mode controller (WBS 7.2) — runs a fill round over a deck's cards, reusing the
 * session-play pattern (7.1). Show a meaning; the learner types the term and Checks.
 * A correct answer grades `good`; a wrong answer grades `again` and offers Retry or
 * "I was right" (which grades `good` as a typo override). Help reveals a hint.
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

import type { FillPhase } from './fill-mode-screen';

export interface FillModeDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface FillModeController {
  phase: FillPhase;
  meaning: string;
  term: string;
  input: string;
  hint: string | undefined;
  done: number;
  total: number;
  onChangeInput: (t: string) => void;
  onCheck: () => void;
  onHint: () => void;
  onNext: () => void;
  onAccept: () => void;
  onRetry: () => void;
}

type Stage = 'answering' | 'correct' | 'wrong' | 'complete';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function useFillMode(deckId: string, deps: FillModeDeps | null): FillModeController {
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('answering');
  const [input, setInput] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.cards.listByDeck(deckId).then(async (res) => {
      if (!alive || isErr(res)) return;
      setCards(res.value);
      if (res.value.length === 0) {
        setStage('complete');
        return;
      }
      const session = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: 'fill',
        cardIds: res.value.map((c) => c.id),
      });
      if (alive && !isErr(session)) setSessionId(session.value.id);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const current = cards[index];
  const term = current?.term ?? '';

  const record = (grade: 'good' | 'again') => {
    if (!deps || sessionId === null || !current) return;
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock }).execute({
      sessionId,
      cardId: current.id,
      stage: 'fill',
      grade,
    });
  };

  const advance = () => {
    const nextIndex = index + 1;
    setInput('');
    setHintShown(false);
    if (nextIndex >= cards.length) {
      setStage('complete');
      if (deps && sessionId) {
        void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(sessionId);
      }
      return;
    }
    setIndex(nextIndex);
    setStage('answering');
  };

  const phase: FillPhase =
    stage === 'complete'
      ? 'complete'
      : stage === 'correct'
        ? 'correct'
        : stage === 'wrong'
          ? 'wrong'
          : hintShown
            ? 'hint'
            : input.trim().length > 0
              ? 'typing'
              : 'waiting';

  const chars = Array.from(term);
  const hint = hintShown ? `Hint: ${chars.length} characters, starts with ${chars[0] ?? ''}` : undefined;

  return {
    phase,
    meaning: current?.meaning ?? '',
    term,
    input,
    hint,
    done: index,
    total: cards.length,
    onChangeInput: (t) => {
      if (stage === 'answering') setInput(t);
    },
    onCheck: () => {
      if (stage !== 'answering' || input.trim().length === 0) return;
      const correct = normalize(input) === normalize(term);
      record(correct ? 'good' : 'again');
      setStage(correct ? 'correct' : 'wrong');
    },
    onHint: () => {
      if (stage === 'answering') setHintShown(true);
    },
    onNext: () => {
      if (stage === 'correct') advance();
    },
    onAccept: () => {
      if (stage !== 'wrong') return;
      record('good'); // typo override — count it as remembered
      advance();
    },
    onRetry: () => {
      if (stage !== 'wrong') return;
      setStage('answering');
      setInput('');
      setHintShown(false);
    },
  };
}
