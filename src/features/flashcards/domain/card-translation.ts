/**
 * CardTranslation entity (WBS 4.1) — an additional meaning/translation for a card
 * (ADR 0005 `card_translation`). Pure domain; validating factory.
 */

import { ok, err, validationError, type Result } from '@/shared';

export interface CardTranslation {
  readonly id: string;
  readonly cardId: string;
  readonly text: string;
  readonly position: number;
}

export interface MakeCardTranslationInput {
  id: string;
  cardId: string;
  text: string;
  position: number;
}

/** Validate + construct a CardTranslation. Text is required; belongs to a card. */
export function makeCardTranslation(input: MakeCardTranslationInput): Result<CardTranslation> {
  const text = input.text.trim();
  if (text.length === 0) {
    return err(validationError([{ field: 'text', message: 'Enter a translation.' }]));
  }
  if (input.cardId.length === 0) {
    return err(validationError([{ field: 'cardId', message: 'A translation must belong to a card.' }]));
  }
  return ok({ id: input.id, cardId: input.cardId, text, position: input.position });
}
