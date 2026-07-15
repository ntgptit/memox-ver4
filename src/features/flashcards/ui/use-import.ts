/**
 * Import controller (WBS 9.1) — the source → mapping → preview/dup-warning →
 * importing → done/import-error state machine over injected deps: file picking,
 * the deck's existing cards (dup count), and the bulk-import use case. Pure
 * hook; the container wires the real repositories + document picker.
 */

import { useCallback, useMemo, useState } from 'react';

import { isErr, toUserFacingError, type AppError, type Result } from '@/shared';
import {
  countDuplicateRows,
  parseImportRows,
  type Card,
  type ImportReport,
  type ImportRow,
  type ImportSeparator,
} from '../domain';

import { IMPORT_DATA, IMPORT_TABLE_ROWS, type ImportData, type ImportUiState } from './import-fixtures';

const SEPARATORS: readonly ImportSeparator[] = ['tab', 'comma', 'semicolon'];

export interface ImportDeps {
  /** Read the picked file's text; null = user cancelled the picker. */
  pickFile: (source: 'csv' | 'excel') => Promise<string | null>;
  /** The target deck's existing cards (duplicate warning). */
  listExisting: () => Promise<readonly Card[]>;
  /** Bulk-persist parsed rows with per-card progress. */
  importRows: (
    rows: readonly ImportRow[],
    onProgress: (done: number, total: number) => void,
  ) => Promise<Result<ImportReport, AppError>>;
  /** Target deck title (done copy). */
  deckName: string;
}

export interface ImportController {
  ui: ImportUiState;
  data: ImportData;
  pickSource: (index: number) => void;
  changePasted: (text: string) => void;
  pickSeparator: (index: number) => void;
  swapMapping: () => void;
  continueToPreview: () => void;
  runImport: () => void;
  retry: () => void;
}

export function useImport(deps: ImportDeps | null): ImportController {
  const [ui, setUi] = useState<ImportUiState>('source');
  const [pasted, setPasted] = useState('');
  const [rawText, setRawText] = useState('');
  const [sepIndex, setSepIndex] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const [rows, setRows] = useState<readonly ImportRow[]>([]);
  const [dups, setDups] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errorText, setErrorText] = useState(IMPORT_DATA.errorText);

  const parsed = useMemo(() => {
    const r = parseImportRows(rawText, SEPARATORS[sepIndex]);
    if (isErr(r)) return r;
    return swapped ? { ...r, value: r.value.map((row) => ({ term: row.meaning, meaning: row.term })) } : r;
  }, [rawText, sepIndex, swapped]);

  const pickSource = useCallback(
    (index: number) => {
      if (deps === null) return;
      if (index === 2) {
        // Paste text: use the paste-box contents.
        if (pasted.trim() === '') return;
        setRawText(pasted);
        setUi('mapping');
        return;
      }
      void deps
        .pickFile(index === 0 ? 'csv' : 'excel')
        .then((text) => {
          if (text === null) return; // cancelled
          setRawText(text);
          setUi('mapping');
        })
        .catch(() => {
          setErrorText('Couldn’t read the file. Check the format and try again.');
          setUi('import-error');
        });
    },
    [deps, pasted],
  );

  const continueToPreview = useCallback(() => {
    if (deps === null) return;
    if (isErr(parsed)) {
      setErrorText(parsed.error.message);
      setUi('import-error');
      return;
    }
    const next = parsed.value;
    setRows(next);
    void deps.listExisting().then((existing) => {
      const count = countDuplicateRows(next, existing);
      setDups(count);
      setUi(count > 0 ? 'dup-warning' : 'preview');
    });
  }, [deps, parsed]);

  const runImport = useCallback(() => {
    if (deps === null || rows.length === 0) return;
    setProgress({ done: 0, total: rows.length });
    setUi('importing');
    void deps
      .importRows(rows, (done, total) => setProgress({ done, total }))
      .then((r) => {
        if (isErr(r)) {
          setErrorText(toUserFacingError(r.error).message);
          setUi('import-error');
          return;
        }
        setUi('done');
      });
  }, [deps, rows]);

  const retry = useCallback(() => {
    if (rows.length > 0) {
      runImport();
    } else {
      setUi('source');
    }
  }, [rows.length, runImport]);

  // Mapping/preview table: kit header + the first 4 parsed rows (fixture rows
  // until something real is parsed).
  const tableRows = useMemo(() => {
    if (isErr(parsed) || parsed.value.length === 0) return IMPORT_TABLE_ROWS;
    return [
      ['Term', 'Meaning'] as const,
      ...parsed.value.slice(0, 4).map((r) => [r.term, r.meaning] as const),
    ];
  }, [parsed]);

  const total = isErr(parsed) || parsed.value.length === 0 ? IMPORT_DATA.total : parsed.value.length;

  const data: ImportData = {
    tableRows,
    sepIndex,
    total: ui === 'importing' || ui === 'done' ? (progress.total > 0 ? progress.total : total) : total,
    dups,
    progressDone: progress.done,
    progressPct: progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100),
    deckName: deps?.deckName ?? IMPORT_DATA.deckName,
    errorText,
    pasted,
  };

  return {
    ui,
    data,
    pickSource,
    changePasted: setPasted,
    pickSeparator: setSepIndex,
    swapMapping: () => setSwapped((s) => !s),
    continueToPreview,
    runImport,
    retry,
  };
}
