/**
 * Row ↔ entity mappers (WBS 3.2). Pure translation between the snake_case SQL rows
 * and the camelCase domain entities (WBS 3.1). No SQL, no I/O — unit-testable.
 */

import type { Deck, DeckOrganisation, Subdeck } from '@/features/library/domain';
import type { LanguagePair } from '@/features/languages/domain';

export interface LanguagePairRow {
  id: string;
  learning: string;
  native: string;
  created_at: number;
}

export interface DeckRow {
  id: string;
  title: string;
  language_pair_id: string;
  organisation: string;
  created_at: number;
  updated_at: number;
}

export interface SubdeckRow {
  id: string;
  deck_id: string;
  parent_id: string | null;
  title: string;
  position: number;
}

export function rowToLanguagePair(row: LanguagePairRow): LanguagePair {
  return { id: row.id, learning: row.learning, native: row.native, createdAt: row.created_at };
}

export function rowToDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    title: row.title,
    languagePairId: row.language_pair_id,
    organisation: row.organisation as DeckOrganisation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToSubdeck(row: SubdeckRow): Subdeck {
  return {
    id: row.id,
    deckId: row.deck_id,
    parentId: row.parent_id,
    title: row.title,
    position: row.position,
  };
}
