/**
 * Flashcards data layer (WBS 4.2) — SQLite repositories + a factory over the shared
 * production DB. Use cases depend on the WBS 4.1 ports; this wires the impls.
 */

import { getSqlDatabase } from '@/db/sql';
import { SqliteCardRepository, SqliteCardTranslationRepository } from './repositories';

export * from './repositories';
export * from './mappers';

/** Construct the flashcard repositories over the shared production DB. */
export async function createFlashcardRepositories() {
  const db = await getSqlDatabase();
  return {
    cards: new SqliteCardRepository(db),
    translations: new SqliteCardTranslationRepository(db),
  };
}
