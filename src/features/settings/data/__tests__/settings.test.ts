/**
 * Settings persistence tests over real (in-memory) SQLite (WBS 2.3).
 */

import { isOk } from '@/shared';
import { createTestDatabase, type TestDatabase } from '@/shared/testing/sqlite-test-db';
import {
  SqliteSettingsRepository,
  loadThemeSettings,
  saveThemeSettings,
  DEFAULT_THEME_SETTINGS,
} from '@/features/settings/data';

let db: TestDatabase;
let repo: SqliteSettingsRepository;

beforeEach(async () => {
  db = await createTestDatabase();
  repo = new SqliteSettingsRepository(db);
});
afterEach(() => db.close());

describe('SettingsRepository (WBS 2.3)', () => {
  it('returns null for a missing key (not an error)', async () => {
    const r = await repo.get('nope');
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toBeNull();
  });

  it('upserts and reads back a value', async () => {
    await repo.set('k', 'v1');
    await repo.set('k', 'v2'); // upsert
    const r = await repo.get('k');
    if (isOk(r)) expect(r.value).toBe('v2');
  });
});

describe('theme settings persistence (WBS 2.3)', () => {
  it('loads defaults on a fresh store', async () => {
    expect(await loadThemeSettings(repo)).toEqual(DEFAULT_THEME_SETTINGS);
  });

  it('round-trips saved preferences across a reload', async () => {
    await saveThemeSettings(repo, { mode: 'dark', accent: 'green', textScale: 1.15 });
    // A fresh repository over the same DB simulates a restart.
    const reloaded = await loadThemeSettings(new SqliteSettingsRepository(db));
    expect(reloaded).toEqual({ mode: 'dark', accent: 'green', textScale: 1.15 });
  });

  it('degrades corrupt values to the defaults', async () => {
    await repo.set('theme.mode', 'purple');
    await repo.set('theme.accent', 'neon');
    await repo.set('theme.textScale', '9');
    expect(await loadThemeSettings(repo)).toEqual(DEFAULT_THEME_SETTINGS);
  });

  it('saveThemeSettings is a no-op with a null repo', async () => {
    await expect(saveThemeSettings(null, DEFAULT_THEME_SETTINGS)).resolves.toBeUndefined();
  });
});
