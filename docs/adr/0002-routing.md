# ADR 0002 — Expo Router strategy (WBS 0.2)

- **Status:** Accepted
- **Date:** 2026-07-13
- **WBS:** 0.2 Expo Router strategy
- **Depends on:** ADR 0001 (folder architecture)

## Context

WBS 0.2 requires a route tree mapping every non-shared registry screen (25 business screens; `app-bar` is shared shell, not a route) to exactly one Expo Router route, with typed routes that build and back / deep-link behaviour specified per screen.

## Decision

File-based routing under `src/app/`. Three route groups plus a deck-detail stack and modal routes. Route files are thin — each imports and renders its feature screen (currently a `RoutePlaceholder`, replaced by the feature slice). Providers (theme, db, safe-area) mount in the root `_layout` as WBS 1.2 / 0.4 land.

### Route tree → screen map

| Registry screen | Route file | Group / presentation | Back / deep-link |
|---|---|---|---|
| dashboard | `(tabs)/index.tsx` | tab (Today) | tab root; deep-link `/` |
| library | `(tabs)/library.tsx` | tab | tab root; `/library` |
| statistics | `(tabs)/stats.tsx` | tab | tab root; `/stats` |
| settings | `(tabs)/profile.tsx` | tab (Profile) | tab root; `/profile` |
| subdeck-list | `deck/[deckId]/index.tsx` | deck stack | back → library; `/deck/:deckId` |
| flashcard-list | `deck/[deckId]/cards.tsx` | deck stack | back → deck; `/deck/:deckId/cards` |
| deck-content-choice | `deck/[deckId]/content.tsx` | deck stack | back → deck; shown for a new empty deck |
| deck-settings | `deck/[deckId]/settings.tsx` | deck stack | back → deck; `/deck/:deckId/settings` |
| flashcard-editor (create) | `card/new.tsx` | **modal** | dismiss → caller; `/card/new?deckId=` |
| flashcard-editor (edit) | `card/[cardId].tsx` | **modal** | dismiss → caller; `/card/:cardId` |
| search | `search.tsx` | **modal** | dismiss → caller; `/search` |
| mode-picker | `session/mode-picker.tsx` | session stack | back → caller; `/session/mode-picker` |
| study-session | `session/play.tsx` | session stack | guarded exit (confirm); `/session/play` |
| review-mode | `session/review.tsx` | session stack | within session; standalone from mode-picker |
| match-mode | `session/match.tsx` | session stack | within session |
| guess-mode | `session/guess.tsx` | session stack | within session |
| recall-mode | `session/recall.tsx` | session stack | within session |
| fill-mode | `session/fill.tsx` | session stack | within session |
| study-result | `session/result.tsx` | session stack | back replaced → Today (session done) |
| player | `player.tsx` | **modal** | dismiss → caller; `/player?deckId=` |
| theme | `settings/theme.tsx` | settings stack | back → settings |
| reminder | `settings/reminders.tsx` | settings stack | back → settings |
| languages | `settings/languages.tsx` | settings stack | back → settings |
| import | `settings/import.tsx` | settings stack | back → settings |
| export | `settings/export.tsx` | settings stack | back → settings |
| account-sync | `settings/account.tsx` | settings stack | back → settings |

`app-bar` (registry, 8 states) is the shared `MxContextualAppBar` rendered inside these routes (WBS 1.5 / 2.2), not its own route.

### Layouts

- `_layout.tsx` — root `Stack`; declares the four modal routes (`presentation: 'modal'`) and hides the header on the grouped stacks.
- `(tabs)/_layout.tsx` — `Tabs` with Today / Library / Stats / Profile (destinations only; "Add" is a FAB). Material Symbols tab icons + the MemoX bottom-nav visual arrive with WBS 1.6.
- `session/_layout.tsx`, `settings/_layout.tsx`, `deck/[deckId]/_layout.tsx` — nested `Stack`s.
- `+not-found.tsx` — 404.

### Typed routes

`typedRoutes: true` is already set in `app.json`. Route files avoid typed `href` literals until the generated route types exist (produced by `expo start`/`expo export`); `<Link>` targets use the generated types once available. `tsc --noEmit` and `expo lint` pass on the tree.

## Consequences

- Every business screen has exactly one route; the map is the single source for navigation + deep links.
- Sheets/editors are modals; the study flow is an isolated stack with a guarded exit.
- Feature slices replace each `RoutePlaceholder` with the real screen at the mapped path without changing the route graph.
- Starter routes `src/app/{index,explore}.tsx` are retired (replaced by the tab group).
