import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  DeckContentChoiceContainer,
  DeckContentChoiceScreen,
  DECK_CONTENT_CHOICE_FIXTURES,
  type DeckContentChoiceFixtureKey,
} from '@/features/library/ui';
import type { DeckOrganisation } from '@/features/library/domain';
import { ok } from '@/shared';

/**
 * Deck content choice (WBS 3.6) — name + organise a new empty deck, then route to
 * subdeck-list (subdecks) or flashcard-list (cards).
 *
 * Default: the live container wired to the deck repository. A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden harness;
 * `theme=dark` forces the dark scheme.
 */
export default function DeckContentChoiceRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId: string; state?: string; theme?: string }>();

  const go = (organisation: DeckOrganisation, id: string) => {
    router.replace(organisation === 'subdecks' ? `/deck/${id}` : `/deck/${id}/cards`);
  };
  const goAddPair = () => router.push('/settings/languages');

  if (state && state in DECK_CONTENT_CHOICE_FIXTURES) {
    const preview = (
      <DeckContentChoiceScreen
        deckName={DECK_CONTENT_CHOICE_FIXTURES[state as DeckContentChoiceFixtureKey].deckName}
        onBack={() => router.back()}
        onImport={() => {}}
        onSubmit={async () => ok(undefined)}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <DeckContentChoiceContainer
      deckId={String(deckId)}
      onBack={() => router.back()}
      // C1 (nav audit): "Import from a file" goes to the IMPORT flow — the old
      // target `/deck/new/cards` was the card list of a not-yet-existing deck.
      onImport={() =>
        router.push(deckId === 'new' ? '/settings/import' : `/settings/import?deckId=${String(deckId)}`)
      }
      onChosen={go}
      onNeedLanguagePair={goAddPair}
    />
  );
}
