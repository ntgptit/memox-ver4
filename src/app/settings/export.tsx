import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { ExportContainer, ExportScreen, EXPORT_FIXTURES, type ExportFixtureKey } from '@/features/flashcards/ui';

/**
 * Export (WBS 9.2) — write a deck to a shareable file. Default: the live
 * container (serialize + expo-file-system/expo-sharing delivery). A `state`
 * query param renders a deterministic, DB-free fixture preview for the
 * visual-golden harness; `theme=dark` forces the dark scheme.
 */
export default function ExportRoute() {
  const router = useRouter();
  const { state, theme, deckId } = useLocalSearchParams<{ state?: string; theme?: string; deckId?: string }>();

  if (state && state in EXPORT_FIXTURES) {
    const f = EXPORT_FIXTURES[state as ExportFixtureKey];
    const preview = <ExportScreen ui={f.ui} data={f.data} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <ExportContainer deckId={deckId} onBack={() => router.back()} />;
}
