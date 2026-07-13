/**
 * Session data layer (WBS 5.2) — SQLite repositories, the transactional answer
 * writer, and a factory over the shared production DB. Use cases depend on the WBS
 * 5.1 ports; this wires the impls.
 */

import { getSqlDatabase } from '@/db/sql';
import {
  SqliteSessionRepository,
  SqliteAttemptRepository,
  SqliteSrsStateRepository,
} from './repositories';

export * from './repositories';
export * from './mappers';
export * from './record-answer';

/** Construct the session repositories over the shared production DB. */
export async function createSessionRepositories() {
  const db = await getSqlDatabase();
  return {
    sessions: new SqliteSessionRepository(db),
    attempts: new SqliteAttemptRepository(db),
    srs: new SqliteSrsStateRepository(db),
  };
}
