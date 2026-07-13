/**
 * SQLite client + transaction helper (WBS 0.4/0.5, ADR 0005).
 *
 * Opens the single on-device database (`memox.db`), enables WAL + foreign keys, and
 * runs pending migrations once — memoized, so every caller shares one connection.
 * `tx(work)` runs a unit of work atomically (BEGIN/COMMIT/ROLLBACK) for the
 * repositories' multi-table writes.
 */

import * as SQLite from 'expo-sqlite';

import { migrations, runMigrations, type MigrationDb } from './migrations';

const DB_NAME = 'memox.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Adapt an `expo-sqlite` database to the runner's {@link MigrationDb} port. */
function migrationDbFor(db: SQLite.SQLiteDatabase): MigrationDb {
  return {
    async getUserVersion() {
      const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      return row?.user_version ?? 0;
    },
    async setUserVersion(version) {
      // `version` is a validated non-negative integer from the registry (not user input).
      await db.execAsync(`PRAGMA user_version = ${version}`);
    },
    execAsync: (sql) => db.execAsync(sql),
    withTransactionAsync: (work) => db.withTransactionAsync(work),
  };
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync("PRAGMA journal_mode = 'wal';\nPRAGMA foreign_keys = ON;");
  const result = await runMigrations(migrationDbFor(db), migrations);
  if (!result.ok) {
    throw new Error(`Migration failed: ${result.error.message}`);
  }
  return db;
}

/** The shared, migrated database connection (opened + migrated on first call). */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbPromise === null) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

/**
 * Run `work` inside a transaction — repositories use this so multi-table writes
 * commit all-or-nothing (rollback on throw), per ADR 0005.
 */
export async function tx<T>(work: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  const db = await getDb();
  let result: T;
  await db.withTransactionAsync(async () => {
    result = await work(db);
  });
  // withTransactionAsync resolves only after `work` completed, so `result` is set.
  return result!;
}
