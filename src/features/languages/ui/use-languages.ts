/**
 * Languages controller (WBS 3.3) — wires the {@link LanguagesScreen} to the domain
 * use cases (3.1) and repositories (3.2). Loads pairs, counts their decks for the
 * subtitle, subscribes for live updates, and exposes async add/remove that return a
 * {@link Result} so the screen can render validation/failure.
 *
 * Deps are injected so tests drive it with in-memory fakes; the container resolves
 * the production repositories + runtime services and passes them in.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  addLanguagePair,
  removeLanguagePair,
  type LanguagePair,
  type LanguagePairRepository,
} from '@/features/languages/domain';
import type { DeckRepository } from '@/features/library/domain';
import { isErr, err, unexpectedError, type Result, type AppError, type IdGenerator, type Clock } from '@/shared';

import { type LanguagesData, type LanguagePairView } from './fixtures';

export interface LanguagesDeps {
  languagePairs: LanguagePairRepository;
  decks: DeckRepository;
  ids: IdGenerator;
  clock: Clock;
}

export interface LanguagesController {
  data: LanguagesData;
  add: (input: { learning: string; native: string }) => Promise<Result<LanguagePair, AppError>>;
  remove: (id: string) => Promise<Result<unknown, AppError>>;
  retry: () => void;
}

/** Build the display rows: each pair with the number of decks filed under it. */
async function loadData(deps: LanguagesDeps): Promise<LanguagesData> {
  const pairs = await deps.languagePairs.list();
  if (isErr(pairs)) return { status: 'error', message: pairs.error.message };

  const decks = await deps.decks.list();
  const countByPair = new Map<string, number>();
  if (!isErr(decks)) {
    for (const d of decks.value) {
      countByPair.set(d.languagePairId, (countByPair.get(d.languagePairId) ?? 0) + 1);
    }
  }

  const views: LanguagePairView[] = pairs.value.map((p) => ({
    id: p.id,
    learning: p.learning,
    native: p.native,
    deckCount: countByPair.get(p.id) ?? 0,
  }));
  return { status: 'ready', pairs: views };
}

/**
 * Drive the languages screen. `deps === null` means the production repositories are
 * still resolving — the controller reports `loading` and no-ops writes until they land.
 */
export function useLanguages(deps: LanguagesDeps | null): LanguagesController {
  const [data, setData] = useState<LanguagesData>({ status: 'loading' });

  // Load + subscribe. Guarded so a late resolve after unmount can't set state; the
  // initial `loading` comes from useState, so the effect never sets state synchronously.
  useEffect(() => {
    if (!deps) return;
    let alive = true;
    const apply = (next: LanguagesData) => {
      if (alive) setData(next);
    };
    void loadData(deps).then(apply);
    const unsubscribe = deps.languagePairs.subscribe(() => void loadData(deps).then(apply));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [deps]);

  const retry = useCallback(() => {
    if (!deps) return;
    setData({ status: 'loading' });
    void loadData(deps).then(setData);
  }, [deps]);

  const add = useCallback<LanguagesController['add']>(
    async (input) => {
      if (!deps) return err(unexpectedError('Not ready yet.'));
      return addLanguagePair({ repo: deps.languagePairs, ids: deps.ids, clock: deps.clock }).execute(input);
    },
    [deps],
  );

  const remove = useCallback<LanguagesController['remove']>(
    async (id) => {
      if (!deps) return err(unexpectedError('Not ready yet.'));
      return removeLanguagePair({ repo: deps.languagePairs }).execute(id);
    },
    [deps],
  );

  return { data, add, remove, retry };
}
