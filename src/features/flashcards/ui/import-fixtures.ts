/**
 * Import fixtures (WBS 9.1) — IDENTICAL to the kit's `_features/import/Import.jsx`
 * constants (SOURCES / SEPS / ROWS + the 124-card counts); the parity gate diffs
 * the app against the kit shots, so any data drift here is itself a defect.
 */

export type ImportUiState =
  | 'source'
  | 'mapping'
  | 'preview'
  | 'dup-warning'
  | 'importing'
  | 'import-error'
  | 'done';

export interface ImportSource {
  icon: string;
  name: string;
  desc: string;
}

/** Kit SOURCES — the three ways in. */
export const IMPORT_SOURCES: readonly ImportSource[] = [
  { icon: 'description', name: 'CSV file', desc: 'Import from a .csv file' },
  { icon: 'table_chart', name: 'Excel', desc: 'Import from an .xlsx file' },
  { icon: 'content_paste', name: 'Paste text', desc: 'Copy from somewhere else' },
];

/** Kit SEPS — separator chips (Tab selected by default). */
export const IMPORT_SEPS = ['Tab', 'Comma', 'Semicolon'] as const;

/** Kit ROWS — header + 4 preview rows for the mapping/preview table. */
export const IMPORT_TABLE_ROWS: readonly (readonly [string, string])[] = [
  ['Term', 'Meaning'],
  ['안녕하세요', 'Hello'],
  ['감사합니다', 'Thank you'],
  ['사랑', 'love'],
  ['학교', 'school'],
];

export const IMPORT_PASTE_PLACEHOLDER = 'Paste your data here (one card per line: term[tab]meaning)…';

/** The data the screen renders; every count matches the kit shots. */
export interface ImportData {
  tableRows: readonly (readonly [string, string])[];
  sepIndex: number;
  /** Total cards parsed (preview CTA + done title). */
  total: number;
  /** Rows whose term already exists in the deck (dup-warning). */
  dups: number;
  /** Importing progress. */
  progressDone: number;
  progressPct: number;
  /** Target deck (done body copy). */
  deckName: string;
  /** import-error body copy. */
  errorText: string;
  /** Current paste-box contents (source state). */
  pasted: string;
}

export const IMPORT_DATA: ImportData = {
  tableRows: IMPORT_TABLE_ROWS,
  sepIndex: 0,
  total: 124,
  dups: 8,
  progressDone: 77,
  progressPct: 62,
  deckName: 'TOPIK I — Vocabulary',
  errorText: 'Couldn’t read the file at row 78. Check the format and try again.',
  pasted: '',
};

export interface ImportFixture {
  ui: ImportUiState;
  data: ImportData;
}

export const IMPORT_FIXTURES: Record<ImportUiState, ImportFixture> = {
  source: { ui: 'source', data: IMPORT_DATA },
  mapping: { ui: 'mapping', data: IMPORT_DATA },
  preview: { ui: 'preview', data: IMPORT_DATA },
  'dup-warning': { ui: 'dup-warning', data: IMPORT_DATA },
  importing: { ui: 'importing', data: IMPORT_DATA },
  'import-error': { ui: 'import-error', data: IMPORT_DATA },
  done: { ui: 'done', data: IMPORT_DATA },
};

export type ImportFixtureKey = ImportUiState;
