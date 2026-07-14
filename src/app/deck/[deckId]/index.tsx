import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  SubdeckListContainer,
  SubdeckListScreen,
  SUBDECK_LIST_FIXTURES,
  SUBDECK_TRAIL_DEEP,
  type SubdeckListFixtureKey,
} from '@/features/library/ui';

/**
 * Subdeck list (WBS 3.5) — the deck's subdeck tree level, reached from the Library.
 *
 * Default: the live container wired to the repositories. A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden harness;
 * `theme=dark` forces the dark scheme.
 */
export default function SubdeckListRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId: string; state?: string; theme?: string }>();

  if (state && state in SUBDECK_LIST_FIXTURES) {
    const f = SUBDECK_LIST_FIXTURES[state as SubdeckListFixtureKey];
    const preview = (
      <SubdeckListScreen
        data={f.data}
        deckTitle={state === 'deep' ? 'Irregular verbs' : 'Korean TOPIK I'}
        trail={state === 'deep' ? SUBDECK_TRAIL_DEEP : undefined}
        initialUi={f.ui}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <SubdeckListContainer
      deckId={deckId}
      onBack={() => router.back()}
      onOpenSubdeck={(id) => router.push(`/deck/${deckId}/cards?subdeckId=${id}`)}
      onDeckSettings={() => router.push(`/deck/${deckId}/settings`)}
      onCreateSubdeck={() => router.push(`/deck/${deckId}/content`)}
      onStartSession={() => router.push(`/session/play?deckId=${deckId}`)}
      onSingleMode={() => router.push(`/session/mode-picker?deckId=${deckId}`)}
      onListen={() => router.push(`/player?deckId=${deckId}`)}
    />
  );
}
