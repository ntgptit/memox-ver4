import { useLocalSearchParams, useRouter } from 'expo-router';

import { FlashcardEditorContainer } from '@/features/flashcards/ui';

/**
 * Edit card (WBS 4.4) — the edit form, modal, wired to the live container. The
 * fixture preview for edit-shaped states lives on /card/new?state=… (one preview
 * route per screen — same pattern as the other slices).
 */
export default function EditCardRoute() {
  const router = useRouter();
  const { cardId, deckId } = useLocalSearchParams<{ cardId: string; deckId?: string }>();

  return (
    <FlashcardEditorContainer
      deckId={deckId ?? ''}
      cardId={cardId}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      onViewExisting={() => router.back()}
    />
  );
}
