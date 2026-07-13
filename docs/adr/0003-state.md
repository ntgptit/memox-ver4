# ADR 0003 — State management (WBS 0.3)

- **Status:** Accepted
- **Date:** 2026-07-13
- **WBS:** 0.3 State-management decision
- **Depends on:** ADR 0001 (architecture)

> Numbered 0003 because ADR 0002 is the routing strategy (WBS 0.2). The WBS row 0.3 evidence pointer is updated to this file.

## Context

MemoX is **offline-first**: the local database (WBS 0.4/DEP-DB) is the single source of truth for decks, cards, sessions, attempts and SRS state. Screens read/derive from the DB and write through repositories/use cases. WBS 0.3 requires choosing a state approach using **only installed dependencies** (or a register-approved one) and **no premature global store**.

## Decision

**No global state-management library.** Use React built-ins layered by concern:

1. **Server/persistent state (DB-backed):** a thin **repository-hooks** layer. Repositories (WBS *.2) expose read queries + a change signal; a generic `useQuery(selector)` built on **`useSyncExternalStore`** subscribes components to repository changes and re-renders on commit. This keeps the DB as the source of truth — no duplicated cache to invalidate.
2. **Cross-cutting app state:** small **React Contexts** for genuinely global concerns only — theme (WBS 1.2), the active study session (WBS 5.x), and DB readiness. Each context is a focused provider mounted in `src/app/_layout.tsx`.
3. **Local UI state:** ordinary `useState`/`useReducer` inside the screen/component that owns it. Form state (editor, import) uses `useReducer` for the submit lifecycle.

No new dependency is added; all of the above ship with `react` / `react-native` (already in `package.json`).

### Boundaries (enforced by ADR 0001 + WBS 0.12)

- The domain layer stays pure (no React). Hooks live in `features/*/ui` or `features/*/data`, wrapping the pure use cases.
- Contexts hold only cross-cutting state; feature data does **not** go into a global tree.

## Rejected options

| Option | Why not (now) |
|---|---|
| **Redux Toolkit** | Heavy boilerplate + a second source of truth to keep in sync with the DB; over-kill for offline-first where the DB is authoritative. New dependency. |
| **Zustand / Jotai** | A global store is premature; most state is either DB-backed (belongs in the repo layer) or local. Revisit only if cross-screen ephemeral state grows. New dependency. |
| **TanStack Query (react-query)** | Excellent for remote server cache, but MemoX's "server" is the local DB; `useSyncExternalStore` over repositories covers reactivity without a cache layer to invalidate. New dependency. Reconsider if/when cloud sync (WBS 10.2) needs remote caching. |
| **MobX** | Observable model conflicts with the pure-domain rule; new dependency. |

## Consequences

- Zero new dependencies for state; the DB remains the single source of truth.
- Reactivity is explicit and testable: repositories emit change signals, `useSyncExternalStore` subscribes.
- If cloud sync (WBS 10.2) later needs remote request caching, TanStack Query can be added **then** via the Dependency Approval Register — this ADR is revisited, not pre-committed.
