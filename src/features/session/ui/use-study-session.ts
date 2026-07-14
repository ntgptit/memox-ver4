/**
 * Study-session orchestrator (WBS 5.5) — drives the full 5-stage NewLearn flow
 * (review → match → guess → recall → fill) or a due-cards review round over one
 * deck. Starts or RESUMES a `full` session (position rebuilt from persisted
 * attempts; a broken resume → resume-error), persists every answer via
 * `recordAnswer` (a failed save → the answer-save-error dialog with retry),
 * re-queues wrong guesses as not-counted relearn passes, and finalizes when the
 * last stage completes. Session-wide progress = distinct (stage, card) answers
 * over cards × 5.
 */

import { useCallback, useEffect, useState } from 'react';

import type { Card, CardRepository } from '@/features/flashcards/domain';
import {
  startSession,
  recordAnswer,
  finalizeSessionUseCase,
  STAGE_ORDER,
  type Grade,
  type SessionStage,
  type SessionRepository,
  type AttemptRepository,
  type SrsStateRepository,
} from '@/features/session/domain';
import { isErr, type IdGenerator, type Clock } from '@/shared';

import type { StageContent, StudySessionUiState } from './study-session-fixtures';

export interface StudySessionDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export type StudySessionMode = 'full' | 'due';

export interface StudySessionController {
  ui: StudySessionUiState;
  label: string;
  done: number;
  total: number;
  content: StageContent;
  fillValue: string;
  setFillValue: (v: string) => void;
  next: () => void;
  pickOption: (option: string) => void;
  reveal: () => void;
  check: () => void;
  dueNext: () => void;
  dueRelearn: () => void;
  requestExit: () => void;
  stay: () => void;
  saveErrorBack: () => void;
  saveErrorRetry: () => void;
  restart: () => void;
}

const STAGE_LABEL: Record<SessionStage, string> = {
  review: 'Stage 1 · Review',
  match: 'Stage 2 · Match',
  guess: 'Stage 3 · Guess',
  recall: 'Stage 4 · Recall',
  fill: 'Stage 5 · Fill',
};

const STAGE_UI: Record<SessionStage, StudySessionUiState> = {
  review: 'stage1-review',
  match: 'stage2-match',
  guess: 'stage3-guess',
  recall: 'stage4-recall',
  fill: 'stage5-fill',
};

/** Normalized answer comparison (fill), same trim/case rule as fill-mode. */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

/** Deterministic guess options: the card's meaning + up to 2 next meanings. */
export function buildShellOptions(cards: readonly Card[], index: number): string[] {
  const correct = cards[index]?.meaning ?? '';
  const others = cards.filter((_, i) => i !== index).map((c) => c.meaning);
  const opts = [correct, ...others.slice(0, 2)];
  // Stable rotation by index so the correct answer isn't always first.
  const shift = cards.length > 0 ? index % opts.length : 0;
  return [...opts.slice(shift), ...opts.slice(0, shift)];
}

interface Pending {
  cardId: string;
  stage: SessionStage;
  grade: Grade;
  /** Applied after a successful save. */
  advance: () => void;
}

interface Flow {
  sessionId: string;
  cards: readonly Card[];
  stageIdx: number;
  cardIdx: number;
  /** Cards to replay (not counted) at the end of the current stage. */
  relearn: readonly Card[];
  /** In the relearn tail of the stage. */
  relearning: boolean;
  /** Distinct (stage, card) pairs answered. */
  counted: ReadonlySet<string>;
}

