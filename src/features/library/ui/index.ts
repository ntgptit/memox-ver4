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

export {
  DeckSettingsScreen,
  type DeckSettingsScreenProps,
  type DeckSettingsOverlay,
  type LanguagePairOption,
} from './deck-settings-screen';
export { DeckSettingsContainer } from './deck-settings-container';
export { useDeckSettings, type DeckSettingsDeps, type DeckSettingsController } from './use-deck-settings';
export {
  DECK_SETTINGS_FIXTURE,
  DECK_SETTINGS_PAIRS,
  DECK_SETTINGS_OVERLAYS,
  type DeckSettingsFixtureKey,
} from './deck-settings-fixtures';
