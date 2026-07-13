/**
 * Theme (WBS 1.2) public surface — the provider, hooks, and resolved `Theme` type.
 */

export { resolveTheme, themes } from './theme';
export type { Theme, ThemeFont, TextStyleSpec } from './theme';
export { ThemeProvider, useTheme, useThemeMode } from './theme-context';
export type { ThemeMode, ThemeProviderProps } from './theme-context';
