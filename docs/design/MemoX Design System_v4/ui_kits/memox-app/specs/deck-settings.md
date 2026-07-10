# deck-settings — Deck Settings — screen spec

> **Format.** Hand-maintained structural spec (`export_specs.mjs` absent). Sources of truth:
> `../_features/deck-settings/DeckSettings.jsx` + shared `../_shared/DeckActionsSheet.jsx`,
> `DeckMoveSheet.jsx`, `DeckResetConfirmDialog.jsx`, `DeckDeleteConfirmDialog.jsx`; PNGs
> `../shots/deck-settings--<state>--<theme>.png` (390×780). Verify:
> `node tool/ui_kit_shots/shoot.mjs deck-settings` (gated).

## Responsibility

Manage **deck metadata and lifecycle actions**: rename, move, export, reset progress, delete.
Opened from the "More" action of the Subdeck List / Flashcard List. **Never shows a content
list** — no subdeck or card rows. Composes the shared `Deck*` overlays over a title-only
backdrop.

## States (5, each light + dark)

| # | state | overlay |
| --- | --- | --- |
| 1 | `action-sheet` | `DeckActionsSheet` — Rename / Move / Export / Reset progress / Delete deck |
| 2 | `rename` | centred Dialog with a name input (Cancel / Save) |
| 3 | `move` | `DeckMoveSheet` — destination ListRows (root, another deck, "This deck" muted) + Move |
| 4 | `reset-confirm` | `DeckResetConfirmDialog` — centred error ConfirmDialog (Cancel / Reset) |
| 5 | `delete-confirm` | `DeckDeleteConfirmDialog` — centred error ConfirmDialog (Cancel / Delete) |

## Entry point

Subdeck List and Flashcard List both expose a `More` app-bar action that opens Deck Settings.
Rename / delete / reset are **not** placed directly on the content lists.

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; tokens only. Destructive actions use the `error` tone
and a confirm dialog. Quoted strings are MOCK COPY. Touch targets ≥ 44×44.
