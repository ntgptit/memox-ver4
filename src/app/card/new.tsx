import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  FlashcardEditorContainer,
  FlashcardEditorScreen,
  FLASHCARD_EDITOR_FIXTURES,
  EDITOR_DECK,
  type FlashcardEditorFixtureKey,
} from '@/features/flashcards/ui';

/**
 * New card (WBS 4.4) — the create form, modal. Default: the live container. A
 * `state` query param renders a deterministic, DB-free fixture preview for the
 * visual-golden harness; `theme=dark` forces the dark scheme.
 */
export default function NewCardRoute() {
  const router = useRouter();
  const { deckId, subdeckId, state, theme } = useLocalSearchParams<{
    deckId?: string;
    subdeckId?: string;
    state?: string;
    theme?: string;
  }>();

  if (state && state in FLASHCARD_EDITOR_FIXTURES) {
    const f = FLASHCARD_EDITOR_FIXTURES[state as FlashcardEditorFixtureKey];
    const preview = <FlashcardEditorScreen deck={EDITOR_DECK} values={f.values} editing={f.editing} ui={f.ui} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <FlashcardEditorContainer
      deckId={deckId ?? ''}
      subdeckId={subdeckId}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      onViewExisting={() => router.back()}
    />
  );
}
