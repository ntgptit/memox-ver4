# UI Sync — autonomous overnight VERIFY-and-FIX loop

You are running **one iteration** of an unattended loop (`/loop 60s`). The user is asleep.
Each run you verify ONE bounded unit of the MemoX Design Kit, **fix any problem you find on
the spot**, ship it via PR + merge, then stop. `/loop` re-invokes you 60s later.

**The user must not be asked anything.** Never call AskUserQuestion, never block, never wait.
If something genuinely needs a human decision, write it to the notes file (§7) and take the
**safest reversible default** (or skip that item) so the loop keeps moving. The user reads the
notes when they wake and answers then.

The task under verification is `docs/prompts/ui_sync.md` (Card Editor / flashcard-editor sync).

---

## 0. Autonomy + safety rules (apply every run)

- No questions, ever. Any ambiguity → note it (§7) + safest default → continue.
- Any error, tool failure, missing script, auth failure, merge conflict → **catch it, log it
  to the notes file, continue or skip**. Never let one failure stall the night.
- Standing authorization for THIS loop only: edit kit source, commit, push, open PRs, and
  merge your own PRs. Do NOT: touch credentials/secrets, delete data/branches other than the
  branch you created, force-push `main`, change repo settings/permissions, or run anything
  destructive outside the kit.
- The MemoX kit under `docs/design/MemoX Design System_v4/` IS the thing you edit here (this
  task fixes the kit). Everything else in the repo stays untouched.
- Scope guard: fix only defects tied to a **specific rule / fixture / render finding**. Do not
  redesign, do not refactor unrelated code, do not "improve" beyond the contract.

---

## 1. Loop protocol

1. Read the state ledger `docs/prompts/ui_sync_loop_state.md` and notes
   `docs/prompts/ui_sync_loop_notes.md` (create them if missing — see below). These are
   **untracked working-dir files**; never `git add` them.
2. Pick the target unit (§2). Do §3–§7 for that ONE unit only. Then stop.
3. End every run with a final line: `UI_SYNC_VERIFY: CONTINUE` (more to do) or
   `UI_SYNC_VERIFY: ALL_CLEAN` (a full pass over every screen found zero defects and zero open
   changes — the loop may keep firing but there is nothing to change; keep runs cheap).

Ledger format (one row per unit): `| unit | status VERIFIED|FIXED|FAILED|TODO | evidence | pr |`.
Notes file: append-only; newest entries at the bottom; timestamp each with `date` from bash.

---

## 2. Target selection (in order)

1. **`flashcard-editor`** first — this is the ui_sync.md task. Verify it against §22 of
   `docs/prompts/ui_sync.md` (the 9 states × light/dark, App Bar, save-state, density,
   duplicate hierarchy, audio anatomy, keyboard, L/D parity).
2. Once flashcard-editor is `VERIFIED` clean, walk the rest of the kit inventory one screen
   per iteration to catch drift: dashboard, library, subdeck-list, flashcard-list,
   deck-settings, search, review, study-session, study-result, statistics, settings,
   account-sync, import, export, reminder, drawer, player, and the games. Pick the first unit
   whose ledger status is not `VERIFIED`.
3. If every unit is `VERIFIED` and nothing changed this pass, emit `ALL_CLEAN` and make no
   commits/PRs this run.

---

## 3. Verify by RENDERING (never trust specs or screenshots for numbers)

- Run the canonical gate for the target: `node tool/ui_kit_shots/shoot.mjs <unit>` (fresh
  Chromium each run → no CSS cache). It renders each state × {320,360,390,430} × font-scale
  {1,1.3,1.5} × light/dark and writes `tool/ui_kit_shots/out/report.json` flagging real
  overflow/clip + `blank render` / ErrorBoundary. **0 render errors = it mounted**; then read
  the report for overflow.
- For exact measurements, inject `getComputedStyle` / `getBoundingClientRect` via the
  Playwright MCP against a live render (cache-bust with `?v=N` — the MCP browser caches CSS).
- **Accepted (not real) findings — do not "fix" these:** `appbar__title` / `cappbar`
  long-label truncation, and the `shell/notifications` badge `scrollWidth` artifact. Filter
  them out.
- A unit passes only when its whole state matrix mounts error-free and has no real overflow
  at every viewport/font-scale in light + dark, AND matches the ui_sync.md contract for that
  screen. Cite the specific report entry / measurement — never sign off on "looks good".

---

## 4. Fix on the spot (if §3 finds a real defect)

