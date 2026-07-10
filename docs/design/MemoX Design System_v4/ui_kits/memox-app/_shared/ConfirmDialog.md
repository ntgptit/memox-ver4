# ConfirmDialog — shared composite

A centered confirm overlay: `Scrim` (dimmed backdrop) + `Dialog` (icon, title,
body, action row). Carries no copy of its own — the caller passes every string,
node id and action. Lives in `_shared/` because it is used by **6 sites across 3
screens** (study-session exit + save-error; deck-settings delete / reset /
deck-delete; drawer remove-language).

```jsx
<window.ConfirmDialog align="center" scrimNode="deck-settings/delete-scrim"
  icon="delete" tone="error" title="Delete this card?"
  text="The card will be removed from this deck. This can't be undone."
  dialogNode="deck-settings/delete-dialog"
  actions={<React.Fragment>
    <MxButton variant="ghost" block node="deck-settings/delete-cancel">Cancel</MxButton>
    <MxButton variant="primary" danger block node="deck-settings/delete-ok">Delete</MxButton>
  </React.Fragment>} />
```

## Props
- `align` — Scrim alignment; `center` (default) for dialogs, `end` for sheets.
- `scrimNode` / `dialogNode` — `data-mx-node` ids for the backdrop and the dialog.
- `icon` — Material Symbols name shown in the dialog header.
- `tone` — `warning` | `error` (drives the icon tint via `Dialog`); `null` = neutral.
- `title` / `text` — heading + body copy.
- `actions` — the button row (typically a ghost cancel + a primary/`danger` confirm).

## States
The dialog itself is static; its meaning comes from `tone` + `actions`:
- **warning** — reversible-but-significant (leave session, reset progress).
- **error / destructive** — data loss (delete card/deck, remove pair); confirm
  button uses `danger`.

## Rules
- Exactly one primary/confirm action; cancel is always `variant="ghost"`.
- Destructive confirm → `tone="error"` + `danger` on the confirm button.
- Never hardcode copy inside `ConfirmDialog`; pass it from the calling screen so
  l10n and node ids stay owned by that screen.

## Flutter target
- Component → a `showMxConfirmDialog(...)` helper / shared confirm dialog widget
  (Material `showDialog` hosting an `MxCard`-styled body).
- `icon` → `MxIconTile`/Material symbol · `tone` → `MxColors` role · `title`/`text`
  → `MxTypography.title` / `.body` · `actions` → `MxButton` row.
- `scrimNode` / `dialogNode` → `ValueKey`s on the barrier + dialog (parity).
