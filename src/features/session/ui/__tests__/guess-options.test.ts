/**
 * Guess-mode option builder (WBS 6.3) — deterministic correct + distractor placement.
 */

import type { Card } from '@/features/flashcards/domain';
import { buildOptions } from '../guess-options';

function card(id: string, meaning: string): Card {
  return { id, deckId: 'd', subdeckId: null, term: id, meaning, tags: [], audioRef: null, createdAt: 0, updatedAt: 0 };
}

const CARDS = ['a', 'b', 'c', 'd', 'e', 'f'].map((m) => card(m, m));

describe('buildOptions', () => {
  it('includes the correct meaning + up to four distractors (5 total)', () => {
    const { options, correctIndex } = buildOptions(CARDS, 0);
    expect(options).toHaveLength(5);
    expect(options[correctIndex]).toBe('a');
    // distractors come from the other cards
    expect(options.filter((o) => o !== 'a')).toEqual(['b', 'c', 'd', 'e']);
  });

  it('places the correct answer at a deterministic per-card index', () => {
    expect(buildOptions(CARDS, 0).correctIndex).toBe(0);
    expect(buildOptions(CARDS, 1).correctIndex).toBe(1);
    expect(buildOptions(CARDS, 2).correctIndex).toBe(2);
    // index 5 % 5 == 0
    expect(buildOptions(CARDS, 5).correctIndex).toBe(0);
    expect(buildOptions(CARDS, 5).options[0]).toBe('f');
  });

  it('handles a single card (just the correct option)', () => {
    const { options, correctIndex } = buildOptions([card('x', 'x')], 0);
    expect(options).toEqual(['x']);
    expect(correctIndex).toBe(0);
  });

  it('returns empty for an out-of-range index', () => {
    expect(buildOptions(CARDS, 99)).toEqual({ options: [], correctIndex: 0 });
  });
});
