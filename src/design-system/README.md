# design-system

Layer 1 (tokens) + Layer 2 (`Mx*` primitives) + theme + fonts + icons for MemoX, mapped from
`docs/design/MemoX Design System_v4/`. Screens import components **only** from this module's
`index.ts`; components import only tokens. See `docs/adr/0001-architecture.md`.

- `tokens/` — typed tokens (WBS 1.1) · `theme/` — provider (WBS 1.2) · `fonts/` (WBS 1.3)
- `icons/` — Material Symbols Rounded adapter (WBS 1.4) · `components/` — Mx* (WBS 1.5–1.7)
