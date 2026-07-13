/**
 * Forward-only migration runner (WBS 0.5).
 *
 * Applies every migration whose `version` exceeds the DB's current
 * `PRAGMA user_version`, in order, each inside its own transaction that also bumps
 * `user_version` — so a partial run is resumable and never half-applies a step
 * (rollback on throw). Returns the final version, or a typed {@link AppError}.
 */

import { ok, err, unexpectedError, storageError, type Result } from '@/shared';
import type { Migration, MigrationDb } from './types';

/**
 * Validate the registry is forward-only: unique, positive integers, contiguous
 * `1..N`. A gap or duplicate is a programming error (bad registry), not a runtime
 * storage failure — surfaced as `unexpected`.
 */
export function validateMigrations(migrations: readonly Migration[]): Result<Migration[]> {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  for (let i = 0; i < sorted.length; i += 1) {
    const expected = i + 1;
    const { version } = sorted[i];
    if (!Number.isInteger(version) || version <= 0) {
      return err(unexpectedError(`Migration version must be a positive integer, got ${version}.`));
    }
    if (version !== expected) {
      return err(
        unexpectedError(`Migrations must be contiguous from 1; expected ${expected}, got ${version}.`),
      );
    }
  }
  return ok(sorted);
}

/**
 * Run all pending migrations. No-op when already up to date. Each step runs in a
 * transaction that applies `up` then sets `user_version`, so failure leaves the DB
 * at the last fully-applied version.
 */
export async function runMigrations(
  db: MigrationDb,
  migrations: readonly Migration[],
): Promise<Result<number>> {
  const validated = validateMigrations(migrations);
  if (!validated.ok) {
    return validated;
  }

  try {
    const current = await db.getUserVersion();
    let applied = current;
    for (const migration of validated.value) {
      if (migration.version <= current) {
        continue;
      }
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        await db.setUserVersion(migration.version);
      });
      applied = migration.version;
    }
    return ok(applied);
  } catch (cause) {
    return err(storageError('Database migration failed.', cause));
  }
}
