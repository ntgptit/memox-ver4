import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { DashboardContainer, DashboardScreen, DASHBOARD_FIXTURES, type DashboardFixtureKey } from '@/features/dashboard/ui';

/**
 * Dashboard / Today (WBS 5.3) — the root tab. Default: the live container wired
 * to the repositories. A `state` query param renders a deterministic, DB-free
 * fixture preview for the visual-golden harness; `theme=dark` forces dark.
 */
export default function TodayRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in DASHBOARD_FIXTURES) {
    const f = DASHBOARD_FIXTURES[state as DashboardFixtureKey];
    const preview = <DashboardScreen data={f.data} initialUi={f.ui} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <DashboardContainer
      onStartReview={() => router.push('/session/mode-picker')}
      onExploreDecks={() => router.push('/library')}
      onOpenDeck={(id) => router.push(`/deck/${id}`)}
      onSeeAllDecks={() => router.push('/library')}
      onAddCard={() => router.push('/card/new')}
      onCreateDeck={() => router.push('/deck/new/content')}
      onImportCards={() => router.push('/settings/import')}
      onSearch={() => router.push('/search')}
      // B7 (nav audit): the bell's notification surface is the reminder settings.
      onNotifications={() => router.push('/settings/reminders')}
    />
  );
}
