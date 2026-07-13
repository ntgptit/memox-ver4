/**
 * Search controller (WBS 4.6). Owns the query + debounced DB search, the result
 * filter, and the recent-history read/write. A non-empty query shows a loading phase
 * then results/no-results; opening a hit records the query in history. Deps injected
 * so tests drive it with fakes + a zero debounce.
 */

import { useEffect, useState } from 'react';

import type { SqlDatabase } from '@/db/sql';
import type { SettingsRepository } from '@/features/settings/data';
import { searchLibrary, loadRecent, addRecent, removeRecent, clearRecent, type CardHit } from '@/features/search/data';
import { isErr, type Clock } from '@/shared';

import type { SearchFilter, SearchPhase } from './search-fixtures';

export interface SearchDeps {
  db: SqlDatabase;
  settings: SettingsRepository;
  clock: Clock;
}

export interface SearchController {
  query: string;
  phase: SearchPhase;
  hits: readonly CardHit[];
  recent: readonly string[];
  filter: SearchFilter;
  setQuery: (q: string) => void;
  clear: () => void;
  setFilter: (f: SearchFilter) => void;
  useRecent: (q: string) => void;
  removeRecent: (q: string) => void;
  clearRecent: () => void;
  openHit: (hit: CardHit) => void;
}

const DEFAULT_DEBOUNCE_MS = 250;

export function useSearch(deps: SearchDeps | null, debounceMs: number = DEFAULT_DEBOUNCE_MS): SearchController {
  const [query, setQueryState] = useState('');
  const [result, setResult] = useState<{ q: string; hits: readonly CardHit[] } | null>(null);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [filter, setFilter] = useState<SearchFilter>('all');

  // Recent history: load once, then keep in sync with the writes below.
  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void loadRecent(deps.settings).then((r) => {
      if (alive) setRecent(r);
    });
    return () => {
      alive = false;
    };
  }, [deps]);

  // Debounced search — only the async result is stored; the phase is derived below so
  // the effect never sets state synchronously (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!deps) return;
    const q = query.trim();
    if (q.length === 0) return;
    let alive = true;
    const timer = setTimeout(() => {
      void searchLibrary(deps.db, q, deps.clock()).then((res) => {
        if (alive) setResult({ q, hits: isErr(res) ? [] : res.value });
      });
    }, debounceMs);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [deps, query, debounceMs]);

  const trimmed = query.trim();
  const fresh = result !== null && result.q === trimmed;
  const phase: SearchPhase =
    trimmed.length === 0 ? 'recent' : fresh ? (result.hits.length > 0 ? 'results' : 'no-results') : 'loading';
  const hits = fresh ? result.hits : [];

  const setQuery = (q: string) => setQueryState(q);
  const clear = () => setQueryState('');
  const useRecentQuery = (q: string) => setQueryState(q);

  const remove = (q: string) => {
    if (!deps) return;
    void removeRecent(deps.settings, q).then(setRecent);
  };
  const clearAll = () => {
    if (!deps) return;
    void clearRecent(deps.settings).then(setRecent);
  };
  const openHit = () => {
    if (!deps) return;
    void addRecent(deps.settings, query).then(setRecent);
  };

  return {
    query,
    phase,
    hits,
    recent,
    filter,
    setQuery,
    clear,
    setFilter,
    useRecent: useRecentQuery,
    removeRecent: remove,
    clearRecent: clearAll,
    openHit,
  };
}
