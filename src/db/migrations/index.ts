/**
 * Migration registry (WBS 0.5) — the ordered, forward-only list applied at startup.
 *
 * Each persistence slice APPENDS its migration here as it lands (3.2 decks/subdecks/
 * languages, 4.2 cards, 5.2 sessions/attempts/srs), keeping versions contiguous.
 * The list starts empty: the framework + client are proven by WBS 0.5; the tables
 * arrive with their owning slices (ADR 0005).
 */

import type { Migration } from './types';
import { content001 } from './001-content';
import { flashcards002 } from './002-flashcards';

export const migrations: readonly Migration[] = [content001, flashcards002];

export * from './types';
export * from './runner';
export { content001 } from './001-content';
export { flashcards002 } from './002-flashcards';
