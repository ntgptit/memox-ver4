# ADR 0001 — Production folder architecture (WBS 0.1)

- **Status:** Accepted
- **Date:** 2026-07-13
- **WBS:** 0.1 Production folder architecture
- **Deciders:** Human (owner) + Claude Code Opus

## Context

MemoX v4 production is currently a fresh Expo Router scaffold (`src/app/*` starter, starter widgets in `src/components/*`). The UI Kit design system (`docs/design/MemoX Design System_v4/`, 26 screens · 168 states) and the implementation WBS (`docs/project-management/wbs.md`) require a production layout that every later work package's target paths derive from, keeps a one-way Token → Component → Screen dependency direction, and keeps business logic out of UI and routing.

## Decision

Adopt a **feature-sliced, layered** layout under `src/`. Expo Router owns routing only; features own their own domain/data/ui; a shared design system and shared kernel sit beneath features; a `db` module owns persistence.

```
src/
  app/                      # Expo Router route tree ONLY (thin). Route files import a
                            #   feature's screen and render it — no business logic here.
    (tabs)/                 #   root tab group: Today / Library / Stats / Profile
    (session)/              #   study-session route group (5-stage flow)
    _layout.tsx             #   root providers (theme, db, safe-area)
  design-system/            # Layer 1+2: tokens (TS) + Mx* RN primitives + theme + icons.
    tokens/                 #   typed tokens generated/mapped from tokens/*.css (WBS 1.1)
    theme/                  #   ThemeProvider + light/dark (WBS 1.2)
    fonts/                  #   Plus Jakarta Sans loading (WBS 1.3)
    icons/                  #   Material Symbols Rounded adapter (WBS 1.4)
    components/             #   Mx* primitives — surfaces/navigation/core (WBS 1.5–1.7)
    index.ts                #   public design-system API (screens import ONLY from here)
  features/<feature>/       # One folder per feature area (library, flashcard, study…).
    domain/                 #   pure TS entities + use cases (no UI, no DB imports) (WBS *.1)
    data/                   #   repositories + mappers over src/db (WBS *.2)
    ui/                     #   screens + feature-local components (import design-system) (WBS *.x)
    index.ts                #   feature public API
  shared/                   # Cross-cutting kernel, no feature or UI imports.
    result.ts               #   Result<T,E> + typed error model (WBS 0.6)
    contracts/              #   repository/use-case interfaces (WBS 0.7)
    testing/                #   shared fixtures + helpers (populated by WBS 11.1/11.3)
  db/                       # Persistence source of truth (offline-first).
    schema/                 #   table definitions (WBS 3.2/4.2/5.2, gated by DEP-DB)
    migrations/             #   versioned forward-only migrations (WBS 0.5)
    client.ts               #   DB client + transaction helper (gated by DEP-DB)
```

### Dependency direction (one-way, enforced by ESLint in WBS 0.12)

```
app  →  features/*/ui  →  { design-system, features/*/domain }
features/*/data  →  { features/*/domain, shared/contracts, db }
features/*/domain  →  shared            (NO ui, NO db, NO design-system)
design-system  →  design-system/tokens  (NO features, NO app)
db  →  shared                            (NO features, NO ui)
```

- Screens import components only from `src/design-system` (never raw tokens).
- Components import only tokens.
- The domain layer imports neither UI nor DB — it depends on `shared/contracts` interfaces; `data/` provides the DB-backed implementations.
- No raw visual values (`#hex`, literal px) above the token layer (guarded in WBS 0.12).

### Path alias

`@/*` → `src/*` (already configured in `tsconfig.json`). New target paths use it, e.g. `@/design-system`, `@/features/library`, `@/shared/result`, `@/db/client`.

## Starter-widget retirement

The Expo starter widgets are **not** MemoX and will be retired as the real implementation lands — they must not be treated as MemoX components:

| Starter file(s) | Fate |
|---|---|
| `src/app/index.tsx`, `src/app/explore.tsx` | Replaced by the real `(tabs)` route tree (WBS 2.1/0.2). |
| `src/components/{animated-icon,app-tabs,external-link,hint-row,themed-text,themed-view,web-badge}.tsx`, `src/components/ui/collapsible.tsx` | Removed once `src/design-system` primitives (WBS 1.5–1.7) replace them. |
| `src/constants/theme.ts`, `src/hooks/{use-color-scheme,use-theme}.ts` | Superseded by `src/design-system/theme` (WBS 1.2). |
| `src/global.css` | Kept only while `react-native-web` needs it; MemoX styling comes from tokens. |

Retirement happens in the WBS work package that provides the replacement (so the app keeps building at every step); this ADR only records the target and the mapping. No starter route is claimed as a MemoX screen.

## Consequences

- Every later WBS row's *(to create)* target path resolves under this tree.
- Features are independently testable (domain is pure; data is mockable via `shared/contracts`).
- Routing, UI, domain and persistence stay separable, matching the mobile-ui construction contract and the design system's Token → Component → Screen rule.
- The skeleton folders ship with `README.md` placeholders now; each is filled by its owning WBS work package.
