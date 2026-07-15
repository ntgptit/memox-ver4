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
 * Study settings hub (WBS 10.1 / 12.2) — children live at their own pathnames
 * (`/settings/study/<screen>`): a same-pathname query push is swallowed by
 * expo-router on web (2026-07-15 audit defect 2), so hub rows push the child
 * routes. Legacy `?screen=` deep links keep working by rendering the child
 * here. A `state` query param renders a deterministic, DB-free fixture preview
 * for the visual-golden harness; `theme=dark` forces the dark scheme.
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
        key === 'languages' ? router.push('/settings/languages') : router.push(`/settings/study/${key}`)
      }
    />
  );
}
