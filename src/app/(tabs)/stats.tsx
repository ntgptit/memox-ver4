import { useLocalSearchParams } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { StatisticsContainer, StatisticsScreen, STATISTICS_FIXTURES, type StatisticsFixtureKey } from '@/features/stats/ui';

/**
 * Statistics (WBS 8.1) — the Stats tab. Default: the live container. A `state`
 * query param renders a deterministic, DB-free fixture preview for the
 * visual-golden harness; `theme=dark` forces the dark scheme.
 */
export default function StatsRoute() {
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in STATISTICS_FIXTURES) {
    const f = STATISTICS_FIXTURES[state as StatisticsFixtureKey];
    const preview = <StatisticsScreen data={f.data} scope={f.scope} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <StatisticsContainer />;
}
