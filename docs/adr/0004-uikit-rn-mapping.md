# ADR 0004 — UI Kit → React Native mapping (WBS 0.10)

- **Status:** Accepted
- **Date:** 2026-07-13
- **WBS:** 0.10 UI Kit → React Native mapping
- **Depends on:** ADR 0001 (architecture)
- **Source of truth:** `docs/design/MemoX Design System_v4/` — `tokens/*.css`, `components.css`, `components/**/Mx*.jsx`, `readme.md`

## Purpose

The rulebook every WBS 1.x / feature slice follows when translating the web UI Kit into React Native. It freezes the identifiers (token names, `Mx*` names, base classes, `data-mx-node`) and defines how CSS values and variant classes become typed RN theme + component props.

## Layering (one-way, from ADR 0001, enforced by WBS 0.12)

```
Token (design-system/tokens)  →  Component (design-system/components, Mx*)  →  Screen (features/*/ui)
```

- Screens import `Mx*` from `@/design-system` **only** — never tokens, never raw values.
- `Mx*` components read **only** tokens (`theme.*`), never literal `#hex`/px.
- Names are frozen: changing a token/`Mx*`/base-class **name** breaks the system; changing a **value** is free.

## Token CSS → TypeScript theme (WBS 1.1)

| CSS token group | TS shape | RN usage |
|---|---|---|
| `--memox-<role>` colors (`:root` light / `[data-theme=dark]` dark) | `theme.color[role]` per scheme | `color` / `backgroundColor` / `borderColor` |
| `--memox-space-N` `{4,8,12,16,24,32,48}` | `theme.space[n]` (numbers) | `padding` / `margin` / `gap` |
| `--memox-radius-*` | `theme.radius[name]` | `borderRadius` |
| `--memox-font-size-*`, `--memox-font-weight-*`, line-heights, tracking | `theme.type[role]` (`{fontSize,fontWeight,lineHeight,letterSpacing}`) | `Text` style |
| `--memox-shadow-*` / elevation | `theme.elevation[name]` → RN `shadow*`/`elevation` (iOS shadow props + Android elevation), dark = hairline ring | card/fab/nav |
| `--memox-icon-size-*`, `--memox-stroke-*`, `--memox-opacity-*` | `theme.iconSize/stroke/opacity` | icon font size, borders, disabled |

- `rgba(...)` alpha tokens stay as RN color strings. `var(--memox-x)` → `theme.…` lookup.
- Light/dark resolved by the ThemeProvider (WBS 1.2); components never branch on scheme themselves.

## Web idiom → RN idiom (applies to every component)

| Web (kit `.jsx`) | React Native |
|---|---|
| `onClick` | `onPress` (on `Pressable`/`TouchableOpacity`) |
| `className`, base CSS class | `style` composed from `theme` (via a `styles` factory keyed by variant) |
| `<span className="material-symbols-rounded">glyph</span>` | `<Icon name="glyph" />` from the icon adapter (WBS 1.4) |
| `data-mx-node={node}` | `testID={node}` (WBS 0.11 rule); `node` prop kept |
| `<div>`/`<span>` | `View` / `Text` |
| `:hover`/`:focus-visible` | press/focus state props (`pressed`, `onFocus`), `::after` hit-area → `hitSlop` |
| `href` (MxLink) | `onPress` → `router.push(...)` (expo-router) or `<Link>` |

## Primitive mapping (all 18 — base class + variants → props)

Every RN component keeps the **same name**, the **same base class semantics**, and the **same prop names** as the kit; variants stay modifiers (props), never new component names.

| # | `Mx*` | Base class | Variants / modifiers → props | Key props (frozen) |
|---|---|---|---|---|
| 1 | MxScaffold | `app` | `flush` | `appBar`, `bottomNav`, `fab`, `children`, `node` |
| 2 | MxContextualAppBar | `cappbar` | `variant`: root / nested / search / selection / modal; `--top`/`--scrolled` state | `variant`, title/actions/leading slots, `node` |
| 3 | MxCard | `card` | `variant`: flat / muted / primary / primary-soft; `interactive`; `padding` | `variant`, `interactive`, `padding`, `onPress`, `node` |
| 4 | MxSectionHeader | `section-head` | `action` link + `actionLabel` | `title`, `caption`, `action`, `onAction`, `actionLabel`, `node` |
| 5 | MxIconTile | `icon-tile` | `tone` (accent/success/warning/…); `size`; `solid` | `icon`, `tone`, `size`, `solid`, `node` |
| 6 | MxList | `—` (flex column) | `gap` override (default `space-3` = 12px) | `children`, `gap`, `node` |
| 7 | MxBottomNav | `bottom-nav` | active-item pill via `value` | `items`, `value`, `onChange`, `node` |
| 8 | MxFab | `fab` | `variant`; `round`; extended (with `label`) | `icon`, `label`, `variant`, `round`, `onPress`, `disabled`, `node` |
| 9 | MxSearchDock | `search-dock` | `focused`; `flat`; `trailing` slot | `placeholder`, `value`, `onChange`, `focused`, `flat`, `trailing`, `node` |
| 10 | MxIconButton | `icon-btn` | `variant`; `size` (incl. `--sm`, gets 48px hit-area) | `icon`, `variant`, `size`, `onPress`, `disabled`, `node` |
| 11 | MxButton | `btn` | `variant`: primary/secondary/outline/ghost; `size`; `block`; `danger`; `icon`/`trailingIcon` | `variant`, `size`, `block`, `danger`, `disabled`, `icon`, `trailingIcon`, `onPress`, `children`, `node` |
| 12 | MxLink | `link` | `size`; default `trailingIcon='chevron_right'` | `children`, `icon`, `trailingIcon`, `href`→`onPress`, `size`, `node` |
| 13 | MxTextField | `field` | bare vs labelled (`label`/`helper`/`error`) | `value`, `placeholder`, `label`, `helper`, `error`, `onChangeText`, `node` |
| 14 | MxChip | `chip` | `variant`: accent / ghost; `selected` | `label`, `icon`, `selected`, `variant`, `onPress`, `node` |
| 15 | MxBadge | `badge` | `tone`; `soft`; `dot` | `children`, `tone`, `soft`, `dot`, `node` |
| 16 | MxSwitch | `switch` | `checked`; `disabled` (48px hit-area) | `checked`, `disabled`, `onChange`, `node`, `ariaLabel`→`accessibilityLabel` |
| 17 | MxSegmentedControl | `segmented` | `block`; segment `icon` optional | `segments`, `value`, `onChange`, `block`, `node` |
| 18 | MxAvatar | `avatar` | `size`; `variant`; `ring` | `name`, `src`, `size`, `variant`, `ring`, `node` |

### Prop renames (web → RN, minimal)

- `onClick` → `onPress`; `onChange` (input text) → `onChangeText` where it carries a string; `ariaLabel` → `accessibilityLabel`. All other prop names are kept identical to the kit so the mapping is 1:1.

## Consequences

- WBS 1.5–1.7 implement each primitive against this table; screens (feature slices) compose only these.
- Accessibility: `ariaLabel`→`accessibilityLabel`, roles, and the `::after`→`hitSlop` 48px rule are part of the component contract (tested in WBS 1.8).
- Any new visual need is a **variant/prop**, never a new `Mx*` name or a raw value.
