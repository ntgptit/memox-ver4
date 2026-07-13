import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { SearchContainer, SearchScreen, SEARCH_FIXTURES, type SearchFixtureKey } from '@/features/search/ui';

/**
 * Search (WBS 4.6) — find a card by word or meaning.
 *
 * Default: the live container wired to the DB + settings. A `state` query param renders
 * a deterministic, DB-free fixture preview for the visual-golden harness; `theme=dark`
 * forces the dark scheme.
 */
export default function SearchRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in SEARCH_FIXTURES) {
    const view = SEARCH_FIXTURES[state as SearchFixtureKey];
    const noop = () => {};
    const preview = (
      <SearchScreen
        {...view}
        onQueryChange={noop}
        onClear={noop}
        onFilterChange={noop}
        onUseRecent={noop}
        onRemoveRecent={noop}
        onClearRecent={noop}
        onOpenHit={noop}
        onBack={() => router.back()}
      />
    );
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <SearchContainer onBack={() => router.back()} onOpenCard={(cardId) => router.push(`/card/${cardId}`)} />
  );
}
