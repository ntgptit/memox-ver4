import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemeProvider } from '@/design-system';
import {
  StudySettingsContainer,
  SettingsScreen,
  SETTINGS_FIXTURES,
  type SettingsFixtureKey,
  type StudyScreenKey,
} from '@/features/settings/ui';

const SCREEN_KEYS: readonly StudyScreenKey[] = ['worddisplay', 'srs', 'mode', 'voice'];

/**
 * Study settings (WBS 10.1) — the hub (`/settings/study`) and its child
 * screens (`?screen=worddisplay|srs|mode|voice`). Default: the live container
 * (persists via app_setting). A `state` query param renders a deterministic,
 * DB-free fixture preview for the visual-golden harness; `theme=dark` forces
 * the dark scheme.
 */
export default function StudySettingsRoute() {
  const router = useRouter();
  const { state, theme, screen } = useLocalSearchParams<{ state?: string; theme?: string; screen?: string }>();

  if (state && state in SETTINGS_FIXTURES) {
    const f = SETTINGS_FIXTURES[state as SettingsFixtureKey];
    const preview = <SettingsScreen ui={f.ui} settings={f.settings} onBack={() => router.back()} />;
    return theme === 'dark' ? <ThemeProvider initialMode="dark">{preview}</ThemeProvider> : preview;
  }

  const child = SCREEN_KEYS.find((k) => k === screen);
  return (
    <StudySettingsContainer
      screen={child}
      onBack={() => router.back()}
      onOpenStudy={(key) =>
        key === 'languages' ? router.push('/settings/languages') : router.push(`/settings/study?screen=${key}`)
      }
    />
  );
}
