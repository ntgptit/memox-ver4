/**
 * PersistedThemeProvider (WBS 2.3) — wraps the design-system {@link ThemeProvider}
 * with app_setting persistence. On mount it opens the settings repository, loads the
 * saved theme preferences, and mounts the provider with them; every later change is
 * written back. Briefly renders nothing while the (fast, local) settings load, so
 * there is no flash of the default theme over the saved one.
 */

import { useEffect, useState, type ReactNode } from 'react';

import { ThemeProvider, type ThemeSettings } from '@/design-system';
import {
  createSettingsRepository,
  loadThemeSettings,
  saveThemeSettings,
  DEFAULT_THEME_SETTINGS,
  type SettingsRepository,
} from '@/features/settings/data';

interface Loaded {
  settings: ThemeSettings;
  repo: SettingsRepository | null;
}

export function PersistedThemeProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const repo = await createSettingsRepository();
      const settings = await loadThemeSettings(repo);
      if (alive) {
        setLoaded({ settings, repo });
      }
    })().catch(() => {
      // If persistence is unavailable, run with defaults (no persistence).
      if (alive) {
        setLoaded({ settings: DEFAULT_THEME_SETTINGS, repo: null });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loaded === null) {
    return null;
  }

  return (
    <ThemeProvider
      initialMode={loaded.settings.mode}
      initialAccent={loaded.settings.accent}
      initialTextScale={loaded.settings.textScale}
      onSettingsChange={(settings) => void saveThemeSettings(loaded.repo, settings)}
    >
      {children}
    </ThemeProvider>
  );
}
