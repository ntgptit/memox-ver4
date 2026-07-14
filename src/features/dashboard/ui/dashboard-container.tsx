/**
 * Dashboard container (WBS 5.3) — resolves the library/flashcard/session
 * repositories, drives {@link useDashboard}, and forwards navigation intents.
 */

import { useEffect, useState } from 'react';

import { isErr } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';
import { createSessionRepositories } from '@/features/session/data';

import { DashboardScreen, type DashboardScreenProps } from './dashboard-screen';
import { useDashboard, type DashboardDeps } from './use-dashboard';

export type DashboardContainerProps = Omit<DashboardScreenProps, 'data' | 'initialUi'>;

export function DashboardContainer(props: DashboardContainerProps) {
  const [deps, setDeps] = useState<DashboardDeps | null>(null);

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
          dueCardIds: async (ids) => {
            if (ids.length === 0) return new Set<string>();
            const r = await session.srs.dueCards(ids, systemClock());
            return new Set(isErr(r) ? [] : r.value.map((s) => s.cardId));
          },
          studiedCardIds: async (ids) => {
            if (ids.length === 0) return new Set<string>();
            // No bulk by-cards read on the SRS repo; the state list is small/local.
            const r = await session.srs.list();
            const idSet = new Set(ids);
            return new Set(isErr(r) ? [] : r.value.filter((s) => idSet.has(s.cardId)).map((s) => s.cardId));
          },
          listSessions: async () => {
            const r = await session.sessions.list();
            return isErr(r) ? [] : r.value;
          },
          attemptsBySession: async (id) => {
            const r = await session.attempts.listBySession(id);
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

  // Stay on the loading skeleton until the repositories resolve; mount the
  // controller only with real deps so its load effect runs exactly once.
  if (deps === null) {
    return <DashboardScreen data={{ status: 'loading' }} initialUi="loading" {...props} />;
  }
  return <LoadedDashboard deps={deps} {...props} />;
}

function LoadedDashboard({ deps, ...props }: DashboardContainerProps & { deps: DashboardDeps }) {
  const controller = useDashboard(deps);
  return <DashboardScreen data={controller.data} initialUi={controller.ui} {...props} />;
}
