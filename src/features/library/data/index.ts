/**
 * Library data layer (WBS 3.2) — SQLite repositories + a factory that wires them to
 * the shared production database. Screens/use cases depend on the WBS 3.1 ports;
 * this module is the only place that constructs the SQLite implementations.
 */

import { getSqlDatabase } from '@/db/sql';
import {
  SqliteDeckRepository,
  SqliteSubdeckRepository,
  SqliteLanguagePairRepository,
} from './repositories';

export * from './repositories';
export * from './mappers';

/** Construct the library repositories over the shared production DB. */
export async function createLibraryRepositories() {
  const db = await getSqlDatabase();
  return {
    decks: new SqliteDeckRepository(db),
    subdecks: new SqliteSubdeckRepository(db),
    languagePairs: new SqliteLanguagePairRepository(db),
  };
}
