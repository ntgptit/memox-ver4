/**
 * Import container (WBS 9.1) — resolves the repositories and target deck (an
 * explicit `deckId` or the library's first deck), reads picked files via
 * expo-document-picker (DEP-FILE-PICKER, Approved), and runs the compensated
 * bulk-import use case with live progress.
 */

import { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import { isErr } from '@/shared';
import { randomId, systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';

import { importCards } from '../domain';
import { IMPORT_DATA } from './import-fixtures';
import { ImportScreen } from './import-screen';
import { useImport, type ImportDeps } from './use-import';

const FILE_TYPES: Record<'csv' | 'excel', string[]> = {
  csv: ['text/csv', 'text/comma-separated-values', 'text/plain'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
};

async function pickFileText(source: 'csv' | 'excel'): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: FILE_TYPES[source],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  // Web hands back the File itself; native exposes a readable uri.
  if (asset.file !== undefined && asset.file !== null) return asset.file.text();
  const response = await fetch(asset.uri);
  return response.text();
}

interface Wiring {
  deckId: string | null;
  deps: ImportDeps;
}

export interface ImportContainerProps {
  /** Target deck; defaults to the library's first deck. */
  deckId?: string;
  onBack?: () => void;
  /** After a finished import ("Back to deck"). */
  onGoDeck?: (deckId: string | null) => void;
}

export function ImportContainer({ deckId, onBack, onGoDeck }: ImportContainerProps) {
  const [wiring, setWiring] = useState<Wiring | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories()]).then(async ([lib, flash]) => {
      let target = deckId ?? null;
      let deckName = IMPORT_DATA.deckName;
      if (target === null) {
        const decks = await lib.decks.list();
        if (!isErr(decks) && decks.value.length > 0) target = decks.value[0].id;
      }
      if (target !== null) {
        const deck = await lib.decks.getById(target);
        if (!isErr(deck)) deckName = deck.value.title;
      }
      const resolved = target;
      const bulk = importCards({ cards: flash.cards, ids: randomId, clock: systemClock });
      if (!alive) return;
      setWiring({
        deckId: resolved,
        deps: {
          pickFile: pickFileText,
          listExisting: async () => {
            if (resolved === null) return [];
            const r = await flash.cards.listByDeck(resolved);
            return isErr(r) ? [] : r.value;
          },
          importRows: (rows, onProgress) =>
            bulk.execute({ deckId: resolved ?? '', subdeckId: null, rows, onProgress }),
          deckName,
        },
      });
    });
    return () => {
      alive = false;
    };
  }, [deckId]);

  const ctrl = useImport(wiring?.deps ?? null);

  return (
    <ImportScreen
      ui={ctrl.ui}
      data={ctrl.data}
      onBack={onBack}
      onPickSource={ctrl.pickSource}
      onChangePasted={ctrl.changePasted}
      onPickSeparator={ctrl.pickSeparator}
      onSwapMapping={ctrl.swapMapping}
      onContinue={ctrl.continueToPreview}
      onImport={ctrl.runImport}
      onRetry={ctrl.retry}
      onGoDeck={() => onGoDeck?.(wiring?.deckId ?? null)}
    />
  );
}
