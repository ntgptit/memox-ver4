/**
 * Match board builder (WBS 6.2) — meanings left, terms right (reordered), paired by id.
 */

import type { Card } from '@/features/flashcards/domain';
import { buildBoard, BOARD_SIZE } from '../match-board';

function card(id: string, term: string, meaning: string): Card {
  return { id, deckId: 'd', subdeckId: null, term, meaning, tags: [], audioRef: null, createdAt: 0, updatedAt: 0 };
}

const CARDS = [
  card('c1', '시간', 'time'),
  card('c2', '사랑', 'love'),
  card('c3', '친구', 'friend'),
];

describe('buildBoard', () => {
  it('puts meanings on the left in order', () => {
    const { left } = buildBoard(CARDS);
    expect(left.map((t) => t.text)).toEqual(['time', 'love', 'friend']);
    expect(left.map((t) => t.cardId)).toEqual(['c1', 'c2', 'c3']);
    expect(left[0].key).toBe('L-c1');
  });

  it('puts terms on the right, reordered so pairs never align', () => {
    const { right } = buildBoard(CARDS);
    expect(right.map((t) => t.text)).toEqual(['친구', '사랑', '시간']);
    expect(right[0].key).toBe('R-c3');
  });

  it('reports the pair count and caps at the board size', () => {
    expect(buildBoard(CARDS).pairCount).toBe(3);
    const many = Array.from({ length: 9 }, (_, i) => card(`c${i}`, `t${i}`, `m${i}`));
    expect(buildBoard(many).pairCount).toBe(BOARD_SIZE);
  });
});
