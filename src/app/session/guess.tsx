import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { GuessModeContainer, GuessModeScreen, GUESS_FIXTURES, type GuessFixtureKey } from '@/features/session/ui';

/**
 * Guess mode (WBS 6.3, session stage 3) — pick the right meaning for a deck's cards.
 *
 * Default: the live container wired to the card + session repositories. A `state` query
 * param renders a deterministic, DB-free fixture preview for the visual-golden harness;
 * `theme=dark` forces the dark scheme.
 */
export default function GuessRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in GUESS_FIXTURES) {
    const f = GUESS_FIXTURES[state as GuessFixtureKey];
    const noop = () => {};
    const preview = (
      <GuessModeScreen
        {...f}
        onPick={noop}
        onContinue={noop}
        onDone={() => router.back()}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <GuessModeContainer deckId={String(deckId ?? '')} onBack={() => router.back()} onDone={() => router.back()} />;
}
