/**
 * Library search query (WBS 4.6). A local, case-insensitive match over card term +
 * meaning, joined to the owning deck and (optionally) the card's SRS state so each hit
 * carries a study status. Read-only; runs against the shared {@link SqlDatabase}.
 */

import { ok, err, storageError, type Result } from '@/shared';
import type { SqlDatabase } from '@/db/sql';

export type CardStatus = 'new' | 'due' | 'mastered';

export interface CardHit {
  readonly cardId: string;
  readonly term: string;
  readonly meaning: string;
  readonly deckTitle: string;
  readonly status: CardStatus;
}

interface HitRow {
  card_id: string;
  term: string;
  meaning: string;
  deck_title: string;
  due_at: number | null;
  reps: number | null;
}

const DEFAULT_LIMIT = 50;

/** Escape the LIKE wildcards so a user's `%`/`_` are matched literally (ESCAPE '\'). */
function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function statusOf(row: HitRow, now: number): CardStatus {
  if (row.reps === null || row.due_at === null) return 'new';
  return row.due_at <= now ? 'due' : 'mastered';
}

/**
 * Find cards whose term or meaning contains `query` (trimmed). Returns [] for a blank
 * query. Results are ordered by term and capped at `limit`.
 */
export async function searchLibrary(
  db: SqlDatabase,
  query: string,
  now: number,
  limit: number = DEFAULT_LIMIT,
): Promise<Result<CardHit[]>> {
  const q = query.trim();
  if (q.length === 0) return ok([]);
  const like = `%${escapeLike(q)}%`;
  try {
    const rows = await db.all<HitRow>(
      `SELECT c.id AS card_id, c.term AS term, c.meaning AS meaning, d.title AS deck_title,
              s.due_at AS due_at, s.reps AS reps
         FROM card c
         JOIN deck d ON c.deck_id = d.id
         LEFT JOIN srs_state s ON s.card_id = c.id
        WHERE c.term LIKE ? ESCAPE '\\' OR c.meaning LIKE ? ESCAPE '\\'
        ORDER BY c.term
        LIMIT ?`,
      [like, like, limit],
    );
    return ok(
      rows.map((r) => ({
        cardId: r.card_id,
        term: r.term,
        meaning: r.meaning,
        deckTitle: r.deck_title,
        status: statusOf(r, now),
      })),
    );
  } catch (cause) {
    return err(storageError('Search failed.', cause));
  }
}
