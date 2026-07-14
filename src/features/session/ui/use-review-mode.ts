/**
 * Review-mode controller (WBS 6.1, session stage 1) — runs a browse round over a
 * deck's cards. Starts a `review` session (5.1), steps prev/next, persists one
 * attempt per card the first time it is passed (grade `good` via `recordAnswer`,
 * 5.2 transactional attempt + SRS), lets the learner edit the meaning in place
 * (persists through the flashcard edit use case) and speaks the term. The round
 * ends after the last card (finalize).
 */

import { useCallback, useEffect, useState } from 'react';

import { editCardUseCase, type Card, type CardRepository } from '@/features/flashcards/domain';
import {
  startSession,
  recordAnswer,
  finalizeSessionUseCase,
  type SessionRepository,
  type AttemptRepository,
  type SrsStateRepository,
} from '@/features/session/domain';
import { isErr, type IdGenerator, type Clock } from '@/shared';

import type { ReviewModeData, ReviewModeUiState } from './review-mode-fixtures';

export interface ReviewModeDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
  /** Speak a term (expo-speech). */
  speak: (term: string) => void;
}

export interface ReviewModeController {
  data: ReviewModeData;
  ui: ReviewModeUiState;
  prev: () => void;
  next: () => void;
  editStart: () => void;
  editCancel: () => void;
  editSave: (meaning: string) => void;
  playAudio: () => void;
  reload: () => void;
}

type Phase = 'loading' | 'error' | 'browsing' | 'editing' | 'audio' | 'end';

export function useReviewMode(deckId: string, deps: ReviewModeDeps | null): ReviewModeController {
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  /** Cards already recorded as reviewed (one attempt per card). */
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void (async () => {
      const listed = await deps.cards.listByDeck(deckId);
      if (isErr(listed)) {
        if (alive) setPhase('error');
        return;
      }
      const roundCards = listed.value;
      if (roundCards.length === 0) {
        if (alive) setPhase('end');
        return;
      }
      const started = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: 'review',
        cardIds: roundCards.map((c) => c.id),
      });
      if (!alive) return;
      if (isErr(started)) {
        setPhase('error');
        return;
      }
      setCards(roundCards);
      setIndex(0);
      setSeen(new Set());
      setSessionId(started.value.id);
      setPhase('browsing');
    })();
    return () => {
      alive = false;
    };
  }, [deckId, deps, epoch]);

  /** Record the current card as reviewed exactly once (grade `good`). */
  const recordCurrent = useCallback(() => {
    if (deps === null || sessionId === null) return;
    const card = cards[index];
    if (card === undefined || seen.has(card.id)) return;
    setSeen((s) => new Set(s).add(card.id));
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock }).execute({
      sessionId,
      cardId: card.id,
      stage: 'review',
      grade: 'good',
    });
  }, [deps, sessionId, cards, index, seen]);

  const next = useCallback(() => {
    if (phase !== 'browsing' && phase !== 'audio') return;
    recordCurrent();
    if (index + 1 >= cards.length) {
      setPhase('end');
      if (deps !== null && sessionId !== null) {
        void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(sessionId);
      }
      return;
    }
    setIndex((i) => i + 1);
    setPhase('browsing');
  }, [phase, recordCurrent, index, cards.length, deps, sessionId]);

  const prev = useCallback(() => {
    if (phase !== 'browsing' && phase !== 'audio') return;
    setIndex((i) => Math.max(0, i - 1));
    setPhase('browsing');
  }, [phase]);

  const editStart = useCallback(() => setPhase((p) => (p === 'browsing' || p === 'audio' ? 'editing' : p)), []);
  const editCancel = useCallback(() => setPhase((p) => (p === 'editing' ? 'browsing' : p)), []);

  const editSave = useCallback(
    (meaning: string) => {
      if (deps === null) return;
      const card = cards[index];
      if (card === undefined) return;
      void editCardUseCase({ cards: deps.cards, clock: deps.clock })
        .execute({ cardId: card.id, term: card.term, meaning, tags: card.tags, audioRef: card.audioRef })
        .then((r) => {
          if (!isErr(r)) {
            setCards((list) => list.map((c) => (c.id === card.id ? { ...c, meaning: r.value.meaning } : c)));
          }
          setPhase('browsing');
        });
    },
    [deps, cards, index],
  );

  const playAudio = useCallback(() => {
    if (deps === null) return;
    const card = cards[index];
    if (card === undefined || phase === 'editing') return;
    deps.speak(card.term);
    setPhase('audio');
  }, [deps, cards, index, phase]);

  const reload = useCallback(() => {
    setPhase('loading');
    setEpoch((n) => n + 1);
  }, []);

  const card = cards[index];
  const data: ReviewModeData =
    phase === 'loading'
      ? { status: 'loading' }
      : phase === 'error'
        ? { status: 'error', message: 'Something went wrong loading your cards. Check your connection and try again.' }
        : {
            status: 'ready',
            term: card?.term ?? '',
            meaning: card?.meaning ?? '',
            // Cards passed so far — the current one counts once it's behind you.
            done: phase === 'end' ? cards.length : index,
            total: cards.length,
          };

  const ui: ReviewModeUiState =
    phase === 'loading' ? 'loading' : phase === 'error' ? 'error' : phase === 'end' ? 'end' : phase;

  return { data, ui, prev, next, editStart, editCancel, editSave, playAudio, reload };
}
