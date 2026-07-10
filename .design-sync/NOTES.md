# design-sync notes

Target project: `MemoX Design System_v4` (`2ffa54ae-10eb-49b1-b005-d253b54a5711`), owner Giap Nguyen.
Local source of truth: `docs/design/MemoX Design System_v4/` (hand-authored / off-script layout).

The kit (mock design) is the SOURCE OF TRUTH and lives on Claude Design (claude.ai);
the repo copy under `localDir` is kept in sync. Pushing needs design-system auth that
only the logged-in `claude` CLI carries — it is NOT CI-able. `tool/parity/sync-design.mjs`
drives that CLI as a nested, plan-bounded `DesignSync` push.

## Sync triggers (both PUSH, repo kit → Claude Design)
- **`.githooks/pre-push`** — on `git push` whose range touches `localDir`; runs
  `sync-design.mjs --no-record`.
- **`.githooks/post-merge`** — after the default branch (`main`/`master`) receives
  kit changes (covers server-side PR merges + agent pushes that bypass pre-push).
  Compares against `lastSyncedCommit`; runs `sync-design.mjs` (record mode).
  Warns if `claude` CLI absent.
- Both honor `MEMOX_SKIP_DESIGN_SYNC=1`. **Agent sessions (no design-auth TTY)
  must prefix BOTH `git push` and `git pull` on the default branch** with it, or the
  nested `claude` hangs.

## Wiring
Hooks live in `.githooks/` and are activated with `git config core.hooksPath .githooks`.
Baseline `lastSyncedCommit` was pinned to the kit-import commit on setup, since the
remote project already holds the current kit — the next push only sends the new delta.
