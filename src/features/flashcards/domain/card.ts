/**
 * Card entity (WBS 4.1).
 *
 * A flashcard belonging to a deck (optionally a subdeck). Models term/meaning/tags/
 * audio-ref (ADR 0005 `card`). Pure domain — validating factories return a typed
 * {@link ValidationError} instead of throwing (WBS 0.6). Immutable: edits return a
 * new Card.
 */

import { ok, err, validationError, type Result, type FieldIssue } from '@/shared';

export interface Card {
  readonly id: string;
  readonly deckId: string;
  readonly subdeckId: string | null;
  readonly term: string;
  readonly meaning: string;
  readonly tags: readonly string[];
  readonly audioRef: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

const MAX_TERM = 200;
const MAX_MEANING = 500;

/** Trim, drop empties, and de-duplicate tags (case-insensitive), preserving order. */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim();
    if (tag.length === 0) {
      continue;
    }
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(tag);
    }
  }
  return out;
}

/** The mutable fields of a card (create + edit share this validation). */
export interface CardFields {
  term: string;
  meaning: string;
  tags: readonly string[];
  audioRef: string | null;
}

function validateFields(fields: CardFields): Result<{ term: string; meaning: string; tags: string[] }> {
  const term = fields.term.trim();
  const meaning = fields.meaning.trim();
  const issues: FieldIssue[] = [];

  if (term.length === 0) {
    issues.push({ field: 'term', message: 'Enter the word or phrase.' });
  } else if (term.length > MAX_TERM) {
    issues.push({ field: 'term', message: `Keep the term under ${MAX_TERM} characters.` });
  }
  if (meaning.length === 0) {
    issues.push({ field: 'meaning', message: 'Enter the meaning.' });
  } else if (meaning.length > MAX_MEANING) {
    issues.push({ field: 'meaning', message: `Keep the meaning under ${MAX_MEANING} characters.` });
  }

  if (issues.length > 0) {
    return err(validationError(issues));
  }
  return ok({ term, meaning, tags: normalizeTags(fields.tags) });
}

export interface MakeCardInput extends CardFields {
  id: string;
  deckId: string;
  subdeckId: string | null;
  createdAt: number;
}

/** Validate + construct a Card. `updatedAt` starts at `createdAt`. */
export function makeCard(input: MakeCardInput): Result<Card> {
  if (input.deckId.length === 0) {
    return err(validationError([{ field: 'deckId', message: 'A card must belong to a deck.' }]));
  }
  const fields = validateFields(input);
  if (!fields.ok) {
    return fields;
  }
  return ok({
    id: input.id,
    deckId: input.deckId,
    subdeckId: input.subdeckId,
    term: fields.value.term,
    meaning: fields.value.meaning,
    tags: fields.value.tags,
    audioRef: input.audioRef,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  });
}

/** Apply an edit to a card, re-validating and bumping `updatedAt`. Returns a new Card. */
export function editCard(card: Card, fields: CardFields, updatedAt: number): Result<Card> {
  const validated = validateFields(fields);
  if (!validated.ok) {
    return validated;
  }
  return ok({
    ...card,
    term: validated.value.term,
    meaning: validated.value.meaning,
    tags: validated.value.tags,
    audioRef: fields.audioRef,
    updatedAt,
  });
}
