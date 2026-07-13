/**
 * Mode-picker controller (WBS 5.4) — counts a deck's words for each scope and tracks
 * the active scope. Composes the card repository (4.2, `listByDeck`) and the SRS
 * repository (5.2, `dueCards` + `list`); no new ports. Deps injected for tests.
 */

import { useEffect, useMemo, useState } from 'react';

import type { CardRepository } from '@/features/flashcards/domain';
import type { SrsStateRepository } from '@/features/session/domain';
import { isErr, type Clock } from '@/shared';

import type { StudyScope } from './mode-picker-model';

export interface ModePickerDeps {
  cards: CardRepository;
  srs: SrsStateRepository;
  clock: Clock;
}

export type ScopeCounts = Record<StudyScope, number>;

export interface ModePickerController {
  scope: StudyScope;
  setScope: (scope: StudyScope) => void;
  /** Words available for the active scope; null while counting. */
  scopeCount: number | null;
  counts: ScopeCounts | null;
}

async function countScopes(deckId: string, deps: ModePickerDeps): Promise<ScopeCounts> {
  const cards = await deps.cards.listByDeck(deckId);
  if (isErr(cards)) return { srs: 0, all: 0, unlearned: 0 };
  const ids = cards.value.map((c) => c.id);

  const due = await deps.srs.dueCards(ids, deps.clock());
  const dueCount = isErr(due) ? 0 : due.value.length;

  const states = await deps.srs.list();
  const withState = isErr(states) ? new Set<string>() : new Set(states.value.map((s) => s.cardId));
  const unlearned = ids.filter((id) => !withState.has(id)).length;

  return { all: ids.length, srs: dueCount, unlearned };
}

/**
 * Drive the mode-picker for `deckId`. `deps === null` means the repositories are still
 * resolving — counts stay null. Counts are computed once; switching scope is local.
 */
export function useModePicker(deckId: string, deps: ModePickerDeps | null): ModePickerController {
  const [scope, setScope] = useState<StudyScope>('srs');
  const [counts, setCounts] = useState<ScopeCounts | null>(null);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void countScopes(deckId, deps).then((c) => {
      if (alive) setCounts(c);
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const scopeCount = useMemo(() => (counts ? counts[scope] : null), [counts, scope]);

  return { scope, setScope, scopeCount, counts };
}
