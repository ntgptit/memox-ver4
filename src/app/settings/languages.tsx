import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  LanguagesContainer,
  LanguagesScreen,
  LANGUAGES_FIXTURES,
  type LanguagesFixtureKey,
} from '@/features/languages/ui';
import { ok } from '@/shared';

/**
 * Language pairs (WBS 3.3), reached from Settings › Study settings.
 *
 * By default this renders the live container wired to the repositories. A `state`
 * query param renders a deterministic, DB-free fixture preview instead — used by the
 * visual-golden harness (`tool/app_golden`) to shoot each canonical state; `theme=dark`
 * forces the dark scheme for the dark baseline.
 */
export default function LanguagesRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  // `add` is a sub-view (mode), not a data state — preview it over the empty list.
  const isPreview = state === 'add' || (!!state && state in LANGUAGES_FIXTURES);
  if (isPreview) {
    const dataKey: LanguagesFixtureKey = state === 'add' ? 'empty' : (state as LanguagesFixtureKey);
    const preview = (
      <LanguagesScreen
        data={LANGUAGES_FIXTURES[dataKey]}
        initialMode={state === 'add' ? 'add' : 'list'}
        onBack={() => router.back()}
        onRetry={() => {}}
        onAdd={async () => ok(undefined)}
        onRemove={async () => ok(undefined)}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <LanguagesContainer onBack={() => router.back()} />;
}
