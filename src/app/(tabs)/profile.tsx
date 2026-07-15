import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  SettingsRootContainer,
  SettingsScreen,
  SETTINGS_FIXTURES,
  type SettingsFixtureKey,
} from '@/features/settings/ui';

const OPEN_ROUTES: Record<string, string> = {
  study: '/settings/study',
  theme: '/settings/theme',
  reminders: '/settings/reminders',
  export: '/settings/export',
};

/**
 * Settings root (WBS 10.1, tab destination) — profile card + STUDY/APP rows.
 * Default: the live container. A `state` query param renders a deterministic,
 * DB-free fixture preview (loaded / value-picker) for the visual-golden
 * harness; `theme=dark` forces the dark scheme.
 */
export default function SettingsRootRoute() {
  const router = useRouter();
  const { state, theme } = useLocalSearchParams<{ state?: string; theme?: string }>();

  if (state && state in SETTINGS_FIXTURES) {
    const f = SETTINGS_FIXTURES[state as SettingsFixtureKey];
    const preview = <SettingsScreen ui={f.ui} settings={f.settings} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  return (
    <SettingsRootContainer
      onOpen={(key) => {
        const route = OPEN_ROUTES[key];
        // Backup/Restore is WBS 10.3 — no destination yet.
        if (route !== undefined) router.push(route);
      }}
    />
  );
}
