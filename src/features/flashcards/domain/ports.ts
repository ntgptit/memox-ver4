/**
 * Ports the flashcards domain depends on (WBS 4.1). Implemented by the data layer
 * (WBS 4.2) over `expo-sqlite`; the domain knows only these interfaces.
 */

import { ok, type Repository, type Observable, type Result } from '@/shared';
import type { Card } from './card';
import type { CardTranslation } from './card-translation';

/** Persistence + reactivity for cards, with the deck-scoped read duplicate-detection needs. */
export interface CardRepository extends Repository<Card>, Observable {
  /** All cards of a deck, for duplicate detection + list screens. */
  listByDeck(deckId: string): Promise<Result<Card[]>>;
  /** The deck's maintained card count (for library/deck headers). */
  countByDeck(deckId: string): Promise<Result<number>>;
  /** Card counts for MANY decks in one read (11.5: the library must not issue one count query per deck). */
  countByDecks(deckIds: readonly string[]): Promise<Result<ReadonlyMap<string, number>>>;
}

/** Persistence for a card's additional translations. */
export interface CardTranslationRepository extends Repository<CardTranslation>, Observable {
  listByCard(cardId: string): Promise<Result<CardTranslation[]>>;
}

/**
 * Study view of a card repository (12.11 B2): `listByDeck` drops HIDDEN cards so
 * every study surface (session, modes, player, mode-picker counts) skips them,
 * while the card-list screen keeps using the raw repo and still shows them.
 */
export function studyableCardRepo(cards: CardRepository): CardRepository {
  return {
    ...cards,
    subscribe: (onChange) => cards.subscribe(onChange),
    getById: (id) => cards.getById(id),
    list: () => cards.list(),
    save: (c) => cards.save(c),
    remove: (id) => cards.remove(id),
    countByDeck: (id) => cards.countByDeck(id),
    countByDecks: (ids) => cards.countByDecks(ids),
    async listByDeck(deckId) {
      const r = await cards.listByDeck(deckId);
      return r.ok ? ok(r.value.filter((c) => !c.hidden)) : r;
    },
  };
}
