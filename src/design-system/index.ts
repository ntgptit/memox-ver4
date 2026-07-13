/**
 * MemoX design system — public surface (ADR 0001).
 *
 * Screens import from here ONLY. Layers ship as they land:
 *   - tokens (WBS 1.1) — raw typed values; theme + components read these
 *   - theme  (WBS 1.2) — ThemeProvider + `useTheme`; resolves light/dark
 *   - fonts  (WBS 1.3), icons (WBS 1.4), components `Mx*` (WBS 1.5–1.7) — added next
 *
 * Screens use the theme + `Mx*` components; they never import `./tokens` directly
 * (one-way layering, enforced by WBS 0.12).
 */

export * from './theme';

// Tokens are re-exported for the theme/component layers and design tooling. Screens
// must not import raw tokens directly — that boundary is enforced by WBS 0.12's guard.
export { tokens } from './tokens';
export type { Tokens, ColorScheme, ColorRole } from './tokens';
