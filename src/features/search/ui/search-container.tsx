/**
 * Search container (WBS 4.6) — resolves the shared DB + settings repository, drives
 * the controller, and navigates to a card when a hit is opened.
 */

import { useEffect, useState } from 'react';

import { getSqlDatabase } from '@/db/sql';
import { createSettingsRepository } from '@/features/settings/data';
import type { CardHit } from '@/features/search/data';
import { systemClock } from '@/shared/runtime';

import { SearchScreen } from './search-screen';
import { useSearch, type SearchDeps } from './use-search';

export function SearchContainer({ onBack, onOpenCard }: { onBack?: () => void; onOpenCard?: (cardId: string) => void }) {
  const [deps, setDeps] = useState<SearchDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([getSqlDatabase(), createSettingsRepository()]).then(([db, settings]) => {
      if (alive) setDeps({ db, settings, clock: systemClock });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useSearch(deps);

  const openHit = (hit: CardHit) => {
    ctrl.openHit(hit);
    onOpenCard?.(hit.cardId);
  };

  return (
    <SearchScreen
      query={ctrl.query}
      phase={ctrl.phase}
      hits={ctrl.hits}
      recent={ctrl.recent}
      filter={ctrl.filter}
      onQueryChange={ctrl.setQuery}
      onClear={ctrl.clear}
      onFilterChange={ctrl.setFilter}
      onUseRecent={ctrl.useRecent}
      onRemoveRecent={ctrl.removeRecent}
      onClearRecent={ctrl.clearRecent}
      onOpenHit={openHit}
      onBack={onBack}
    />
  );
}
