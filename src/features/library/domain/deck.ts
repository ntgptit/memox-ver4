/**
 * Deck entity (WBS 3.1).
 *
 * A top-level deck belonging to a language pair. `organisation` decides whether the
 * deck holds subdecks or cards directly (deck-vs-cards choice — `deck-content-choice`
 * screen). Pure domain; `makeDeck`/`renameDeck` validate and never throw (WBS 0.6).
 */

import { ok, err, validationError, type Result } from '@/shared';

/** How a deck holds its content: nested subdecks, or cards directly. */
export type DeckOrganisation = 'subdecks' | 'cards';

export interface Deck {
  readonly id: string;
  readonly title: string;
  readonly languagePairId: string;
  readonly organisation: DeckOrganisation;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface MakeDeckInput {
  id: string;
  title: string;
  languagePairId: string;
  organisation: DeckOrganisation;
  createdAt: number;
}

const MAX_TITLE = 80;

function validateTitle(raw: string): Result<string> {
  const title = raw.trim();
  if (title.length === 0) {
    return err(validationError([{ field: 'title', message: 'Give the deck a name.' }]));
  }
  if (title.length > MAX_TITLE) {
    return err(validationError([{ field: 'title', message: `Keep the name under ${MAX_TITLE} characters.` }]));
  }
  return ok(title);
}

/** Validate + construct a Deck. Title is required; `updatedAt` starts at `createdAt`. */
export function makeDeck(input: MakeDeckInput): Result<Deck> {
  const title = validateTitle(input.title);
  if (!title.ok) {
    return title;
  }
  if (input.languagePairId.length === 0) {
    return err(validationError([{ field: 'languagePairId', message: 'Pick a language pair.' }]));
  }
  return ok({
    id: input.id,
    title: title.value,
    languagePairId: input.languagePairId,
    organisation: input.organisation,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  });
}

/** Rename a deck, bumping `updatedAt`. Returns a new Deck (immutable). */
export function renameDeck(deck: Deck, rawTitle: string, updatedAt: number): Result<Deck> {
  const title = validateTitle(rawTitle);
  if (!title.ok) {
    return title;
  }
  return ok({ ...deck, title: title.value, updatedAt });
}
