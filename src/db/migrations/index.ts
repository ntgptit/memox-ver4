/**
 * Migration registry (WBS 0.5) — the ordered, forward-only list applied at startup.
 *
 * Each persistence slice APPENDS its migration here as it lands (3.2 decks/subdecks/
 * languages, 4.2 cards, 5.2 sessions/attempts/srs), keeping versions contiguous.
 * The list starts empty: the framework + client are proven by WBS 0.5; the tables
 * arrive with their owning slices (ADR 0005).
 */

import type { Migration } from './types';

export const migrations: readonly Migration[] = [];

export * from './types';
export * from './runner';
