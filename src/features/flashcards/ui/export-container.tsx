/**
 * Export container (WBS 9.2) — resolves the repositories and target deck (an
 * explicit `deckId` or the library's first deck), builds the payload via the
 * domain exportDeck use case (SRS looked up per card), and delivers it:
 * csv/xlsx → a file in the app cache via expo-file-system, shared/saved via
 * expo-sharing (DEP-FILE-SHARING, Approved); copy → the clipboard (web) or the
 * system share sheet (native). Web save falls back to an anchor download.
 */

import { useEffect, useState } from 'react';
import { Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { isErr } from '@/shared';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { exportDeck, type ExportFormat, type ExportPayload } from '../domain';
import { ExportScreen } from './export-screen';
import { useExport, type ExportDeps } from './use-export';

function fileName(deckTitle: string, format: ExportFormat): string {
  const stem = deckTitle.replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-+|-+$/g, '') || 'memox-cards';
  // Excel opens separated text; the .xls extension routes it there without a
  // spreadsheet library. CSV keeps .csv.
  return `${stem}.${format === 'xlsx' ? 'xls' : 'csv'}`;
}

function webDownload(payload: ExportPayload): string {
  const blob = new Blob([payload.text], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
}

async function deliverPayload(payload: ExportPayload, format: ExportFormat, deckTitle: string): Promise<string | null> {
  if (format === 'copy') {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(payload.text);
    } else {
      await Share.share({ message: payload.text });
    }
    return null;
  }
  if (Platform.OS === 'web') {
    return webDownload(payload);
  }
  const file = new File(Paths.cache, fileName(deckTitle, format));
  file.write(payload.text);
  return file.uri;
}

async function shareUri(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.open(uri, '_blank');
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

async function saveUri(uri: string, deckTitle: string, format: ExportFormat): Promise<void> {
  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = uri;
    a.download = fileName(deckTitle, format);
    a.click();
    return;
  }
  // Native: the share sheet IS the save affordance (Files / Drive targets).
  await shareUri(uri);
}

interface Wiring {
  deps: ExportDeps;
}

export interface ExportContainerProps {
  /** Source deck; defaults to the library's first deck. */
  deckId?: string;
  onBack?: () => void;
}

export function ExportContainer({ deckId, onBack }: ExportContainerProps) {
  const [wiring, setWiring] = useState<Wiring | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      async ([lib, flash, session]) => {
        let target = deckId ?? null;
        let deckTitle = 'memox-cards';
        if (target === null) {
          const decks = await lib.decks.list();
          if (!isErr(decks) && decks.value.length > 0) target = decks.value[0].id;
        }
        if (target !== null) {
          const deck = await lib.decks.getById(target);
          if (!isErr(deck)) deckTitle = deck.value.title;
        }
        const resolved = target ?? '';
        const build = exportDeck({
          cards: flash.cards,
          srsFor: async (cardId) => {
            const r = await session.srs.getById(cardId);
            if (isErr(r)) return null;
            return { box: Math.max(1, Math.min(8, r.value.reps + 1)), dueAt: r.value.dueAt };
          },
        });
        let lastFormat: ExportFormat = 'csv';
        if (!alive) return;
        setWiring({
          deps: {
            build: (config, onProgress) => {
              lastFormat = config.format;
              return build.execute({
                deckId: resolved,
                scope: config.scope,
                separator: config.separator,
                includeSrs: config.includeSrs,
                onProgress,
              });
            },
            deliver: (payload, format) => deliverPayload(payload, format, deckTitle),
            share: shareUri,
            save: (uri) => saveUri(uri, deckTitle, lastFormat),
          },
        });
      },
    );
    return () => {
      alive = false;
    };
  }, [deckId]);

  const ctrl = useExport(wiring?.deps ?? null);

  return (
    <ExportScreen
      ui={ctrl.ui}
      data={ctrl.data}
      onBack={onBack}
      onPickScope={ctrl.pickScope}
      onPickFormat={ctrl.pickFormat}
      onPickSeparator={ctrl.pickSeparator}
      onToggleSrs={ctrl.toggleSrs}
      onExport={ctrl.runExport}
      onRetry={ctrl.retry}
      onShare={ctrl.share}
      onSave={ctrl.save}
    />
  );
}
