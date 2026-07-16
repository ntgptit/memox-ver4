# Keyboard focus-order & reading-order contract

> Guideline / spec layer (documentation side of KIT-42-02). Defines the focus and reading order
> every screen must satisfy and how each `Mx*` component participates. Additive only — no
> token/class/name changes. The routing/keyboard-execution harness and focus-order logs are the
> code agent's deliverable; this file is the contract they verify against.
>
> Owner: Design System team · Status: Current (v4, additive-only).

---

## 1. Principles

- **DOM order = reading order = focus order.** Author markup top-to-bottom, leading-to-trailing in
  the visual order a sighted user scans. Never use `tabIndex > 0` to reorder; the only allowed
  values are `0` (in natural order) and `-1` (programmatically focusable / removed from tab order).
- **One heading landmark per screen.** Each screen exposes exactly one top-level heading
  (`role="heading"` / `<h1>` equivalent) so screen-reader users can orient. The app-bar title is
  contextual text, not the body heading — the screen's primary heading lives in the body
  (see KIT-42-01, code side).
- **Every interactive element is reachable and operable by keyboard**, with a visible
  `:focus-visible` ring (`--memox-ring-focus`), and activates on Enter/Space.
- **Focus is never lost.** After any action that removes the focused element (delete, close, submit)
  focus moves to a defined anchor (see overlays guide §2).

---

## 2. Screen-level reading / focus order

Top → bottom for a standard scaffolded screen:

1. **App bar** — leading nav (back/close) → title (non-focusable text) → actions (left-to-right) →
   notification → avatar.
2. **Body** — the screen's primary heading first, then sections in visual order; within a section:
   section header (title, then its trailing action) → list items in order → within a card:
   leading art (non-focusable) → primary text → inline controls.
3. **FAB** — the primary action; placed late in DOM but is a peer of the body; ensure it is reachable
   without wading through a long list (it may be given an early tab stop via focus management, not
   `tabIndex>0`).
4. **Bottom nav** — destinations left-to-right, last.

Overlays (sheet/dialog/menu) take over the focus order while open — see the navigation & overlays
guide §2 (trap, then restore to trigger).

---

## 3. Per-component focus behaviour

| Component | Focusable? | Order / role notes |
| --- | --- | --- |
| MxContextualAppBar | its actions are | leading → title(text, not focusable) → actions → notification → avatar |
| MxButton / MxFab / MxIconButton / MxLink | yes | natural order; Enter/Space; visible focus ring |
| MxChip | yes (interactive) | in row order; Enter/Space |
| MxSegmentedControl | yes | roving focus across 2–3 segments; arrow keys move, Enter selects |
| MxSwitch | yes | Enter/Space toggles; `role="switch"` + `aria-checked` announced |
| MxTextField | yes | label associated; error announced via `role="alert"`; focus ring visible |
| MxSearchDock | yes (input) | focus shown via `focused` ring |
| MxBottomNav | yes | tabs in order; `role="tab"` + `aria-current`/selected on active |
| MxSectionHeader | its action is | title/caption non-focusable; trailing action focusable (Enter/Space) |
| MxCard | only when `interactive` | as a single `role="button"` tab stop; must contain no other focusable child (nested-interactive rule) |
| MxList / MxScaffold | no (structure) | provide the DOM order that becomes focus order |
| MxAvatar / MxIconTile / MxBadge | no | non-interactive; skipped by tab |

---

## 4. Full-task keyboard walkthrough (what to verify)

For each primary task (e.g. Dashboard → Start review → answer → finish) confirm a keyboard-only user
can complete it end to end:

1. Tab reaches every control in the documented order; no keyboard trap (except intended overlay
   traps, which release on close).
2. The primary CTA is reachable and operable; Enter/Space activates it.
3. Opening/closing an overlay moves and restores focus per the overlays guide.
4. State changes (selection count, expand/collapse, loading, success/error) are announced
   (`aria-current`, `aria-expanded`, `aria-busy`, `role="status"`/`"alert"`).
5. Record the resulting focus-order log as the evidence artifact (code-agent deliverable).
