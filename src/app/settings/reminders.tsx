import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import { ReminderContainer, ReminderScreen, REMINDER_FIXTURES, type ReminderFixtureKey } from '@/features/settings/ui';

/**
 * Reminders (WBS 8.2) — daily study reminder settings. Default: the live
 * container (persists + schedules local notifications). A `state` query param
 * renders a deterministic, DB-free fixture preview for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function RemindersRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in REMINDER_FIXTURES) {
    const f = REMINDER_FIXTURES[state as ReminderFixtureKey];
    const preview = <ReminderScreen config={f.config} ui={f.ui} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return <ReminderContainer onBack={() => router.back()} />;
}
