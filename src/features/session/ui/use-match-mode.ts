/**
 * Match-mode controller (WBS 6.2) — runs a matching board over a deck's cards, reusing
 * the session-play pattern (7.1). Tap a meaning then a term (or vice-versa): a correct
 * pair locks and grades `good`; a wrong pair clears the selection. The round completes
 * when every pair on the board is matched.
 */

import { useEffect, useState } from 'react';

import type { CardRepository } from '@/features/flashcards/domain';
import {
  startSession,
  recordAnswer,
  finalizeSessionUseCase,
  type SessionRepository,
  type AttemptRepository,
  type SrsStateRepository,
} from '@/features/session/domain';
import { isErr, type IdGenerator, type Clock } from '@/shared';

import { buildBoard, type MatchBoard } from './match-board';
import type { MatchModeScreenProps, MatchPhase, MatchTileView, TileTone } from './match-mode-screen';

export interface MatchModeDeps {
  cards: CardRepository;
  sessions: SessionRepository;
  attempts: AttemptRepository;
  srs: SrsStateRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface MatchModeController {
  phase: MatchPhase;
  left: readonly MatchTileView[];
  right: readonly MatchTileView[];
  done: number;
  total: number;
  onTap: MatchModeScreenProps['onTap'];
}

const EMPTY_BOARD: MatchBoard = { left: [], right: [], pairCount: 0 };

export function useMatchMode(deckId: string, deps: MatchModeDeps | null): MatchModeController {
  const [board, setBoard] = useState<MatchBoard>(EMPTY_BOARD);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<{ side: 'L' | 'R'; cardId: string } | null>(null);
  const [wrong, setWrong] = useState<{ side: 'L' | 'R'; cardId: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.cards.listByDeck(deckId).then(async (res) => {
      if (!alive || isErr(res)) return;
      const b = buildBoard(res.value);
      setBoard(b);
      if (b.pairCount === 0) {
        setEmpty(true);
        return;
      }
      const session = await startSession({ sessions: deps.sessions, ids: deps.ids, clock: deps.clock }).execute({
        deckId,
        mode: 'match',
        cardIds: res.value.map((c) => c.id),
      });
      if (alive && !isErr(session)) setSessionId(session.value.id);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const total = board.pairCount;
  const done = matched.size;
  const phase: MatchPhase = empty || (total > 0 && done >= total) ? 'complete' : 'playing';

  const record = (cardId: string) => {
    if (!deps || sessionId === null) return;
    void recordAnswer({ attempts: deps.attempts, srs: deps.srs, ids: deps.ids, clock: deps.clock }).execute({
      sessionId,
      cardId,
      stage: 'match',
      grade: 'good',
    });
  };

  const onTap: MatchModeController['onTap'] = (side, cardId) => {
    if (matched.has(cardId)) return;
    setWrong(null);

    if (!selected) {
      setSelected({ side, cardId });
      return;
    }
    if (selected.side === side) {
      // Re-pick on the same side.
      setSelected({ side, cardId });
      return;
    }
    // Two different sides selected → resolve.
    if (selected.cardId === cardId) {
      const next = new Set(matched);
      next.add(cardId);
      setMatched(next);
      setSelected(null);
      record(cardId);
      if (next.size >= total && deps && sessionId) {
        void finalizeSessionUseCase({ sessions: deps.sessions, clock: deps.clock }).execute(sessionId);
      }
    } else {
      setWrong({ side, cardId });
      setSelected(null);
    }
  };

  const toneOf = (side: 'L' | 'R', cardId: string): TileTone => {
    if (matched.has(cardId)) return 'matched';
    if (selected && selected.side === side && selected.cardId === cardId) return 'selected';
    if (wrong && wrong.side === side && wrong.cardId === cardId) return 'wrong';
    return 'neutral';
  };

  const withTones = (tiles: MatchBoard['left'], side: 'L' | 'R'): MatchTileView[] =>
    tiles.map((tile) => ({ ...tile, tone: toneOf(side, tile.cardId) }));

  return {
    phase,
    left: withTones(board.left, 'L'),
    right: withTones(board.right, 'R'),
    done,
    total,
    onTap,
  };
}
