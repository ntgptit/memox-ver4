import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { ImportContainer, ImportScreen, IMPORT_FIXTURES, type ImportFixtureKey } from '@/features/flashcards/ui';

/**
 * Import (WBS 9.1) — import cards from a file or pasted text. Default: the live
 * container (document picker + bulk insert into the target deck). A `state`
 * query param renders a deterministic, DB-free fixture preview for the
 * visual-golden harness; `theme=dark` forces the dark scheme.
 */
export default function ImportRoute() {
  const router = useRouter();
  const { state, theme, deckId } = useLocalSearchParams<{ state?: string; theme?: string; deckId?: string }>();

  if (state && state in IMPORT_FIXTURES) {
    const f = IMPORT_FIXTURES[state as ImportFixtureKey];
    const preview = <ImportScreen ui={f.ui} data={f.data} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <ImportContainer
      deckId={deckId}
      onBack={() => router.back()}
      onGoDeck={(id) => (id === null ? router.back() : router.push(`/deck/${id}`))}
    />
  );
}
