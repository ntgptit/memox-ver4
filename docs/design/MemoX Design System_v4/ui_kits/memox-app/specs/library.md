# library — Library — screen spec

> **Note on format.** Earlier specs in this folder were an auto-generated DOM dump
> produced by `tool/ui_kit_shots/export_specs.mjs`. **That exporter is not present in this
> repository**, so the per-node DOM dump cannot be refreshed and had gone stale (it still
> documented removed states such as *drawer / pair picker / sort menu / play sheet /
> overflow menu / error*). This file is therefore a **hand-maintained structural spec**.
> The sources of truth are the component source and the reference PNGs:
> - Source: `../_features/library/Library.jsx` (+ `_features/library/components/`, `../_shared/DeckCard.jsx`, `../_shared/DeckList.jsx`).
> - Shots: `../shots/library--<state>--<theme>.png` (390×780 frame, light + dark). See `../shots/INDEX.md`.
> - Verify renders/overflow with `node tool/ui_kit_shots/shoot.mjs library` (gated). Refresh these PNGs with `MXH_CANON=1 node tool/ui_kit_shots/shoot.mjs library`.

## Domain

`Library › Deck › Subdeck › Card`. A deck holds subdecks; there is **no** folder / collection
/ workspace grouping level anywhere in copy, icon, action, filter, or state.

## Shared anatomy

- **App bar** — `MxContextualAppBar` (`../../../components/surfaces/MxContextualAppBar.jsx`),
  variants used here: `root-contextual` (context "N decks · N due" over title "Library",
  search + avatar actions), `nested` (deck title + back + manage), `search` (inline field),
  `selection` ("N selected" + select-all + more).
- **Deck / subdeck rows** — shared `DeckCard` inside `DeckList` (standard **12px** inter-card
  gap). Anatomy: `[ visual ] [ title (≤2 lines, clamp) / meta ] [ trailing ]`.
  - Deck visual = `MxIconTile` (icon + accent tone); subdeck visual = progress **Ring**
    showing `NN%`, or a green check glyph at 100%.
  - Meta = exactly two groups: `N cards · <status>`, status semantic — due→warning,
    new→accent, up-to-date→success.
  - Trailing = quick-study `MxIconButton` (`bolt`); hidden in selection mode, where the
    visual becomes a check / radio indicator and the selected card uses the `primary-soft`
    variant.
- **Chrome** — `MxBottomNav` (Today / Library / Stats / Profile), `MxFab` (`add`),
  `FilterRow` (All decks · Filters · A–Z), `Scrim`+`Sheet` for overlays.

## States (16, each light + dark)

| # | state | app bar | body summary |
| --- | --- | --- | --- |
| 1 | `loaded` | root-contextual | FilterRow + DeckList of 6 decks |
| 2 | `dense` | root-contextual | 22 decks incl. long two-line titles (clamp) + `99+`/`1,280` counts |
| 3 | `deck-detail` | nested (deck title) | "N subdecks · N cards · N due" + SUBDECKS DeckList (rings show %) |
| 4 | `empty` | root-contextual | EmptyState → Create deck / Import cards |
| 5 | `empty-deck` | nested | EmptyState → Create subdeck / Add card |
| 6 | `subdeck-loading` | nested | summary skeleton + skeleton subdeck rows (round ring placeholder) |
| 7 | `subdeck-selection` | selection (count 2) | subdecks with check / radio, selected → primary-soft |
| 8 | `create-sheet` | root-contextual | list dimmed under Scrim + Create sheet (Add card / Create deck / Import) |
| 9 | `search-active` | search | RECENT section (history rows) |
| 10 | `search-results` | search | "N results" + DECKS + SUBDECKS (subdeck meta shows parent deck) |
| 11 | `search-no-results` | search | EmptyState (warning) → Clear search |
| 12 | `filter-applied` | root-contextual | active FilterRow + "N decks match · Due only" + Clear all + filtered list |
| 13 | `filter-sheet` | root-contextual | list under Scrim + Sort & filter sheet (Sort / Filter groups, Reset / Apply) |
| 14 | `selection` | selection (count 3) | root decks with check / radio, selected → primary-soft |
| 15 | `loading` | root-contextual | search skeleton + skeleton deck rows |
| 16 | `offline` | root-contextual | warning banner (cloud_off · Retry) + saved DeckList |

## Handoff notes

- Spacing scale `{4,8,12,16,24,32,48}`; screen padding 16; section gap 24; inter-card gap 12.
  No raw color/radius/typography/spacing above the token layer — use `--memox-*` tokens
  (light in `:root`, dark under `[data-theme="dark"]`).
- Every quoted string here is MOCK COPY; source real strings from the app's l10n, not this file.
- Touch targets ≥ 44×44 (icon controls reach it via a `::after` hit overlay even when the
  visual glyph is smaller).
