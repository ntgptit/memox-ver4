/**
 * Search controller (WBS 4.6) — debounced query → results/no-results, recent history
 * load + record-on-open, and remove/clear. Fakes: an in-memory settings store and a
 * canned DB; zero debounce.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { ok, type Result } from '@/shared';
import type { SqlDatabase } from '@/db/sql';
import type { SettingsRepository } from '@/features/settings/data';

import { useSearch, type SearchDeps } from '../use-search';

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

// db.all returns a hit for queries containing '하', nothing otherwise.
const fakeDb = {
  run: async () => {},
  get: async () => undefined,
  all: async (_sql: string, params: unknown[]) => {
    const pattern = String(params[0] ?? '');
    return pattern.includes('하')
      ? [{ card_id: 'c1', term: '공부하다', meaning: 'to study', deck_title: 'TOPIK I', due_at: 1, reps: 2 }]
      : [];
  },
  tx: async () => {},
} as unknown as SqlDatabase;

function deps(settings = new FakeSettings()): SearchDeps {
  return { db: fakeDb, settings, clock: () => 1000 };
}

describe('useSearch', () => {
  it('starts on the recent phase and loads history', async () => {
    const settings = new FakeSettings();
    settings.store.set('search.recent', JSON.stringify(['hello']));
    const d = deps(settings);
    const { result } = renderHook(() => useSearch(d, 0));
    expect(result.current.phase).toBe('recent');
    await waitFor(() => expect(result.current.recent).toEqual(['hello']));
  });

  it('a query runs a debounced search → results', async () => {
    const d = deps();
    const { result } = renderHook(() => useSearch(d, 0));
    act(() => result.current.setQuery('하'));
    await waitFor(() => expect(result.current.phase).toBe('results'));
    expect(result.current.hits.map((h) => h.cardId)).toEqual(['c1']);
  });

  it('a non-matching query → no-results', async () => {
    const d = deps();
    const { result } = renderHook(() => useSearch(d, 0));
    act(() => result.current.setQuery('zzz'));
    await waitFor(() => expect(result.current.phase).toBe('no-results'));
  });

  it('clearing the query returns to recent', async () => {
    const d = deps();
    const { result } = renderHook(() => useSearch(d, 0));
    act(() => result.current.setQuery('하'));
    await waitFor(() => expect(result.current.phase).toBe('results'));
    act(() => result.current.clear());
    expect(result.current.phase).toBe('recent');
  });

  it('opening a hit records the query in recent history', async () => {
    const settings = new FakeSettings();
    const d = deps(settings);
    const { result } = renderHook(() => useSearch(d, 0));
    act(() => result.current.setQuery('공부'));
    await act(async () => {
      result.current.openHit({ cardId: 'c1', term: 't', meaning: 'm', deckTitle: 'd', status: 'new' });
    });
    await waitFor(() => expect(result.current.recent).toEqual(['공부']));
  });

  it('removes and clears recent history', async () => {
    const settings = new FakeSettings();
    settings.store.set('search.recent', JSON.stringify(['a', 'b']));
    const d = deps(settings);
    const { result } = renderHook(() => useSearch(d, 0));
    await waitFor(() => expect(result.current.recent).toHaveLength(2));
    await act(async () => result.current.removeRecent('a'));
    await waitFor(() => expect(result.current.recent).toEqual(['b']));
    await act(async () => result.current.clearRecent());
    await waitFor(() => expect(result.current.recent).toEqual([]));
  });

  it('null deps → stays on recent, empty', () => {
    const { result } = renderHook(() => useSearch(null, 0));
    expect(result.current.phase).toBe('recent');
    expect(result.current.recent).toEqual([]);
  });
});
