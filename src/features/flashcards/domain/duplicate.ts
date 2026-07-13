/**
 * Duplicate detection (WBS 4.1).
 *
 * A card duplicates another when their terms match after normalization (trim,
 * lowercase, collapse inner whitespace) within the SAME deck. Pure — the create use
 * case runs this over the deck's existing cards and the editor uses it to warn.
 */

import type { Card } from './card';

/** Normalize a term for comparison: trim, lowercase, collapse internal whitespace. */
export function normalizeTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Find the first card in `existing` whose term matches `term` after normalization,
 * ignoring `exceptId` (so editing a card doesn't flag itself). Returns null if none.
 */
export function findDuplicate(
  term: string,
  existing: readonly Card[],
  exceptId?: string,
): Card | null {
  const target = normalizeTerm(term);
  for (const card of existing) {
    if (card.id !== exceptId && normalizeTerm(card.term) === target) {
      return card;
    }
  }
  return null;
}
