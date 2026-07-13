/**
 * SQL access port (WBS 3.2, ADR 0005).
 *
 * Repositories depend on this small async surface, not on `expo-sqlite` directly, so
 * they are engine-independent and unit-testable against a real in-memory SQLite
 * (better-sqlite3) in jest. `expoSqlDatabase` is the production adapter over the
 * shared connection from `./client`.
 */

import * as SQLite from 'expo-sqlite';

import { getDb } from './client';

export type SqlValue = string | number | null;
export type SqlParams = readonly SqlValue[];

/** Parameterized statement execution. */
export interface SqlRunner {
  /** Run a write (INSERT/UPDATE/DELETE) statement. */
  run(sql: string, params?: SqlParams): Promise<void>;
  /** Read the first row, or null. */
  get<T>(sql: string, params?: SqlParams): Promise<T | null>;
  /** Read all rows. */
  all<T>(sql: string, params?: SqlParams): Promise<T[]>;
}

export interface SqlDatabase extends SqlRunner {
  /** Run `work` atomically; a throw rolls the whole unit back (ADR 0005). */
  tx<T>(work: (runner: SqlRunner) => Promise<T>): Promise<T>;
}

/** Adapt an `expo-sqlite` database to {@link SqlDatabase}. */
export function expoSqlDatabase(db: SQLite.SQLiteDatabase): SqlDatabase {
  const runner: SqlRunner = {
    async run(sql, params = []) {
      await db.runAsync(sql, params as SQLite.SQLiteBindValue[]);
    },
    async get<T>(sql: string, params: SqlParams = []) {
      return (await db.getFirstAsync<T>(sql, params as SQLite.SQLiteBindValue[])) ?? null;
    },
    all<T>(sql: string, params: SqlParams = []) {
      return db.getAllAsync<T>(sql, params as SQLite.SQLiteBindValue[]);
    },
  };
  return {
    ...runner,
    async tx<T>(work: (r: SqlRunner) => Promise<T>) {
      let result: T;
      await db.withTransactionAsync(async () => {
        result = await work(runner);
      });
      return result!;
    },
  };
}

/** The shared production {@link SqlDatabase} (opened + migrated via `./client`). */
export async function getSqlDatabase(): Promise<SqlDatabase> {
  return expoSqlDatabase(await getDb());
}
