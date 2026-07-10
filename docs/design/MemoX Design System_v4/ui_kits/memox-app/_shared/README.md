# `_shared/` — app-level composites used by 2+ screens

Components here are **app-level composites** (assembled from `Mx*` primitives +
helpers) that are reused by **two or more** screens. This folder is **not** a junk
drawer:

## Current members

| Composite | Spec | Used by |
| --- | --- | --- |
| `ConfirmDialog` (`window.ConfirmDialog`) | `ConfirmDialog.md` | study-session, deck-detail, drawer (6 sites) |
| `StatusCardRow` (`window.StatusCardRow`) | `StatusCardRow.md` | deck-detail, search |
| `ActionCallout` (`window.ActionCallout`) | `ActionCallout.md` | import, game-picker |
| `SelectSheet` (`window.SelectSheet`) | `SelectSheet.md` | game-picker (ScopeSheet), library (SortSheet), settings (ValuePickerSheet) |
| `ProfileCard` (`window.ProfileCard`) | `ProfileCard.md` | settings, account-sync |

## Admission rule (strict)

- A component may live in `_shared/` **only when it is used by ≥ 2 screens.**
- Used by exactly one screen → it belongs in that screen's
  `_features/<screen>/components/`, not here.
- A reusable **design-system primitive** (the `Mx*` family) is not an app composite
  — it stays in `docs/design/MemoX Design System/components/`.
- Tiny cross-screen helpers can stay in `../kit-helpers.jsx` (the compatibility
  layer). Promote one into its own `_shared/*.jsx` file once it grows beyond a
  small helper.

## File shape

Same IIFE convention as screens: read `window.MemoXDesignSystem_2ffa54` + existing
`window.*` helpers, assign `window.<Name>`, and load it from `index.html` **after**
`kit-helpers.jsx` and **before** the screen entries (so screens can consume it).

When promoting a component from a feature folder into `_shared/`, update its single
source file, add the `<script>` tag to `index.html`, and keep `data-mx-node` ids
unchanged.

## Conventions (K.4 — one shape per concept)

| Concept | THE convention |
| --- | --- |
| Progress (study/review/games) | `window.ProgressHeader` — 8px bar + "done/total" count (Đ-K-2). Player dots = autoplay only. |
| Bottom action pair (in-flow) | grid `1fr 1fr`, ghost secondary LEFT, primary RIGHT, 48px+. Single action = full-width primary `block`. |
| End-of-flow decisions | stacked column (primary on top, ghost below), width-capped via `--memox-size-3xl` when not full-width. |
| Dialog actions | ghost Cancel + filled confirm (danger for destructive), layout owned by ConfirmDialog/Dialog. |
| Grading (recall) | "Got it" is PRIMARY, "Forgot" ghost→danger on select — the core interaction carries the strongest weight (audit G4). |
| Destructive risk | data loss (delete/remove/reset/leave-session) = `danger` (Đ-K-3); soft overrides (add-duplicate) = plain primary. |
| Banner tiers | Note (transient, no action) → ActionCallout (feature-level, ≤1 action) → local component only when 2+ actions. |

