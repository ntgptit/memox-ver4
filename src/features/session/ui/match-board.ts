/**
 * Match-mode board builder (WBS 6.2). Pure + deterministic: take the first cards of the
 * deck (a board), put their meanings in the left column and their terms in the right,
 * ordered differently so a matching pair is never on the same row. One card owns one
 * left tile (meaning) and one right tile (term); they match when their `cardId` agrees.
 */

import type { Card } from '@/features/flashcards/domain';

export const BOARD_SIZE = 5;

export interface MatchTile {
  /** Unique per side, e.g. `L-<cardId>` / `R-<cardId>`. */
  readonly key: string;
  readonly cardId: string;
  readonly text: string;
}

export interface MatchBoard {
  readonly left: readonly MatchTile[];
  readonly right: readonly MatchTile[];
  readonly pairCount: number;
}

export function buildBoard(cards: readonly Card[], size: number = BOARD_SIZE): MatchBoard {
  const board = cards.slice(0, size);
  const left: MatchTile[] = board.map((c) => ({ key: `L-${c.id}`, cardId: c.id, text: c.meaning }));
  // Right column ordered differently (reversed) so pairs never align row-for-row.
  const right: MatchTile[] = [...board]
    .reverse()
    .map((c) => ({ key: `R-${c.id}`, cardId: c.id, text: c.term }));
  return { left, right, pairCount: board.length };
}
