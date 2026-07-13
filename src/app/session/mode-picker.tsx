import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  ModePickerContainer,
  ModePickerScreen,
  MODE_PICKER_FIXTURES,
  type ModePickerFixtureKey,
} from '@/features/session/ui';

/**
 * Mode picker (WBS 5.4) — choose a study mode + card source for a deck, then start.
 *
 * Default: the live container wired to the card + SRS repositories. A `state` query
 * param renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function ModePickerRoute() {
  const router = useRouter();
  const { deckId, state, theme } = useLocalSearchParams<{ deckId?: string; state?: string; theme?: string }>();

  if (state && state in MODE_PICKER_FIXTURES) {
    const f = MODE_PICKER_FIXTURES[state as ModePickerFixtureKey];
    const preview = (
      <ModePickerScreen
        scope={f.scope}
        scopeCount={f.scopeCount}
        initialSheetOpen={f.initialSheetOpen}
        onScopeChange={() => {}}
        onStart={() => {}}
        onAddWords={() => {}}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  const id = String(deckId ?? '');
  return (
    <ModePickerContainer
      deckId={id}
      onBack={() => router.back()}
      onAddWords={() => router.push('/card/new')}
      onStart={(mode, scope) => router.push(`/session/${mode}?deckId=${id}&scope=${scope}`)}
    />
  );
}
