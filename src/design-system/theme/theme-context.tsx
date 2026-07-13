/**
 * ThemeProvider + hooks — WBS 1.2.
 *
 * Reads the system colour scheme (via the platform-aware `@/hooks/use-color-scheme`,
 * which handles web hydration) and a user override `mode` ('system' | 'light' |
 * 'dark'). Resolves the effective scheme and provides the pre-built {@link Theme}
 * to the tree. Toggling the mode reskins every component from tokens alone — no
 * component branches on the scheme (ADR 0004).
 *
 * The override is in-memory here; PERSISTING it (app_setting DB) belongs to the
 * theme settings slice (WBS 6.x / 10.1), which will call `setMode` from storage.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import type { ColorScheme } from '../tokens';
import { themes, type Theme } from './theme';

/** User theme preference. `system` follows the OS setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  /** The effective scheme after applying `mode` over the system scheme. */
  scheme: ColorScheme;
  /** The user preference; `system` defers to the OS. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function effectiveScheme(mode: ThemeMode, system: ColorScheme): ColorScheme {
  return mode === 'system' ? system : mode;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial preference; defaults to following the system scheme. */
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const systemScheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = effectiveScheme(mode, systemScheme);
    return { theme: themes[scheme], scheme, mode, setMode };
  }, [mode, systemScheme]);

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

/** Theme preference controls, for the theme settings screen (WBS 6.x). */
export function useThemeMode(): Pick<ThemeContextValue, 'mode' | 'setMode' | 'scheme'> {
  const { mode, setMode, scheme } = useThemeContext();
  return { mode, setMode, scheme };
}
