/**
 * Migration contracts (WBS 0.5).
 *
 * A migration is a forward-only step keyed by an integer `version`, applied when the
 * database's `PRAGMA user_version` is below it. The runner talks to the DB only
 * through {@link MigrationDb}, so it is unit-testable against an in-memory fake
 * (native SQLite can't run in jest) and the real client wires `expo-sqlite` to it.
 */

/** The minimal DB surface the migration runner needs (ADR 0005 access-layer). */
export interface MigrationDb {
  /** Current schema version from `PRAGMA user_version` (0 for a fresh DB). */
  getUserVersion(): Promise<number>;
  /** Set `PRAGMA user_version`. `version` is a validated non-negative integer. */
  setUserVersion(version: number): Promise<void>;
  /** Execute DDL / bulk SQL (no parameter escaping — schema statements only). */
  execAsync(sql: string): Promise<void>;
  /** Run `work` atomically; a throw rolls the whole step back. */
  withTransactionAsync(work: () => Promise<void>): Promise<void>;
}

/** One forward-only migration step. `up` performs the schema change for `version`. */
export interface Migration {
  /** Positive integer; the registry must be contiguous 1..N (forward-only). */
  readonly version: number;
  /** Human label for logs/tests. */
  readonly name: string;
  up(db: MigrationDb): Promise<void>;
}
