# Feature quality-harness readiness gate (WBS 2.6)

**Status: PASSED (2026-07-13).** The three shared quality harnesses are complete and
usable by the feature-screen slices (WBS 3.3–10.3). This gate confirms readiness only —
it does not claim any feature screen is built.

## Harnesses confirmed ready

| Harness | WBS | Where | What a slice reuses |
|---|---|---|---|
| **Test harness + fixtures** | 11.1 | `docs/testing/quality-contract.md`, `src/shared/testing/{fixtures.ts,sqlite-test-db.ts}` | `npm test`; jest-expo + RNTL; `sequentialIds`/`fixedClock`; `createTestDatabase()` (real SQLite) |
| **Accessibility baseline** | 11.3 | `docs/testing/accessibility-contract.md`, `src/shared/testing/a11y.ts` | roles/labels/target-size rules; `contrastRatio`/`meetsContrastAA`; `MIN_TOUCH_TARGET`; `flatStyle` |
| **Visual-regression harness** | 11.4 | `tool/app_golden/` (`shoot.mjs`, `README.md`) | `npm run golden(:update)`; append states to `TARGETS`; commit `baseline/<screen>--<state>--<theme>.png` |

## Mandatory per-slice quality contract

Every production feature screen slice (3.3–10.3) is **not done** until, in its own PR:

1. **Fixtures + component/interaction tests** for its state matrix (loading, loaded
   normal/min/dense, empty, recoverable error, long text, large font, narrow, dark),
   and — for forms — the submit lifecycle (validation error / disabled / submitting /
   failure / success). Uses the 11.1 fixtures.
2. **Accessibility tests** — every interactive element has a role + label, targets are
   ≥44px, stateful controls announce state, and any new colour pairing meets AA (11.3
   helpers).
3. **Visual golden state(s)** — the screen's canonical states appended to
   `tool/app_golden/shoot.mjs` `TARGETS` with committed baselines (11.4).

A slice PR that lands a screen without its tier-appropriate tests does not satisfy the
Vertical Slice Quality Ownership rule (`docs/project-management/wbs.md`).

## Gate result

11.1 ✓ · 11.3 ✓ · 11.4 ✓ — the shared fixture, accessibility-helper and visual-diff
contracts are in place. **The feature-screen slices (3.3–10.3) may begin.**
