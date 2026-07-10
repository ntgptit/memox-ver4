# subdeck-list — Subdeck List — screen spec

> **Format.** Hand-maintained structural spec (the DOM-dump exporter `export_specs.mjs` is
> absent from this repo). Sources of truth: `../_features/subdeck-list/SubdeckList.jsx`
> (+ `components/`), shared `../_shared/DeckCard.jsx`, `../../../components/surfaces/MxList.jsx` and the Library
> `SubdeckCard`; reference PNGs `../shots/subdeck-list--<state>--<theme>.png` (390×780).
> Verify: `node tool/ui_kit_shots/shoot.mjs subdeck-list` (gated). Refresh PNGs:
> `MXH_CANON=1 node tool/ui_kit_shots/shoot.mjs subdeck-list`.

## Responsibility

Browse and manage the **subdecks inside the current deck**. SUBDECKS ONLY — never a CARDS
section, never Add card. The same screen is reused at every tree level
(Korean › TOPIK I › Grammar › …). Primary CTA: create-subdeck FAB.

## Shared anatomy

- **App bar** — `MxContextualAppBar variant="nested"`: back + current deck title + two right
  actions (search, More → Deck Settings). No notification, no avatar.
- **Breadcrumb** — shared `Breadcrumb` (`../_shared/Breadcrumb.jsx`) directly under the app
  bar: the deck path (`Library › Korean TOPIK I › …`). Ancestors are tappable; the current
  level is bold. A deep path collapses its middle to a tappable `…`; the row scrolls
  horizontally as a fallback.
- **Section header** — the `SUBDECKS` label carries the deck aggregate as a compact muted
  annotation (`SUBDECKS · 217 cards · 23 due`); there is no separate full-width summary row.
  The subdeck count is omitted (obvious from the list).
- **Subdeck rows** — shared Library `SubdeckCard` inside `MxList` (12px gap). A subdeck IS
  a deck one level down, so it uses the **same anatomy as a top-level deck**: an **icon tile**
  (icon + accent tone) · title (≤2 lines) · `N cards · <status>` meta (due→warning,
  new→accent, up-to-date→success) · quick-study `bolt` trailing (hidden in selection, where
  the visual becomes check/radio and the selected card is `primary-soft`). Deck is the
  standard — subdecks do not diverge into a different visual (e.g. a progress ring).
- **FAB** — `add`, accessible label "Create subdeck". Opens Create sheet (Create subdeck /
  Import subdecks — never Add card).

## States (12, each light + dark)

| # | state | app bar | body summary |
| --- | --- | --- | --- |
| 1 | `loaded` | nested | breadcrumb + SUBDECKS MxList (aggregate annotated on the section label) |
| 2 | `dense` | nested | 20 subdecks incl. long two-line titles + `99+`/`1,280` |
| 3 | `deep` | nested | deeply-nested level: breadcrumb collapses its middle to `…` |
| 4 | `empty` | nested | EmptyState "No subdecks yet" → Create subdeck |
| 5 | `search` | search | placeholder "Search subdecks", subdeck results only |
| 6 | `no-results` | search | EmptyState (warning) → Clear search |
| 7 | `selection` | selection (count 2) | subdecks with check/radio, selected → primary-soft |
| 8 | `create-sheet` | nested | list under Scrim + Create sheet (Create subdeck / Import subdecks) |
| 9 | `subdeck-actions` | nested | single-subdeck sheet (Study / Rename / Move / Delete subdeck) |
| 10 | `loading` | nested | summary skeleton + skeleton subdeck rows (round ring placeholder) |
| 11 | `offline` | nested | warning banner (cloud_off · Retry) + saved subdecks |
| 12 | `error` | nested | EmptyState (error) → Retry |

## Navigation

`Subdeck List → open a nested subdeck with more subdecks → Subdeck List` (recursive).
`Subdeck List → open the deepest subdeck → Flashcard List`. `More → Deck Settings`.

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; padding 16; inter-card gap 12. Tokens only
(`--memox-*`). Quoted strings are MOCK COPY. Touch targets ≥ 44×44. No folder / card
terminology anywhere on this screen.
