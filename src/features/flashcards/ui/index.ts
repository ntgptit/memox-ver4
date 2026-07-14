/**
 * Flashcards UI (WBS 4.3) — the flashcard-list screen slice: prop-driven
 * presentational component, controller, production container, and fixtures.
 */

export { FlashcardListScreen, type FlashcardListScreenProps } from './flashcard-list-screen';
export { FlashcardListContainer, type FlashcardListContainerProps } from './flashcard-list-container';
export { useFlashcardList, type FlashcardListDeps, type FlashcardListController } from './use-flashcard-list';
export {
  FLASHCARD_LIST_FIXTURES,
  FLASHCARDS,
  FLASHCARDS_MIN,
  FLASHCARDS_DENSE,
  FLASHCARDS_LONG,
  FLASHCARD_FILTERS,
  FLASHCARD_TRAIL,
  flashcardSummary,
  type FlashcardListFixtureKey,
  type FlashcardListUiState,
  type FlashcardListData,
  type FlashcardView,
  type FlashcardFilter,
} from './flashcard-list-fixtures';
