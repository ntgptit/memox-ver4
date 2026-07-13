/**
 * Flashcard use cases (WBS 4.1): create (with duplicate detection), edit, delete,
 * add-translation. Pure orchestration over the repository ports; each returns a
 * {@link Result}. Factory functions inject ports + services for testability.
 */

import { err, isErr, conflictError, type UseCase, type IdGenerator, type Clock } from '@/shared';
import { makeCard, editCard, type Card, type CardFields } from './card';
import { findDuplicate } from './duplicate';
import { makeCardTranslation, type CardTranslation } from './card-translation';
import type { CardRepository, CardTranslationRepository } from './ports';

export interface FlashcardDeps {
  cards: CardRepository;
  translations: CardTranslationRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface CreateCardInput extends CardFields {
  deckId: string;
  subdeckId: string | null;
}

/**
 * Create a card, rejecting a duplicate term within the same deck (conflict). Builds +
 * validates first, then checks the deck's existing cards, then persists.
 */
export function createCard(deps: Pick<FlashcardDeps, 'cards' | 'ids' | 'clock'>): UseCase<CreateCardInput, Card> {
  return {
    async execute(input) {
      const built = makeCard({
        id: deps.ids(),
        deckId: input.deckId,
        subdeckId: input.subdeckId,
        term: input.term,
        meaning: input.meaning,
        tags: input.tags,
        audioRef: input.audioRef,
        createdAt: deps.clock(),
      });
      if (isErr(built)) {
        return built;
      }
      const existing = await deps.cards.listByDeck(input.deckId);
      if (isErr(existing)) {
        return existing;
      }
      if (findDuplicate(built.value.term, existing.value) !== null) {
        return err(conflictError('A card with this term already exists in the deck.'));
      }
      return deps.cards.save(built.value);
    },
  };
}

export interface EditCardInput extends CardFields {
  cardId: string;
}

/** Edit a card, re-validating and rejecting a term that now duplicates another card. */
export function editCardUseCase(deps: Pick<FlashcardDeps, 'cards' | 'clock'>): UseCase<EditCardInput, Card> {
  return {
    async execute(input) {
      const found = await deps.cards.getById(input.cardId);
      if (isErr(found)) {
        return found;
      }
      const edited = editCard(found.value, input, deps.clock());
      if (isErr(edited)) {
        return edited;
      }
      const existing = await deps.cards.listByDeck(found.value.deckId);
      if (isErr(existing)) {
        return existing;
      }
      if (findDuplicate(edited.value.term, existing.value, found.value.id) !== null) {
        return err(conflictError('Another card in the deck already uses this term.'));
      }
      return deps.cards.save(edited.value);
    },
  };
}

export function deleteCard(deps: Pick<FlashcardDeps, 'cards'>): UseCase<string, void> {
  return {
    execute(cardId) {
      return deps.cards.remove(cardId);
    },
  };
}

export interface AddTranslationInput {
  cardId: string;
  text: string;
  position: number;
}

/** Add an additional translation to an existing card. */
export function addTranslation(
  deps: Pick<FlashcardDeps, 'cards' | 'translations' | 'ids'>,
): UseCase<AddTranslationInput, CardTranslation> {
  return {
    async execute(input) {
      const card = await deps.cards.getById(input.cardId);
      if (isErr(card)) {
        return card;
      }
      const built = makeCardTranslation({
        id: deps.ids(),
        cardId: input.cardId,
        text: input.text,
        position: input.position,
      });
      return built.ok ? deps.translations.save(built.value) : built;
    },
  };
}
