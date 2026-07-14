/**
 * Statistics container (WBS 8.1) — resolves the library/flashcard/session
 * repositories and drives {@link useStatistics}.
 */

import { useEffect, useState } from 'react';

import { isErr } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { StatisticsScreen } from './statistics-screen';
import { useStatistics, type StatisticsDeps } from './use-statistics';

export function StatisticsContainer() {
  const [deps, setDeps] = useState<StatisticsDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories(), createSessionRepositories()]).then(
      ([lib, flash, session]) => {
        if (!alive) return;
        setDeps({
          listDecks: async () => {
            const r = await lib.decks.list();
            return isErr(r) ? [] : r.value;
          },
          listCardIdsByDeck: async (deckId) => {
            const r = await flash.cards.listByDeck(deckId);
            return isErr(r) ? [] : r.value.map((c) => c.id);
          },
          listSessions: async () => {
            const r = await session.sessions.list();
            return isErr(r) ? [] : r.value;
          },
          attemptsBySession: async (id) => {
            const r = await session.attempts.listBySession(id);
            return isErr(r) ? [] : r.value;
          },
          listSrs: async () => {
            const r = await session.srs.list();
            return isErr(r) ? [] : r.value;
          },
          now: systemClock,
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useStatistics(deps);
  return <StatisticsScreen data={ctrl.data} scope={ctrl.scope} onScopeChange={ctrl.setScope} onRetry={ctrl.reload} />;
}
