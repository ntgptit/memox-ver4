import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  ReviewModeContainer,
  ReviewModeScreen,
  REVIEW_MODE_FIXTURES,
  type ReviewModeFixtureKey,
} from '@/features/session/ui';

/**
 * Review mode (WBS 6.1, session stage 1) — browse a deck's cards with inline
 * edit and pronunciation. Default: the live container. A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function ReviewRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in REVIEW_MODE_FIXTURES) {
    const f = REVIEW_MODE_FIXTURES[state as ReviewModeFixtureKey];
    const preview = <ReviewModeScreen data={f.data} ui={f.ui} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <ReviewModeContainer
      deckId={String(deckId ?? '')}
      onBack={() => router.back()}
      onStudyNow={() => router.replace(deckId ? `/session/mode-picker?deckId=${deckId}` : '/session/mode-picker')}
    />
  );
}
