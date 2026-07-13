/**
 * Transactional deck-progress reset (WBS 4.5).
 *
 * Resetting a deck clears every card's SRS state AND its attempt history together —
 * or neither. `resetDeckProgress` wraps both deletes in one transaction (ADR 0005
 * `tx`), so a failure rolls both back and a deck can't be left half-reset (DoD: reset
 * persists with a rollback test). After a reset the deck's cards are New again.
 */

import { ok, err, storageError, type Result } from '@/shared';
import type { SqlDatabase } from '@/db/sql';

export async function resetDeckProgress(db: SqlDatabase, cardIds: readonly string[]): Promise<Result<void>> {
  if (cardIds.length === 0) {
    return ok(undefined);
  }
  const placeholders = cardIds.map(() => '?').join(', ');
  try {
    await db.tx(async (r) => {
      await r.run(`DELETE FROM attempt WHERE card_id IN (${placeholders})`, [...cardIds]);
      await r.run(`DELETE FROM srs_state WHERE card_id IN (${placeholders})`, [...cardIds]);
    });
    return ok(undefined);
  } catch (cause) {
    return err(storageError('Could not reset this deck.', cause));
  }
}
