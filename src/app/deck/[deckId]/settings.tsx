import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  DeckSettingsContainer,
  DeckSettingsScreen,
  DECK_SETTINGS_FIXTURE,
  DECK_SETTINGS_OVERLAYS,
} from '@/features/library/ui';
import { ok } from '@/shared';

/**
 * Deck settings (WBS 4.5) — rename / move / reset / delete a deck via overlays.
 *
 * Default: the live container wired to the repositories. A `state` query param renders
 * a deterministic, DB-free fixture preview for the visual-golden harness; `theme=dark`
 * forces the dark scheme.
 */
export default function DeckSettingsRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in DECK_SETTINGS_OVERLAYS) {
    const preview = (
      <DeckSettingsScreen
        deckTitle={DECK_SETTINGS_FIXTURE.deckTitle}
        languagePairs={DECK_SETTINGS_FIXTURE.languagePairs}
        currentPairId={DECK_SETTINGS_FIXTURE.currentPairId}
        initialOverlay={DECK_SETTINGS_OVERLAYS[state]}
        onRename={async () => ok(undefined)}
        onMove={async () => ok(undefined)}
        onReset={async () => ok(undefined)}
        onDelete={async () => ok(undefined)}
        onExport={() => {}}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  const id = String(deckId ?? '');
  return (
    <DeckSettingsContainer
      deckId={id}
      onBack={() => router.back()}
      onDeleted={() => router.replace('/(tabs)/library')}
      onExport={() => router.push('/settings/export')}
    />
  );
}
