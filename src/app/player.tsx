import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { PlayerContainer, PlayerScreen, PLAYER_FIXTURES, type PlayerFixtureKey } from '@/features/session/ui';

/**
 * Player (WBS 7.3) — hands-free audio playback of a deck, modal. Default: the
 * live container. A `state` query param renders a deterministic, DB-free
 * fixture preview for the visual-golden harness; `theme=dark` forces dark.
 */
export default function PlayerRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in PLAYER_FIXTURES) {
    const f = PLAYER_FIXTURES[state as PlayerFixtureKey];
    const preview = <PlayerScreen data={f.data} ui={f.ui} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <PlayerContainer deckId={String(deckId ?? '')} onBack={() => router.back()} />;
}