export function useStudySession(
  deckId: string,
  mode: StudySessionMode,
  deps: StudySessionDeps | null,
  onDone?: (sessionId: string) => void,
): StudySessionController {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [phase, setPhase] = useState<'loading' | 'running' | 'exit' | 'resume-error' | 'save-error' | 'done'>('loading');
  const [pending, setPending] = useState<Pending | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [epoch, setEpoch] = useState(0);

  // ---- start or resume ------------------------------------------------------------
  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void (async () => {
      const listed = mode === 'due' ? await dueCardsOf(deps, deckId) : await allCardsOf(deps, deckId);
      if (!alive) return;
      if (listed === null) {
        setPhase('resume-error');
        return;
      }
      const roundCards = listed;
      if (roundCards.length === 0) {
        setPhase('done');
        onDone?.('');
        return;
      }

      // Resume an active session when one exists; rebuild position from attempts.
      const active = await deps.sessions.activeForDeck(deckId);
      if (!alive) return;
      if (!isErr(active) && active.value !== null && active.value.mode === (mode === 'due' ? 'review' : 'full')) {
        const attempts = await deps.attempts.listBySession(active.value.id);
        if (!alive) return;
        if (isErr(attempts)) {
          setPhase('resume-error');
          return;
        }
        const counted = new Set(attempts.value.map((a) => `${a.stage}:${a.cardId}`));
        const rebuilt = rebuildPosition(roundCards, counted, mode);
        setFlow({ sessionId: active.value.id, cards: roundCards, relearn: [], relearning: false, counted, ...rebuilt });
        setPhase('running');
        return;
      }

      const started = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: mode === 'due' ? 'review' : 'full',
        cardIds: roundCards.map((c) => c.id),
      });
      if (!alive) return;
      if (isErr(started)) {
        setPhase('resume-error');
        return;
      }
      setFlow({
        sessionId: started.value.id,
        cards: roundCards,
        stageIdx: 0,
        cardIdx: 0,
        relearn: [],
        relearning: false,
        counted: new Set(),
      });
      setPhase('running');
    })();
    return () => {
      alive = false;
    };
  }, [deckId, mode, deps, epoch, onDone]);

  const stage: SessionStage = mode === 'due' ? 'review' : (STAGE_ORDER[flow?.stageIdx ?? 0] ?? 'review');
  const currentCard = flow === null ? undefined : flow.relearning ? flow.relearn[flow.cardIdx] : flow.cards[flow.cardIdx];

  /** Advance within the stage → relearn tail → next stage → finalize. */
  const advance = useCallback(() => {
    setFillValue('');
    setFlow((f) => {
      if (f === null) return f;
      const list = f.relearning ? f.relearn : f.cards;
      if (f.cardIdx + 1 < list.length) {
        return { ...f, cardIdx: f.cardIdx + 1 };
      }
      if (!f.relearning && f.relearn.length > 0 && mode !== 'due') {
        return { ...f, relearning: true, cardIdx: 0 };
      }
      const lastStage = mode === 'due' || f.stageIdx + 1 >= STAGE_ORDER.length;
      if (lastStage) {
        if (deps !== null) {
          void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(f.sessionId);
        }
        setPhase('done');
        onDone?.(f.sessionId);
        return f;
      }
      return { ...f, stageIdx: f.stageIdx + 1, cardIdx: 0, relearn: [], relearning: false };
    });
  }, [deps, mode, onDone]);

  /** Persist a grade; on failure park it behind the answer-save-error dialog. */
  const submit = useCallback(
    (grade: Grade, wrong: boolean) => {
      if (deps === null || flow === null || currentCard === undefined || phase !== 'running') return;
      const p: Pending = {
        cardId: currentCard.id,
        stage,
        grade,
        advance: () => {
          setFlow((f) => {
            if (f === null) return f;
            const key = `${stage}:${currentCard.id}`;
            const counted = f.counted.has(key) ? f.counted : new Set(f.counted).add(key);
            const relearn =
              wrong && !f.relearning && !f.relearn.some((c) => c.id === currentCard.id)
                ? [...f.relearn, currentCard]
                : f.relearn;
            return { ...f, counted, relearn };
          });
          advance();
        },
      };
      void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock })
        .execute({ sessionId: flow.sessionId, cardId: p.cardId, stage: p.stage, grade: p.grade })
        .then((r) => {
          if (isErr(r)) {
            setPending(p);
            setPhase('save-error');
            return;
          }
          p.advance();
        });
    },
    [deps, flow, currentCard, phase, stage, advance],
  );

  // ---- per-stage intents ------------------------------------------------------------
  const next = useCallback(() => submit('good', false), [submit]);
  const reveal = useCallback(() => submit('good', false), [submit]);

  const pickOption = useCallback(
    (option: string) => {
      if (currentCard === undefined) return;
      const correct = option === currentCard.meaning;
      submit(correct ? 'good' : 'again', !correct);
    },
    [currentCard, submit],
  );

  const check = useCallback(() => {
    if (currentCard === undefined) return;
    const correct = normalizeAnswer(fillValue) === normalizeAnswer(currentCard.term);
    submit(correct ? 'good' : 'again', !correct);
  }, [currentCard, fillValue, submit]);

  const dueNext = useCallback(() => submit('good', false), [submit]);
  const dueRelearn = useCallback(() => submit('again', false), [submit]);

  // ---- shell intents ----------------------------------------------------------------
  const requestExit = useCallback(() => setPhase((p) => (p === 'running' ? 'exit' : p)), []);
  const stay = useCallback(() => setPhase((p) => (p === 'exit' ? 'running' : p)), []);
  const saveErrorBack = useCallback(() => {
    setPending(null);
    setPhase('running');
  }, []);
  const saveErrorRetry = useCallback(() => {
    if (deps === null || flow === null || pending === null) return;
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock })
      .execute({ sessionId: flow.sessionId, cardId: pending.cardId, stage: pending.stage, grade: pending.grade })
      .then((r) => {
        if (isErr(r)) return; // stay on the dialog
        setPending(null);
        setPhase('running');
        pending.advance();
      });
  }, [deps, flow, pending]);
  const restart = useCallback(() => {
    setFlow(null);
    setPhase('loading');
    setEpoch((n) => n + 1);
  }, []);

  // ---- view model --------------------------------------------------------------------
  const totalCards = flow?.cards.length ?? 0;
  const total = mode === 'due' ? totalCards : totalCards * STAGE_ORDER.length;
  const done = flow?.counted.size ?? 0;
  const relearning = flow?.relearning === true && mode !== 'due';

  const ui: StudySessionUiState =
    phase === 'resume-error'
      ? 'resume-error'
      : phase === 'exit'
        ? 'exit'
        : phase === 'save-error'
          ? 'answer-save-error'
          : mode === 'due'
            ? 'due-review'
            : relearning
              ? 'relearn'
              : STAGE_UI[stage];

  const cards = flow?.cards ?? [];
  const idx = flow === null ? 0 : flow.relearning ? cards.findIndex((c) => c.id === currentCard?.id) : flow.cardIdx;
  const content: StageContent = {
    term: currentCard?.term ?? '',
    meaning: currentCard?.meaning ?? '',
    note: '',
    options: buildShellOptions(cards, Math.max(0, idx)),
    left: cards.slice(0, 3).map((c) => c.meaning),
    right: [...cards.slice(0, 3)].reverse().map((c) => c.term),
  };

  return {
    ui,
    label: mode === 'due' ? 'Review · due cards' : STAGE_LABEL[stage],
    done,
    total,
    content,
    fillValue,
    setFillValue,
    next,
    pickOption,
    reveal,
    check,
    dueNext,
    dueRelearn,
    requestExit,
    stay,
    saveErrorBack,
    saveErrorRetry,
    restart,
  };
}

