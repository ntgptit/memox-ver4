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

export { FlashcardEditorScreen, type FlashcardEditorScreenProps, type FieldErrors } from './flashcard-editor-screen';
export { FlashcardEditorContainer, type FlashcardEditorContainerProps } from './flashcard-editor-container';
export {
  useFlashcardEditor,
  type FlashcardEditorDeps,
  type FlashcardEditorController,
  type EditorPhase,
} from './use-flashcard-editor';
export {
  EDITOR_DECK,
  BLANK_VALUES,
  FILLED_VALUES,
  FLASHCARD_EDITOR_FIXTURES,
  type EditorDeckContext,
  type EditorValues,
  type FlashcardEditorFixture,
  type FlashcardEditorFixtureKey,
  type FlashcardEditorUiState,
} from './flashcard-editor-fixtures';
export {
  Field,
  AudioRow,
  DupBanner,
  Banner,
  TagsField,
  VisibilityRow,
  KeepAdding,
  SaveBar,
  DeckContext,
} from './flashcard-editor-components';
