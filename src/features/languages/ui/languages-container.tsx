/**
 * Languages container (WBS 3.3) — resolves the production repositories + runtime
 * services, drives the controller, and renders the screen. This is the only place
 * that touches the concrete DB wiring; the screen and controller stay testable.
 */

import { useEffect, useState } from 'react';

import { createLibraryRepositories } from '@/features/library/data';
import { randomId, systemClock } from '@/shared/runtime';

import { LanguagesScreen } from './languages-screen';
import { useLanguages, type LanguagesDeps } from './use-languages';

export function LanguagesContainer({ onBack }: { onBack?: () => void }) {
  const [deps, setDeps] = useState<LanguagesDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void createLibraryRepositories().then((repos) => {
      if (!alive) return;
      setDeps({
        languagePairs: repos.languagePairs,
        decks: repos.decks,
        ids: randomId,
        clock: systemClock,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useLanguages(deps);

  return (
    <LanguagesScreen
      data={ctrl.data}
      onBack={onBack}
      onRetry={ctrl.retry}
      onAdd={ctrl.add}
      onRemove={ctrl.remove}
    />
  );
}
