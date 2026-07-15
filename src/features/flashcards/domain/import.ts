/**
 * Bulk import (WBS 9.1) — parse pasted/file text into card rows and persist them
 * as a compensated bulk insert. Pure orchestration over the card repository:
 * every row is validated BEFORE any write, progress ticks per saved card, and a
 * mid-batch save failure rolls back the cards already written (all-or-nothing).
 */

import {
  err,
  ok,
  isErr,
  validationError,
  type Result,
  type UseCase,
  type ValidationError,
} from '@/shared';
import { makeCard, type Card } from './card';
import { normalizeTerm } from './duplicate';
import type { CardRepository } from './ports';
import type { FlashcardDeps } from './use-cases';

/** Field separators the import UI offers (kit: Tab · Comma · Semicolon). */
export type ImportSeparator = 'tab' | 'comma' | 'semicolon';

export const IMPORT_SEPARATOR_CHARS: Record<ImportSeparator, string> = {
  tab: '\t',
  comma: ',',
  semicolon: ';',
};

export interface ImportRow {
  term: string;
  meaning: string;
}

function rowError(row: number): ValidationError {
  return validationError(
    [{ field: 'row', message: String(row) }],
    `Couldn’t read the file at row ${row}. Check the format and try again.`,
  );
}

/**
 * Parse import text into rows: one card per non-empty line, `term<sep>meaning`.
 * A leading literal `Term<sep>Meaning` header line is skipped. A line missing
 * either column fails with the 1-based row number (matching the original text's
 * line numbering, header and blank lines included).
 */
export function parseImportRows(text: string, separator: ImportSeparator): Result<ImportRow[], ValidationError> {
  const sep = IMPORT_SEPARATOR_CHARS[separator];
  const lines = text.split(/\r\n|\r|\n/);
  const rows: ImportRow[] = [];
  let first = true;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === '') continue;
    const parts = line.split(sep);
    const term = (parts[0] ?? '').trim();
    const meaning = parts.slice(1).join(sep).trim();
    if (first && term.toLowerCase() === 'term' && meaning.toLowerCase() === 'meaning') {
      first = false;
      continue;
    }
    first = false;
    if (term === '' || meaning === '') {
      return err(rowError(i + 1));
    }
    rows.push({ term, meaning });
  }
  return ok(rows);
}

/** Count rows whose term already exists in the deck (drives the dup warning). */
export function countDuplicateRows(rows: readonly ImportRow[], existing: readonly Card[]): number {
  const seen = new Set(existing.map((c) => normalizeTerm(c.term)));
  let dups = 0;
  for (const row of rows) {
    if (seen.has(normalizeTerm(row.term))) dups += 1;
  }
  return dups;
}

export interface ImportCardsInput {
  deckId: string;
  subdeckId: string | null;
  rows: readonly ImportRow[];
  /** Per-card progress (called after each successful save). */
  onProgress?: (done: number, total: number) => void;
}

export interface ImportReport {
  imported: number;
}

/**
 * Persist parsed rows into a deck. Duplicates are allowed — the UI has already
 * warned ("import anyway?") before this runs. Validates ALL rows up front (an
 * invalid row aborts with its 1-based row number before any write), then saves
 * sequentially; if a save fails mid-batch the already-saved cards are removed
 * (compensated rollback) and the failure is returned.
 */
export function importCards(
  deps: Pick<FlashcardDeps, 'cards' | 'ids' | 'clock'>,
): UseCase<ImportCardsInput, ImportReport> {
  return {
    async execute(input) {
      const built: Card[] = [];
      for (let i = 0; i < input.rows.length; i += 1) {
        const row = input.rows[i];
        const card = makeCard({
          id: deps.ids(),
          deckId: input.deckId,
          subdeckId: input.subdeckId,
          term: row.term,
          meaning: row.meaning,
          tags: [],
          audioRef: null,
          createdAt: deps.clock(),
        });
        if (isErr(card)) {
          return err(rowError(i + 1));
        }
        built.push(card.value);
      }

      const saved: string[] = [];
      for (const card of built) {
        const r = await deps.cards.save(card);
        if (isErr(r)) {
          await rollback(deps.cards, saved);
          return r;
        }
        saved.push(card.id);
        input.onProgress?.(saved.length, built.length);
      }
      return ok({ imported: saved.length });
    },
  };
}

async function rollback(cards: CardRepository, ids: readonly string[]): Promise<void> {
  for (const id of ids) {
    await cards.remove(id);
  }
}
