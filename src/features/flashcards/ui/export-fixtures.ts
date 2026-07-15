/**
 * Export fixtures (WBS 9.2) — IDENTICAL to the kit's `_features/export/Export.jsx`
 * + `components/FormatList.jsx` constants (FORMATS / SEPS + the 320-card counts);
 * the parity gate diffs the app against the kit shots, so data drift here is
 * itself a defect.
 */

import type { ExportFormat, ExportScope } from '../domain';

export type ExportUiState = 'config' | 'exporting' | 'export-error' | 'done';

export interface ExportFormatOption {
  icon: string;
  name: string;
  sub: string;
  id: ExportFormat;
}

/** Kit FORMATS — the export-format radio list (CSV selected by default). */
export const EXPORT_FORMATS: readonly ExportFormatOption[] = [
  { icon: 'description', name: 'CSV', sub: '.csv file', id: 'csv' },
  { icon: 'table_chart', name: 'Excel', sub: '.xlsx file', id: 'xlsx' },
  { icon: 'content_copy', name: 'Copy text', sub: 'To clipboard', id: 'copy' },
];

/** Kit SEPS — separator chips (Tab selected by default). */
export const EXPORT_SEPS = ['Tab', 'Comma', 'Semicolon'] as const;

export interface ExportData {
  scope: ExportScope;
  formatIndex: number;
  sepIndex: number;
  includeSrs: boolean;
  /** Cards exported (done title). */
  total: number;
  /** Exporting progress. */
  progressPct: number;
}

export const EXPORT_DATA: ExportData = {
  scope: 'deck',
  formatIndex: 0,
  sepIndex: 0,
  includeSrs: true,
  total: 320,
  progressPct: 70,
};

export interface ExportFixture {
  ui: ExportUiState;
  data: ExportData;
}

export const EXPORT_FIXTURES: Record<ExportUiState, ExportFixture> = {
  config: { ui: 'config', data: EXPORT_DATA },
  exporting: { ui: 'exporting', data: EXPORT_DATA },
  'export-error': { ui: 'export-error', data: EXPORT_DATA },
  done: { ui: 'done', data: EXPORT_DATA },
};

export type ExportFixtureKey = ExportUiState;
