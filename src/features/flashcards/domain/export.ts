/**
 * Deck export (WBS 9.2) — serialize a deck's cards into separated-text that the
 * 9.1 importer reads back (round-trip guarantee), with optional review-state
 * columns (Leitner box + due date). Pure orchestration over the card repository;
 * the SRS lookup is injected so this module stays free of session imports.
 */

import { isErr, ok, type UseCase } from '@/shared';
import type { Card } from './card';
import { IMPORT_SEPARATOR_CHARS, type ImportSeparator } from './import';
import type { CardRepository } from './ports';

export type ExportScope = 'deck' | 'subtree';
export type ExportFormat = 'csv' | 'xlsx' | 'copy';

/** Review state appended per card when "Include review state" is on. */
export interface ExportSrsInfo {
  /** Leitner box 1–8 (stats mapping: reps + 1, clamped). */
  box: number;
  /** Next due date, epoch ms. */
  dueAt: number;
}

export interface SerializeOptions {
  separator: ImportSeparator;
  includeSrs: boolean;
  srsByCard?: ReadonlyMap<string, ExportSrsInfo>;
}

/**
 * One line per card: `term<sep>meaning` under a literal `Term<sep>Meaning`
 * header (which the importer skips). Newlines inside fields become spaces and
 * separator characters inside the TERM become spaces — the importer re-joins
 * extra separators into the meaning, so the meaning may keep them; this keeps
 * the plain (no-SRS) export exactly re-importable.
 */
export function serializeExport(cards: readonly Card[], opts: SerializeOptions): string {
  const sep = IMPORT_SEPARATOR_CHARS[opts.separator];
  const clean = (v: string) => v.replace(/\r\n|\r|\n/g, ' ');
  const cleanTerm = (v: string) => clean(v).split(sep).join(' ');
  const withSrs = opts.includeSrs && !(opts.srsByCard === undefined);

  const header = withSrs ? ['Term', 'Meaning', 'Box', 'Due'].join(sep) : ['Term', 'Meaning'].join(sep);
  const lines = cards.map((c) => {
    const base = [cleanTerm(c.term), clean(c.meaning)];
    if (!withSrs) return base.join(sep);
    const srs = opts.srsByCard?.get(c.id);
    const due = srs === undefined ? '' : new Date(srs.dueAt).toISOString().slice(0, 10);
    return [...base, srs === undefined ? '' : String(srs.box), due].join(sep);
  });
  return [header, ...lines].join('\n');
}

export interface ExportDeckInput {
  deckId: string;
  scope: ExportScope;
  separator: ImportSeparator;
  includeSrs: boolean;
  /** Per-card progress while collecting review state / serializing. */
  onProgress?: (done: number, total: number) => void;
}

export interface ExportPayload {
  text: string;
  count: number;
}

export interface ExportDeckDeps {
  cards: CardRepository;
  /** Review state for one card; null when the card has none yet. */
  srsFor: (cardId: string) => Promise<ExportSrsInfo | null>;
}

/**
 * Collect the scoped cards ('deck' = root cards only, 'subtree' = sub-decks
 * too), optionally join each card's review state, and serialize.
 */
export function exportDeck(deps: ExportDeckDeps): UseCase<ExportDeckInput, ExportPayload> {
  return {
    async execute(input) {
      const all = await deps.cards.listByDeck(input.deckId);
      if (isErr(all)) return all;
      const cards = input.scope === 'deck' ? all.value.filter((c) => c.subdeckId === null) : all.value;

      const srsByCard = new Map<string, ExportSrsInfo>();
      for (let i = 0; i < cards.length; i += 1) {
        if (input.includeSrs) {
          const srs = await deps.srsFor(cards[i].id);
          if (srs !== null) srsByCard.set(cards[i].id, srs);
        }
        input.onProgress?.(i + 1, cards.length);
      }

      const text = serializeExport(cards, {
        separator: input.separator,
        includeSrs: input.includeSrs,
        srsByCard,
      });
      return ok({ text, count: cards.length });
    },
  };
}
