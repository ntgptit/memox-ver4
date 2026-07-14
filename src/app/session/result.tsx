import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  StudyResultContainer,
  StudyResultScreen,
  STUDY_RESULT_FIXTURES,
  type StudyResultFixtureKey,
} from '@/features/session/ui';

/**
 * Study result (WBS 7.4) — the terminal session summary. Default: the live
 * container (finalizes the session, numbers from the DB). A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function StudyResultRoute() {
  const router = useRouter();
  const { sessionId, deckId, state, theme } = useLocalSearchParams<{
    sessionId?: string;
    deckId?: string;
    state?: string;
    theme?: string;
  }>();

  if (state && state in STUDY_RESULT_FIXTURES) {
    const f = STUDY_RESULT_FIXTURES[state as StudyResultFixtureKey];
    const preview = <StudyResultScreen data={f.data} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  const toLibrary = () => router.replace('/library');
  return (
    <StudyResultContainer
      sessionId={sessionId ?? ''}
      onContinue={() => router.replace(deckId ? `/session/mode-picker?deckId=${deckId}` : '/session/mode-picker')}
      onLater={toLibrary}
      onReviewWrong={() => router.replace(deckId ? `/session/recall?deckId=${deckId}` : '/library')}
      onReviewMistakes={() => router.replace(deckId ? `/session/recall?deckId=${deckId}` : '/library')}
      onLibrary={toLibrary}
      onFinalizeLater={toLibrary}
    />
  );
}