async function allCardsOf(deps: StudySessionDeps, deckId: string): Promise<readonly Card[] | null> {
  const r = await deps.cards.listByDeck(deckId);
  return isErr(r) ? null : r.value;
}

async function dueCardsOf(deps: StudySessionDeps, deckId: string): Promise<readonly Card[] | null> {
  const listed = await deps.cards.listByDeck(deckId);
  if (isErr(listed)) return null;
  const due = await deps.srs.dueCards(
    listed.value.map((c) => c.id),
    deps.clock(),
  );
  if (isErr(due)) return null;
  const dueIds = new Set(due.value.map((s) => s.cardId));
  return listed.value.filter((c) => dueIds.has(c.id));
}

/** Resume: first (stage, card) pair without a recorded attempt. */
function rebuildPosition(
  cards: readonly Card[],
  counted: ReadonlySet<string>,
  mode: StudySessionMode,
): { stageIdx: number; cardIdx: number } {
  const stages = mode === 'due' ? (['review'] as const) : STAGE_ORDER;
  for (let s = 0; s < stages.length; s += 1) {
    for (let c = 0; c < cards.length; c += 1) {
      if (!counted.has(`${stages[s]}:${cards[c].id}`)) {
        return { stageIdx: s, cardIdx: c };
      }
    }
  }
  return { stageIdx: stages.length - 1, cardIdx: Math.max(0, cards.length - 1) };
}
