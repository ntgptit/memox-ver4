/**
 * App-settings key/value repository (WBS 2.3) over SQLite (`app_setting`, migration
 * v4). A thin string get/set; typed setting accessors (theme, study…) build on it.
 * Reads return a {@link Result}; a missing key is `ok(null)`, not an error.
 */

import { ok, type Result } from '@/shared';
import { createChangeSignal } from '@/db/change-signal';
import { getSqlDatabase, type SqlDatabase } from '@/db/sql';

export interface SettingsRepository {
  get(key: string): Promise<Result<string | null>>;
  set(key: string, value: string): Promise<Result<void>>;
  subscribe(onChange: () => void): () => void;
}

export class SqliteSettingsRepository implements SettingsRepository {
  private readonly signal = createChangeSignal();
  constructor(private readonly db: SqlDatabase) {}

  subscribe(onChange: () => void) {
    return this.signal.subscribe(onChange);
  }

  async get(key: string): Promise<Result<string | null>> {
    const row = await this.db.get<{ value: string }>('SELECT value FROM app_setting WHERE key = ?', [key]);
    return ok(row ? row.value : null);
  }

  async set(key: string, value: string): Promise<Result<void>> {
    await this.db.run(
      'INSERT INTO app_setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, value],
    );
    this.signal.emit();
    return ok(undefined);
  }
}

/** Construct the settings repository over the shared production DB. */
export async function createSettingsRepository(): Promise<SqliteSettingsRepository> {
  return new SqliteSettingsRepository(await getSqlDatabase());
}
