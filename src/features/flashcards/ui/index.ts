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
export { ImportScreen, type ImportScreenProps } from './import-screen';
export { ImportContainer, type ImportContainerProps } from './import-container';
export { useImport, type ImportDeps, type ImportController } from './use-import';
export { SourceCard, Table } from './import-components';
export {
  IMPORT_SOURCES,
  IMPORT_SEPS,
  IMPORT_TABLE_ROWS,
  IMPORT_PASTE_PLACEHOLDER,
  IMPORT_DATA,
  IMPORT_FIXTURES,
  type ImportSource,
  type ImportData,
  type ImportFixture,
  type ImportFixtureKey,
  type ImportUiState,
} from './import-fixtures';
export { ExportScreen, type ExportScreenProps } from './export-screen';
export { ExportContainer, type ExportContainerProps } from './export-container';
export { useExport, type ExportDeps, type ExportConfig, type ExportController } from './use-export';
export { ExportingCard, FormatList } from './export-components';
export {
  EXPORT_FORMATS,
  EXPORT_SEPS,
  EXPORT_DATA,
  EXPORT_FIXTURES,
  type ExportFormatOption,
  type ExportData,
  type ExportFixture,
  type ExportFixtureKey,
  type ExportUiState,
} from './export-fixtures';
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
