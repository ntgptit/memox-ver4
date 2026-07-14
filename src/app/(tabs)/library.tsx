import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { LibraryContainer, LibraryScreen, LIBRARY_FIXTURES, type LibraryFixtureKey } from '@/features/library/ui';

/**
 * Library (WBS 3.4) — the root Library tab.
 *
 * Default: the live container wired to the repositories. A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden harness
 * (`tool/app_golden`); `theme=dark` forces the dark scheme.
 */
export default function LibraryRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in LIBRARY_FIXTURES) {
    const f = LIBRARY_FIXTURES[state as LibraryFixtureKey];
    const preview = <LibraryScreen data={f.data} initialUi={f.ui} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <LibraryContainer
      onOpenDeck={(id) => router.push(`/deck/${id}`)}
      onStudyDeck={(id) => router.push(`/session/mode-picker?deckId=${id}`)}
      onCreateDeck={() => router.push('/deck/new/content')}
      onAddCard={() => router.push('/card/new')}
      onImport={() => router.push('/settings/import')}
    />
  );
}
