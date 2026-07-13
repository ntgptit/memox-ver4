/**
 * Migration runner test harness (WBS 0.5).
 *
 * Exercises vN→vN+1 upgrades against an in-memory {@link MigrationDb} fake (native
 * SQLite can't run in jest): pending steps apply in order, user_version advances,
 * already-applied steps are skipped, a bad registry is rejected, and a failing step
 * rolls back (version stays at the last good one).
 */

import { isOk, isErr } from '@/shared';
import { runMigrations, validateMigrations, type Migration, type MigrationDb } from '@/db/migrations';

/** In-memory fake: records applied SQL + emulates a transaction (rollback on throw). */
class FakeMigrationDb implements MigrationDb {
  version = 0;
  log: string[] = [];

  async getUserVersion() {
    return this.version;
  }
  async setUserVersion(v: number) {
    this.version = v;
  }
  async execAsync(sql: string) {
    this.log.push(sql);
  }
  async withTransactionAsync(work: () => Promise<void>) {
    const snapshot = { version: this.version, log: [...this.log] };
    try {
      await work();
    } catch (e) {
      this.version = snapshot.version; // ROLLBACK
      this.log = snapshot.log;
      throw e;
    }
  }
}

function migration(version: number, label = `m${version}`): Migration {
  return {
    version,
    name: label,
    async up(db) {
      await db.execAsync(`-- ${label}`);
    },
  };
}

describe('validateMigrations (WBS 0.5)', () => {
  it('accepts a contiguous 1..N registry', () => {
    expect(isOk(validateMigrations([migration(2), migration(1), migration(3)]))).toBe(true);
  });

  it('rejects a gap', () => {
    expect(isErr(validateMigrations([migration(1), migration(3)]))).toBe(true);
  });

  it('rejects a duplicate version', () => {
    expect(isErr(validateMigrations([migration(1), migration(1)]))).toBe(true);
  });

  it('rejects a non-positive or non-integer version', () => {
    expect(isErr(validateMigrations([migration(0)]))).toBe(true);
    expect(isErr(validateMigrations([migration(1.5)]))).toBe(true);
  });

  it('accepts the empty registry (fresh framework)', () => {
    expect(isOk(validateMigrations([]))).toBe(true);
  });
});

describe('runMigrations (WBS 0.5)', () => {
  it('applies all pending steps in order and advances user_version', async () => {
    const db = new FakeMigrationDb();
    const r = await runMigrations(db, [migration(1), migration(2), migration(3)]);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toBe(3);
    expect(db.version).toBe(3);
    expect(db.log).toEqual(['-- m1', '-- m2', '-- m3']);
  });

  it('is a no-op when already up to date', async () => {
    const db = new FakeMigrationDb();
    db.version = 2;
    const r = await runMigrations(db, [migration(1), migration(2)]);
    expect(isOk(r)).toBe(true);
    expect(db.log).toEqual([]); // nothing re-applied
  });

  it('applies only the pending tail (vN→vN+1 upgrade)', async () => {
    const db = new FakeMigrationDb();
    db.version = 1;
    await runMigrations(db, [migration(1), migration(2), migration(3)]);
    expect(db.version).toBe(3);
    expect(db.log).toEqual(['-- m2', '-- m3']); // v1 skipped
  });

  it('rolls back a failing step and stops at the last good version', async () => {
    const db = new FakeMigrationDb();
    const boom: Migration = {
      version: 2,
      name: 'boom',
      async up() {
        throw new Error('bad DDL');
      },
    };
    const r = await runMigrations(db, [migration(1), boom, migration(3)]);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('storage');
    expect(db.version).toBe(1); // v1 committed, v2 rolled back, v3 never ran
    expect(db.log).toEqual(['-- m1']);
  });

  it('rejects a non-forward-only registry before touching the DB', async () => {
    const db = new FakeMigrationDb();
    const r = await runMigrations(db, [migration(1), migration(3)]);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('unexpected');
    expect(db.version).toBe(0);
  });
});
