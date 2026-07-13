/**
 * Theme (WBS 1.2) public surface — the provider, hooks, and resolved `Theme` type.
 */

export { resolveTheme, themes } from './theme';
export type { Theme, ThemeFont, TextStyleSpec, AccentChoice, ThemeOptions } from './theme';
export { ThemeProvider, useTheme, useThemeSettings } from './theme-context';
export type { ThemeMode, ThemeSettings, ThemeProviderProps } from './theme-context';
