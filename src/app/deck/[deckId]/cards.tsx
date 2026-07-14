import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  FlashcardListContainer,
  FlashcardListScreen,
  FLASHCARD_LIST_FIXTURES,
  type FlashcardListFixtureKey,
} from '@/features/flashcards/ui';

/**
 * Flashcard list (WBS 4.3) — the final deck's card list. Default: the live container
 * wired to the repositories. A `state` query param renders a deterministic, DB-free
 * fixture preview for the visual-golden harness; `theme=dark` forces the dark scheme.
 */
export default function FlashcardListRoute() {
  const router = useRouter();
  const { deckId, subdeckId, state, theme } = useLocalSearchParams<{
    deckId: string;
    subdeckId?: string;
    state?: string;
    theme?: string;
  }>();

  if (state && state in FLASHCARD_LIST_FIXTURES) {
    const f = FLASHCARD_LIST_FIXTURES[state as FlashcardListFixtureKey];
    const preview = (
      <FlashcardListScreen data={f.data} deckTitle="Numbers & counting" initialUi={f.ui} onBack={() => router.back()} />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <FlashcardListContainer
      deckId={deckId}
      subdeckId={subdeckId}
      onBack={() => router.back()}
      onAddCard={() => router.push('/card/new')}
      onImportCards={() => router.push('/settings/import')}
      onDeckSettings={() => router.push(`/deck/${deckId}/settings`)}
      onEditCard={(id) => router.push(`/card/${id}`)}
    />
  );
}
