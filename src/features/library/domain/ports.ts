/**
 * Ports the library domain depends on (WBS 3.1). Implemented by the data layer
 * (WBS 3.2) over `expo-sqlite`; the domain knows only these interfaces.
 */

import type { Repository, Observable, Result } from '@/shared';
import type { Deck } from './deck';
import type { Subdeck } from './subdeck';

/** Persistence + reactivity for decks. */
export interface DeckRepository extends Repository<Deck>, Observable {}

/** Persistence + reactivity for subdecks, with the deck-scoped read the tree ops need. */
export interface SubdeckRepository extends Repository<Subdeck>, Observable {
  /** All subdecks of a deck (any depth), for move/orphan checks. */
  listByDeck(deckId: string): Promise<Result<Subdeck[]>>;
}
