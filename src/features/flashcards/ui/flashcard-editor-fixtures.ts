/**
 * Flashcard-editor slice (WBS 4.4) — view model + state-matrix fixtures. Mirrors
 * the kit's `_features/flashcard-editor/FlashcardEditor.jsx` VERBATIM: the
 * deck-driven language labels (Beginner Grammar · 한국어 → English · Tiếng Việt),
 * the filled card (안녕하세요 · Hello (formal) · #TOPIK_I #인사) and the example
 * pair. 9 states (contract §6).
 */

/** Deck-driven language context — labels are NEVER hard-coded in the form. */
export interface EditorDeckContext {
  readonly name: string;
  readonly termLabel: string;
  readonly termLang: string;
  readonly meaningLabel: string;
  readonly meaningLang: string;
  readonly altLabel: string;
  readonly altLang: string;
}

/** Kit DECK, verbatim. */
export const EDITOR_DECK: EditorDeckContext = {
  name: 'Beginner Grammar',
  termLabel: '한국어',
  termLang: 'ko',
  meaningLabel: 'English',
  meaningLang: 'en',
  altLabel: 'Tiếng Việt',
  altLang: 'vi',
};

/** The editable form values. */
export interface EditorValues {
  readonly term: string;
  readonly meaning: string;
  readonly translation: string;
  readonly example: string;
  readonly exampleTranslation: string;
  readonly tags: readonly string[];
  readonly hidden: boolean;
}

export const BLANK_VALUES: EditorValues = {
  term: '',
  meaning: '',
  translation: '',
  example: '',
  exampleTranslation: '',
  tags: [],
  hidden: false,
};

/** Kit filled card, verbatim. */
export const FILLED_VALUES: EditorValues = {
  term: '안녕하세요',
  meaning: 'Hello (formal)',
  translation: 'Xin chào',
  example: '오늘 날씨가 좋네요.',
  exampleTranslation: 'The weather is nice today.',
  tags: ['#TOPIK_I', '#인사'],
  hidden: false,
};

export type FlashcardEditorUiState =
  | 'create'
  | 'edit'
  | 'validation'
  | 'duplicate'
  | 'additional-translation'
  | 'audio-generating'
  | 'submitting'
  | 'submit-error'
  | 'submit-success';

export interface FlashcardEditorFixture {
  readonly values: EditorValues;
  readonly ui: FlashcardEditorUiState;
  /** Edit mode (title "Edit card", More options pre-expanded, keep-adding ticked). */
  readonly editing: boolean;
}

/**
 * Fixtures keyed by canonical state name (contract §6 — 9 states). Kit title
 * logic: only `create` (and nothing else — not even validation) reads
 * "New card"; every other state is an edit-shaped form titled "Edit card".
 */
export const FLASHCARD_EDITOR_FIXTURES: Record<FlashcardEditorUiState, FlashcardEditorFixture> = {
  create: { values: BLANK_VALUES, ui: 'create', editing: false },
  edit: { values: FILLED_VALUES, ui: 'edit', editing: true },
  validation: { values: BLANK_VALUES, ui: 'validation', editing: true },
  duplicate: { values: FILLED_VALUES, ui: 'duplicate', editing: true },
  'additional-translation': { values: FILLED_VALUES, ui: 'additional-translation', editing: true },
  'audio-generating': { values: FILLED_VALUES, ui: 'audio-generating', editing: true },
  submitting: { values: FILLED_VALUES, ui: 'submitting', editing: true },
  'submit-error': { values: FILLED_VALUES, ui: 'submit-error', editing: true },
  'submit-success': { values: FILLED_VALUES, ui: 'submit-success', editing: true },
};

export type FlashcardEditorFixtureKey = keyof typeof FLASHCARD_EDITOR_FIXTURES;
