/**
 * Guess-mode option builder (WBS 6.3). Pure + deterministic so the round is
 * reproducible in tests: the correct meaning plus up to four distractor meanings from
 * the other cards, with the correct answer placed at a stable index for the card.
 */

import type { Card } from '@/features/flashcards/domain';

export interface GuessOptions {
  options: readonly string[];
  correctIndex: number;
}

const MAX_DISTRACTORS = 4;

export function buildOptions(cards: readonly Card[], currentIndex: number): GuessOptions {
  const current = cards[currentIndex];
  if (!current) return { options: [], correctIndex: 0 };

  const distractors = cards
    .filter((_, i) => i !== currentIndex)
    .map((c) => c.meaning)
    .slice(0, MAX_DISTRACTORS);

  const pos = distractors.length === 0 ? 0 : currentIndex % (distractors.length + 1);
  const options = [...distractors];
  options.splice(pos, 0, current.meaning);
  return { options, correctIndex: pos };
}
