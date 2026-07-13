# Test harness baseline & quality contract (WBS 11.1)

The testing contract every MemoX slice follows. The harness itself is WBS 0.13; this
doc freezes the **conventions** and the **ownership rule**. It does **not** claim all
feature tests are written — it defines how each slice writes its own.

## Test pyramid (tiers)

| Tier | What | Runner | Example in the repo |
|---|---|---|---|
| **Unit** | Pure functions, entities, domain invariants, mappers | jest | `src/features/*/domain/__tests__/*`, `src/shared/__tests__/*` |
| **Component** | RN components via `@testing-library/react-native` | jest (RNTL v13) | `src/design-system/__tests__/route-placeholder.test.tsx` |
| **Repository / integration** | Repositories over **real SQLite** (better-sqlite3), migrations, transactions, rollback | jest | `src/features/*/data/__tests__/*`, `src/db/migrations/__tests__/*` |
| **Accessibility** | Roles/labels/target-size/font-scale on component + shell fixtures | jest + shared a11y helpers | WBS 11.3 (baseline) → 1.8 / 2.4 |
| **Visual regression** | Golden/screenshot diff of canonical states | golden harness | WBS 11.4 (baseline) → per-slice states |

Push logic **down** the pyramid: a rule provable as a pure unit test must not be
tested only through a component or a screenshot.

## Folder & naming convention

- Tests live next to their source in a `__tests__/` folder, named `*.test.ts` /
  `*.test.tsx`. Jest `testMatch` = `**/__tests__/**/*.test.ts?(x)` (`jest.config.js`).
- Non-test helpers may live in a `__tests__/` or `src/shared/testing/` folder without
  the `.test` suffix — jest ignores them as tests but they are importable.

## Shared fixtures

Reusable, deterministic test building blocks live in **`src/shared/testing/`** (never
imported by app code):

- `fixtures.ts` — `sequentialIds()`, `fixedClock()`, `tickingClock()` (match the
  injected `IdGenerator`/`Clock` ports, so domain tests stay deterministic).
- `sqlite-test-db.ts` — `createTestDatabase()`: a real in-memory SQLite
  (better-sqlite3) that runs the **real migration registry**, so repository tests
  exercise the shipped schema (DDL, FKs, transactions, rollback). `sql.js` is **not**
  used — it fails under the jest environment; better-sqlite3 runs in the node test env.

## Coverage & command contract

- **`npm test`** runs the whole suite (`jest`); `npm run test:watch` for local watch.
- CI runs `npm test -- --ci` on every change to `src/**`, the test config, or
  dependencies (`.github/workflows/test.yml`), separate from the design-kit gate.
- Coverage is collected from `src/**` excluding `__tests__` (`collectCoverageFrom`).
  No global coverage **threshold** is enforced as a gate yet — the enforced contract is
  **ownership** (below), not a percentage, so the number can't be gamed by trivial tests.

## Vertical Slice Quality Ownership (the rule)

**Every vertical slice owns its own tests, added in that slice's own PR.** A domain PR
ships its invariant unit tests; a persistence PR ships its repository + rollback tests;
a screen PR ships its component + a11y + visual states. A slice is not "done" until its
tier-appropriate tests exist and pass in the same PR. See the *Vertical Slice Quality
Ownership* section of `docs/project-management/wbs.md`.

This baseline is already exercised by the 20 merged slices (domains, persistence, DB
framework), each of which shipped its own tests. WBS 11.3 (accessibility) and 11.4
(visual regression) add the remaining two tiers' baselines; together with this row they
form the 2.6 readiness gate for the feature-screen slices.
