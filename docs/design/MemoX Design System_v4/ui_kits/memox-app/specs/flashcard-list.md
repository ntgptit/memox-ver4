# flashcard-list — Flashcard List — screen spec

> **Format.** Hand-maintained structural spec (`export_specs.mjs` absent). Sources of truth:
> `../_features/flashcard-list/FlashcardList.jsx` (+ `components/`), shared
> `../_shared/StatusCardRow.jsx`; PNGs `../shots/flashcard-list--<state>--<theme>.png`
> (390×780). Verify: `node tool/ui_kit_shots/shoot.mjs flashcard-list` (gated).

## Responsibility

Browse, study and manage the **flashcards in the deepest (final) deck**. CARDS ONLY — never a
SUBDECKS section, never Create subdeck. Primary CTA: add-card FAB → opens the Flashcard
Editor for create/edit.

## Shared anatomy

- **App bar** — `MxContextualAppBar variant="nested"`: back + deck title + search + More
  (→ Deck Settings). No notification, no avatar.
- **Breadcrumb** — shared `Breadcrumb` under the app bar: the path to this final deck
  (`Library › Korean TOPIK I › Numbers & counting`); ancestors tappable, current bold.
- **Filters** — `MxChip` row: All / New / Due / Mastered (horizontal scroll).
- **Section header** — the `CARDS` label carries the study aggregate as a compact muted
  annotation (`CARDS · 2 due · 2 mastered`); no separate full-width summary row.
- **Card list** — every card row is wrapped in the shared **`MxList`** (`components/surfaces/
  MxList.jsx`, 12px inter-card gap), so card spacing matches the deck / subdeck lists exactly
  (never dropped straight into the scroll body, which gaps at 24px).
- **Card rows** — shared `StatusCardRow` (`tightTerm clampMeaning`): a top row pins the term
  (primary, extrabold) and the status `MxBadge` (New / Due→error / Mastered→success) together;
  the meaning flows **full-width below**, **clamped to 2 lines** so every card keeps a uniform,
  bounded height however long the meaning is. When the meaning overflows, a **"Show more"**
  toggle (accent) expands it in place ("Show less" collapses) — the card only grows on demand,
  it never towers by default. Hidden cards render at 50% with a `visibility_off` glyph. The
  same component (with `truncateMeaning`) powers Search result rows (1-line, + deck line).
- **FAB** — `add`, accessible label "Add card". Opens Add sheet (Add card / Import cards —
  never Create subdeck).

## States (15, each light + dark)

| # | state | app bar | body summary |
| --- | --- | --- | --- |
| 1 | `loaded` | nested | summary + filters + CARDS list |
| 2 | `dense` | nested | 16 cards |
| 3 | `minimum-data` | nested | a single card |
| 4 | `long-text` | nested | very long meaning → 2-line clamp + "Show more" toggle (card height stays uniform) |
| 5 | `empty` | nested | EmptyState → Add card / Import cards |
| 6 | `search` | search | placeholder "Search cards", card results only |
| 7 | `no-results` | search | EmptyState (warning) |
| 8 | `filter-applied` | nested | Due filter active + "N due cards" + filtered list |
| 9 | `selection` | selection (count 2) | cards with check/radio, selected → primary-soft |
| 10 | `add-sheet` | nested | list under Scrim + Add sheet (Add card / Import cards) |
| 11 | `card-actions` | nested | single-card sheet (Edit / Move / Hide / Delete card) |
| 12 | `delete-confirm` | nested | centred ConfirmDialog (Delete this card?) |
| 13 | `loading` | nested | search skeleton + skeleton card rows |
| 14 | `offline` | nested | warning banner (cloud_off · Retry) + saved cards |
| 15 | `error` | nested | EmptyState (error) → Retry |

## Navigation

`Flashcard List → Add / Edit card → Flashcard Editor`. `More → Deck Settings`.

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; padding 16; item gap 12. Tokens only. Quoted strings
are MOCK COPY (source real strings from l10n). Touch targets ≥ 44×44. `Words` is never used
as a synonym for `cards` on this screen.
