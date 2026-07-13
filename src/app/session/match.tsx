import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { MatchModeContainer, MatchModeScreen, MATCH_FIXTURES, type MatchFixtureKey } from '@/features/session/ui';

/**
 * Match mode (WBS 6.2, session stage 2) — match meanings to terms for a deck's cards.
 *
 * Default: the live container wired to the card + session repositories. A `state` query
 * param renders a deterministic, DB-free fixture preview for the visual-golden harness;
 * `theme=dark` forces the dark scheme.
 */
export default function MatchRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in MATCH_FIXTURES) {
    const f = MATCH_FIXTURES[state as MatchFixtureKey];
    const preview = (
      <MatchModeScreen {...f} onTap={() => {}} onNext={() => router.back()} onBack={() => router.back()} />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <MatchModeContainer deckId={String(deckId ?? '')} onBack={() => router.back()} onDone={() => router.back()} />;
}
