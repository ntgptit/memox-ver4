/**
 * Library UI (WBS 3.6+) — deck-organisation screens. Currently the deck-content-choice
 * slice (prop-driven screen + controller + container + preview fixtures).
 */

export { DeckContentChoiceScreen, type DeckContentChoiceScreenProps } from './deck-content-choice-screen';
export { DeckContentChoiceContainer } from './deck-content-choice-container';
export { useDeckContentChoice, type DeckContentChoiceDeps, type DeckContentChoiceController } from './use-deck-content-choice';
export {
  DECK_CONTENT_CHOICE_FIXTURES,
  type DeckContentChoiceFixtureKey,
} from './deck-content-choice-fixtures';
