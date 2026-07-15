/**
 * Row ↔ entity mappers for flashcards (WBS 4.2). Pure. `tags` is a JSON array text
 * in the DB; here we (de)serialize it. Malformed tags degrade to `[]` rather than
 * throwing (a corrupt row must not crash a read).
 */

import type { Card, CardTranslation } from '@/features/flashcards/domain';

export interface CardRow {
  id: string;
  deck_id: string;
  subdeck_id: string | null;
  term: string;
  meaning: string;
  tags: string;
  audio_ref: string | null;
  hidden: number;
  created_at: number;
  updated_at: number;
}

export interface CardTranslationRow {
  id: string;
  card_id: string;
  text: string;
  position: number;
}

function parseTags(json: string): string[] {
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags: readonly string[]): string {
  return JSON.stringify(tags);
}

export function rowToCard(row: CardRow): Card {
  return {
    id: row.id,
    deckId: row.deck_id,
    subdeckId: row.subdeck_id,
    term: row.term,
    meaning: row.meaning,
    tags: parseTags(row.tags),
    audioRef: row.audio_ref,
    hidden: row.hidden === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToCardTranslation(row: CardTranslationRow): CardTranslation {
  return { id: row.id, cardId: row.card_id, text: row.text, position: row.position };
}
