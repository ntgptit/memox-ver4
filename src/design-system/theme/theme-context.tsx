/**
 * ThemeProvider + hooks — WBS 1.2, extended for the theme screen (WBS 2.3).
 *
 * Holds the user's theme preferences — `mode` (system/light/dark), `accent`, and a
 * `textScale` — and resolves the active {@link Theme} from them + the system scheme.
 * Changing any preference reskins every component from tokens alone (ADR 0004).
 *
 * Persistence is decoupled: the app passes `initial*` values (hydrated from the
 * `app_setting` store) and an `onSettingsChange` callback the provider calls whenever
 * a preference changes, so the design system never imports the DB.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import type { ColorScheme } from '../tokens';
import { resolveTheme, type Theme, type AccentChoice } from './theme';

/** User theme preference. `system` follows the OS setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** The persistable theme settings the app hydrates + saves. */
export interface ThemeSettings {
  mode: ThemeMode;
  accent: AccentChoice;
  textScale: number;
}

interface ThemeContextValue extends ThemeSettings {
  theme: Theme;
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentChoice) => void;
  setTextScale: (textScale: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function effectiveScheme(mode: ThemeMode, system: ColorScheme): ColorScheme {
  return mode === 'system' ? system : mode;
}

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialAccent?: AccentChoice;
  initialTextScale?: number;
  /** Called whenever a preference changes, so the app can persist it. */
  onSettingsChange?: (settings: ThemeSettings) => void;
}

export function ThemeProvider({
  children,
  initialMode = 'system',
  initialAccent = 'brand',
  initialTextScale = 1,
  onSettingsChange,
}: ThemeProviderProps) {
  const systemScheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [accent, setAccentState] = useState<AccentChoice>(initialAccent);
  const [textScale, setTextScaleState] = useState<number>(initialTextScale);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      onSettingsChange?.({ mode: next, accent, textScale });
    },
    [accent, textScale, onSettingsChange],
  );
  const setAccent = useCallback(
    (next: AccentChoice) => {
      setAccentState(next);
      onSettingsChange?.({ mode, accent: next, textScale });
    },
    [mode, textScale, onSettingsChange],
  );
  const setTextScale = useCallback(
    (next: number) => {
      setTextScaleState(next);
      onSettingsChange?.({ mode, accent, textScale: next });
    },
    [mode, accent, onSettingsChange],
  );

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = effectiveScheme(mode, systemScheme);
    return {
      theme: resolveTheme(scheme, { accent, textScale }),
      scheme,
      mode,
      accent,
      textScale,
      setMode,
      setAccent,
      setTextScale,
    };
  }, [mode, accent, textScale, systemScheme, setMode, setAccent, setTextScale]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within a <ThemeProvider>. Mount it in src/app/_layout.tsx.');
  }
  return ctx;
}

/** The resolved {@link Theme} for the active scheme. The primary component hook. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** Theme preference controls, for the theme settings screen (WBS 2.3). */
export function useThemeSettings(): Omit<ThemeContextValue, 'theme'> {
  const { theme: _theme, ...rest } = useThemeContext();
  return rest;
}
