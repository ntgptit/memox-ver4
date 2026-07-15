/**
 * Export controller (WBS 9.2) — the config → exporting → done/export-error
 * state machine over injected deps: build the payload (domain exportDeck) and
 * deliver it (write a file / copy to clipboard). Pure hook; the container
 * wires the real repositories + expo-file-system/expo-sharing.
 */

import { useCallback, useState } from 'react';

import { isErr, type AppError, type Result } from '@/shared';
import type { ExportFormat, ExportPayload, ExportScope, ImportSeparator } from '../domain';

import { EXPORT_DATA, EXPORT_FORMATS, type ExportData, type ExportUiState } from './export-fixtures';

const SEPARATORS: readonly ImportSeparator[] = ['tab', 'comma', 'semicolon'];

export interface ExportConfig {
  scope: ExportScope;
  format: ExportFormat;
  separator: ImportSeparator;
  includeSrs: boolean;
}

export interface ExportDeps {
  /** Collect + serialize the scoped cards (domain exportDeck). */
  build: (
    config: ExportConfig,
    onProgress: (done: number, total: number) => void,
  ) => Promise<Result<ExportPayload, AppError>>;
  /** Persist/copy the payload; returns a shareable uri (null for clipboard). */
  deliver: (payload: ExportPayload, format: ExportFormat) => Promise<string | null>;
  /** Open the system share sheet for the written file. */
  share: (uri: string) => Promise<void>;
  /** Save/download the written file. */
  save: (uri: string) => Promise<void>;
}

export interface ExportController {
  ui: ExportUiState;
  data: ExportData;
  pickScope: (scope: ExportScope) => void;
  pickFormat: (index: number) => void;
  pickSeparator: (index: number) => void;
  toggleSrs: (include: boolean) => void;
  runExport: () => void;
  retry: () => void;
  share: () => void;
  save: () => void;
}

export function useExport(deps: ExportDeps | null): ExportController {
  const [ui, setUi] = useState<ExportUiState>('config');
  const [scope, setScope] = useState<ExportScope>('deck');
  const [formatIndex, setFormatIndex] = useState(0);
  const [sepIndex, setSepIndex] = useState(0);
  const [includeSrs, setIncludeSrs] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [count, setCount] = useState<number | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  const runExport = useCallback(() => {
    if (deps === null) return;
    const format = EXPORT_FORMATS[formatIndex].id;
    setProgress({ done: 0, total: 0 });
    setUi('exporting');
    void (async () => {
      try {
        const built = await deps.build(
          { scope, format, separator: SEPARATORS[sepIndex], includeSrs },
          (done, total) => setProgress({ done, total }),
        );
        if (isErr(built)) {
          setUi('export-error');
          return;
        }
        const written = await deps.deliver(built.value, format);
        setCount(built.value.count);
        setUri(written);
        setUi('done');
      } catch {
        setUi('export-error');
      }
    })();
  }, [deps, scope, formatIndex, sepIndex, includeSrs]);

  const data: ExportData = {
    scope,
    formatIndex,
    sepIndex,
    includeSrs,
    total: count ?? EXPORT_DATA.total,
    progressPct:
      progress.total === 0 ? EXPORT_DATA.progressPct : Math.round((progress.done / progress.total) * 100),
  };

  return {
    ui,
    data,
    pickScope: setScope,
    pickFormat: setFormatIndex,
    pickSeparator: setSepIndex,
    toggleSrs: setIncludeSrs,
    runExport,
    retry: runExport,
    share: () => {
      if (uri !== null) void deps?.share(uri);
    },
    save: () => {
      if (uri !== null) void deps?.save(uri);
    },
  };
}
