/**
 * Recent-search history (WBS 4.6) over a fake settings store. Most-recent-first,
 * deduped case-insensitively, capped, corrupt-tolerant.
 */

import { ok, type Result } from '@/shared';
import type { SettingsRepository } from '@/features/settings/data';
import { loadRecent, addRecent, removeRecent, clearRecent, MAX_RECENT } from '@/features/search/data';

class FakeSettings implements SettingsRepository {
  store = new Map<string, string>();
  subscribe() {
    return () => {};
  }
  async get(key: string): Promise<Result<string | null>> {
    return ok(this.store.get(key) ?? null);
  }
  async set(key: string, value: string): Promise<Result<void>> {
    this.store.set(key, value);
    return ok(undefined);
  }
}

describe('recent searches (WBS 4.6)', () => {
  it('adds most-recent-first', async () => {
    const s = new FakeSettings();
    await addRecent(s, 'hello');
    const list = await addRecent(s, 'world');
    expect(list).toEqual(['world', 'hello']);
  });

  it('dedupes case-insensitively and re-promotes', async () => {
    const s = new FakeSettings();
    await addRecent(s, 'Hello');
    await addRecent(s, 'world');
    const list = await addRecent(s, 'hello');
    expect(list).toEqual(['hello', 'world']);
  });

  it('ignores blank queries', async () => {
    const s = new FakeSettings();
    const list = await addRecent(s, '   ');
    expect(list).toEqual([]);
  });

  it('caps at MAX_RECENT', async () => {
    const s = new FakeSettings();
    for (let i = 0; i < MAX_RECENT + 3; i++) await addRecent(s, `q${i}`);
    const list = await loadRecent(s);
    expect(list).toHaveLength(MAX_RECENT);
    expect(list[0]).toBe(`q${MAX_RECENT + 2}`);
  });

  it('removes and clears', async () => {
    const s = new FakeSettings();
    await addRecent(s, 'a');
    await addRecent(s, 'b');
    expect(await removeRecent(s, 'A')).toEqual(['b']);
    expect(await clearRecent(s)).toEqual([]);
  });

  it('degrades a corrupt value to empty', async () => {
    const s = new FakeSettings();
    await s.set('search.recent', '{not json');
    expect(await loadRecent(s)).toEqual([]);
  });
});
