import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { RecallModeContainer, RecallModeScreen, RECALL_FIXTURES, type RecallFixtureKey } from '@/features/session/ui';

/**
 * Recall mode (WBS 7.1, session stage 4) — reveal + self-grade a deck's cards.
 *
 * Default: the live container wired to the card + session repositories. A `state`
 * query param renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function RecallRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in RECALL_FIXTURES) {
    const f = RECALL_FIXTURES[state as RecallFixtureKey];
    const noop = () => {};
    const preview = (
      <RecallModeScreen
        {...f}
        onReveal={noop}
        onForgot={noop}
        onRemembered={noop}
        onNext={() => router.back()}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <RecallModeContainer deckId={String(deckId ?? '')} onBack={() => router.back()} onDone={() => router.back()} />;
}
