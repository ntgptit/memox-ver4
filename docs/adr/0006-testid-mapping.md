# ADR 0006 — `data-mx-node` → `testID` mapping (WBS 0.11)

- **Status:** Accepted
- **Date:** 2026-07-13
- **WBS:** 0.11 `data-mx-node` → `testID` mapping
- **Depends on:** ADR 0004 (UI Kit → RN mapping), ADR 0001 (architecture)
- **Source of truth:** `docs/design/MemoX Design System_v4/` — every `Mx*.jsx` (`node` prop → `data-mx-node`) and `ui_kits/memox-app/_features/**/*.jsx` (screen node ids)

## Purpose

Freeze the deterministic rule that carries each kit `data-mx-node` id onto the
corresponding React Native node as `testID`. This gives every anchored element a
**single stable id** shared by the web kit (`data-mx-node`), the RN tree
(`testID`), the a11y/interaction tests (WBS 1.8 / 2.4 / *.5), and the visual
reference (specs/shots). Test and screenshot selectors never guess a query —
they read the frozen id.

## The id, as it exists today (kit convention)

In the kit, every `Mx*` primitive takes a `node` prop and renders it verbatim as
the DOM attribute:

```jsx
// components/core/MxButton.jsx
export function MxButton({ …, node, … }) {
  return <button … data-mx-node={node} …>…</button>;
}
```

Screens pass a **slug** of the form `"<screen>/<part>"` (occasionally
`"<area>/<part>"` for shared shell), for example:

```jsx
// ui_kits/memox-app/_features/dashboard/Dashboard.jsx
<MxScaffold        node="dashboard/screen"   … />
<MxContextualAppBar node="dashboard/appbar"   … />
<MxIconButton      node="dashboard/search-open" … />
<MxButton          node="dashboard/start-review">Start review</MxButton>
<MxBottomNav       node="shell/bottom-nav"   … />
<div data-mx-node="dashboard/continue" … />   // raw wrapper, same convention
```

The slug is already lowercase-kebab segments joined by `/`. It is **stable** —
per AGENTS.md the golden rule freezes `data-mx-node` ids (changing a *value* is
free; changing a *name/id* breaks the system).

## The rule

**R1 — identity carry-through.** For every kit node that has a `data-mx-node="X"`,
the RN element that replaces it MUST set `testID="X"` — the *same string*, byte
for byte. No transformation, no prefixing, no casing change. This is the
`data-mx-node={node}` → `testID={node}` row already declared in ADR 0004 §"Web
idiom → RN idiom".

**R2 — the `node` prop is the single input.** Each RN `Mx*` component keeps the
`node` prop (frozen name, ADR 0004) and applies it internally:

```tsx
// RN MxButton (WBS 1.7) — illustrative
export function MxButton({ node, … }: MxButtonProps) {
  return <Pressable testID={node} …>…</Pressable>;
}
```

Screens pass the **same** `"<screen>/<part>"` slug they pass in the kit today, so
the screen author writes the id once and it lands on `testID` automatically. A
raw kit wrapper (`<div data-mx-node="dashboard/continue">`) maps to a `View` with
`testID="dashboard/continue"`.

**R3 — one id → one primary node.** `testID` is placed on the component's
**outer pressable/host node** (the same element that carried `data-mx-node` in
the kit), never duplicated onto a child. Composite primitives that already expose
internal sub-ids in the kit (e.g. a list row's action) keep those sub-ids on
their own sub-nodes; the rule is 1:1 with the kit, not "add more ids".

**R4 — slug shape (frozen, validated).** Ids match
`^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)+$` — kebab segments joined by
`/`, first segment = the screen/area (`dashboard`, `library`, `session`, …) or
the shared `shell`. New screens follow the same shape; they do not invent an
id scheme.

**R5 — coverage.** Every node the specs/shots anchor on (every `node=` /
`data-mx-node=` in `_features/**` and the `Mx*` primitives) has its id carried
onto `testID`. WBS 0.12's guard (raw-value lint) is orthogonal; a follow-on
check in the component/screen tests (WBS 1.8 / 2.4) asserts the anchored ids are
present so drift fails a test, not a screenshot review.

## Accessibility relationship

`testID` is **not** an accessibility label. `ariaLabel` → `accessibilityLabel`
(ADR 0004) is a separate, human-facing string; `testID`/`node` is a machine
anchor. A node can have both; neither derives from the other.

## Consequences

- Tests and visual harnesses select by the frozen id, so a renamed/removed
  anchor fails deterministically instead of silently mis-selecting.
- Screen authors write each id once (the `node` prop); the RN component wiring
  (`testID={node}`) is boilerplate defined per primitive in WBS 1.5–1.7.
- No new id namespace is introduced — the RN app reuses the kit's existing
  `data-mx-node` values 1:1, keeping web kit ↔ RN ↔ tests ↔ specs in lockstep.
