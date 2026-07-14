import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  StudySessionContainer,
  StudySessionScreen,
  STUDY_SESSION_STATES,
  type StudySessionUiState,
} from '@/features/session/ui';

/**
 * Study session (WBS 5.5) — the 5-stage NewLearn orchestrator (or due-review
 * round via `mode=due`). Default: the live container. A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function StudySessionRoute() {
  const router = useRouter();
  const { deckId, mode, state, theme } = useLocalSearchParams<{
    deckId?: string;
    mode?: string;
    state?: string;
    theme?: string;
  }>();

  if (state && (STUDY_SESSION_STATES as readonly string[]).includes(state)) {
    const preview = <StudySessionScreen ui={state as StudySessionUiState} onClose={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <StudySessionContainer
      deckId={String(deckId ?? '')}
      mode={mode === 'due' ? 'due' : 'full'}
      onDone={(sessionId) =>
        router.replace(`/session/result?sessionId=${sessionId}${deckId ? `&deckId=${deckId}` : ''}`)
      }
      onLeave={() => router.back()}
    />
  );
}
