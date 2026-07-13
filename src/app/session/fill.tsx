import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { FillModeContainer, FillModeScreen, FILL_FIXTURES, type FillFixtureKey } from '@/features/session/ui';

/**
 * Fill mode (WBS 7.2, session stage 5) — type the term for a deck's cards.
 *
 * Default: the live container wired to the card + session repositories. A `state` query
 * param renders a deterministic, DB-free fixture preview for the visual-golden harness;
 * `theme=dark` forces the dark scheme.
 */
export default function FillRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in FILL_FIXTURES) {
    const f = FILL_FIXTURES[state as FillFixtureKey];
    const noop = () => {};
    const preview = (
      <FillModeScreen
        {...f}
        onChangeInput={noop}
        onCheck={noop}
        onHint={noop}
        onNext={noop}
        onAccept={noop}
        onRetry={noop}
        onDone={() => router.back()}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <FillModeContainer deckId={String(deckId ?? '')} onBack={() => router.back()} onDone={() => router.back()} />;
}
