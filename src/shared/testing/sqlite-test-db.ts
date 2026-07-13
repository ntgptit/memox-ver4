/**
 * In-memory SQLite test database (WBS 3.2) — TEST-ONLY.
 *
 * Backs the {@link SqlDatabase} port with better-sqlite3 (real SQLite, node-only), so
 * repository tests exercise actual SQL — DDL, foreign keys, transactions, rollback —
 * without the native `expo-sqlite` module. Runs the real migration registry, so the
 * schema under test is exactly what ships. Never imported by app code (better-sqlite3
 * is a node addon); only tests import this.
 */

import Database from 'better-sqlite3';

import { migrations, runMigrations, type MigrationDb } from '@/db/migrations';
import type { SqlDatabase, SqlRunner, SqlValue } from '@/db/sql';

export interface TestDatabase extends SqlDatabase {
  close(): void;
}

/** Open a fresh in-memory DB, enable FKs, run all migrations, return a {@link SqlDatabase}. */
export async function createTestDatabase(): Promise<TestDatabase> {
  const raw = new Database(':memory:');
  raw.pragma('foreign_keys = ON');

  const migrationDb: MigrationDb = {
    async getUserVersion() {
      return raw.pragma('user_version', { simple: true }) as number;
    },
    async setUserVersion(version) {
      raw.pragma(`user_version = ${version}`);
    },
    async execAsync(sql) {
      raw.exec(sql);
    },
    async withTransactionAsync(work) {
      raw.exec('BEGIN');
      try {
        await work();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };

  const result = await runMigrations(migrationDb, migrations);
  if (!result.ok) {
    throw new Error(`Test DB migration failed: ${result.error.message}`);
  }

  const runner: SqlRunner = {
    async run(sql, params = []) {
      raw.prepare(sql).run(...(params as SqlValue[]));
    },
    async get<T>(sql: string, params: readonly SqlValue[] = []) {
      return (raw.prepare(sql).get(...(params as SqlValue[])) as T | undefined) ?? null;
    },
    async all<T>(sql: string, params: readonly SqlValue[] = []) {
      return raw.prepare(sql).all(...(params as SqlValue[])) as T[];
    },
  };

  return {
    ...runner,
    async tx<T>(work: (r: SqlRunner) => Promise<T>) {
      raw.exec('BEGIN');
      try {
        const out = await work(runner);
        raw.exec('COMMIT');
        return out;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
    close() {
      raw.close();
    },
  };
}