- Fix at the correct layer: token (`tokens/*.css`, e.g. `tokens/colors.css` — the single colour
  source; `components.css`) → component (`components/<group>/Mx*.jsx`, `_shared/`) → screen
  (`_features/<unit>/`). Never layer-skip; never introduce raw `#hex` or off-scale spacing.
- Spacing scale `{4,8,12,16,24,32,48}`; screen padding 16; section gap 24/32; item gap 8/12;
  touch targets ≥ 44×44; ≤ 3 nested surfaces; ≤ 5 type roles; one heading + one primary CTA.
- Reuse shared `Mx*` families; keep token role names and `Mx*` names/classes/`data-mx-node`
  ids **stable** (change values, never names). Domain: Library › Deck › Subdeck › Card — no
  Folder/Collection/etc.
- Re-run §3 after fixing. Batch: make all edits for the unit, reason about correctness, then
  run `shoot.mjs` once before committing (don't shoot after every micro-edit).

### Keep artifacts in sync (correct tooling for THIS repo)
- Screenshots: regenerated by `shoot.mjs` (delete stale state PNGs it no longer produces).
- `ui_kits/memox-app/specs/<unit>.md` + `specs/INDEX.md`: **hand-maintained** — there is NO
  spec exporter in this repo (`export_specs.mjs` does not exist). Edit the `.md` by hand to
  match the new render; do not call a script for it.
- `_ds_manifest.json`: regenerate with `node tool/parity/build-manifest.mjs` (do not hand-edit).
- `ui_kits/memox-app/index.html` gallery + `shots/INDEX.md`: update if state set changed.
- There is NO `tool/verify/run.mjs` freshness gate — do not try to run one.

---

## 5. If the unit is already clean

No defect found → mark it `VERIFIED` in the ledger with the evidence (e.g. `shoot: 0 render
errors, 0 real overflow, 9 states L/D`), append a one-line notes entry, make **no commit**,
and move on (emit `CONTINUE`, or `ALL_CLEAN` per §2.3).

---

## 6. Ship the fix (only when §4 actually changed files)

Run this exact sequence; on any failure, log to notes and continue (do not block):

1. Ensure clean base: `git fetch origin && git checkout main && git reset --hard origin/main`.
   (reset --hard is safe: untracked notes/state files survive; commit nothing before this.)
2. Branch: `git checkout -b ui-sync-fix/<unit>-<n>` (n = short counter from ledger).
3. Stage **only the kit files you changed** (explicit paths — NEVER `git add -A` / `.`, so the
   untracked notes/state files never enter the PR).
4. Commit. End the message with:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
5. Push: `MEMOX_SKIP_DESIGN_SYNC=1 git push -u origin HEAD` (the skip flag prevents the
   pre-push design-sync hook from hanging in this non-interactive session).
6. PR: `gh pr create --fill --title "ui-sync: fix <unit>" --body "<what + verification evidence>"`.
   End the body with: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
7. Merge: `gh pr merge --squash --delete-branch`.
8. Sync local main WITHOUT running merge hooks: `git fetch origin && git checkout main &&
   git reset --hard origin/main` (avoids the post-merge design-sync hook hanging).
9. If `gh` is unauthenticated or any git step fails: log the blocker + the branch name to
   notes, leave the branch/PR as-is, and continue. Do not retry in a tight loop.

---

## 7. Notes + ledger (every run)

- Append to `docs/prompts/ui_sync_loop_notes.md` a dated block:
  `## <date> — <unit>` then bullets: what was verified, defects found+fixed, PR link, and any
  `DECISION-NEEDED:` items (each a crisp question + the safe default you took so the user can
  confirm/override in the morning).
- Update the ledger row for the unit.
- Keep both files small and skimmable — the user reads them half-awake.

---

## 8. Never-do (overnight guardrails)

- Never ask the user anything or wait for input.
- Never `git add -A`/`git add .`; never commit the notes/state files.
- Never force-push main, never delete data or others' branches, never touch secrets/settings.
- Never chase a non-existent script (`export_specs.mjs`, `tool/verify/run.mjs`) — see §4.
- Never fix an accepted/non-real finding (§3); never redesign beyond the ui_sync.md contract.
- Never mark a unit `VERIFIED` on the happy path alone — the full state matrix render is the gate.
- Never emit `ALL_CLEAN` unless a complete pass over every unit found zero defects and made
  zero changes.
- Do more than one unit per run? No. One unit, then stop and let the 60s restart fire.
