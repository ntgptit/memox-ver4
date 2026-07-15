# Navigation & Button Audit — 2026-07-15

Full investigation of every button, navigation edge, and dialog/sheet
open-close in the app. Two layers, both reproducible:

- **Static** — `node tool/nav_audit/static.mjs`: route table (27 routes),
  every `router.push/replace` target resolved (34 calls), and every screen's
  `on*` handler prop cross-referenced against its container + route files.
- **Dynamic** — `node tool/nav_audit/run.mjs` (needs `web-build-golden`):
  53 Playwright steps over the LIVE web build (fresh DB) plus fixture routes
  for screen-internal overlays. **53/53 pass**, where `BUG?` steps assert a
  defect is present (they fail once the defect is fixed — flip them then).

## Defects found

### P0 — flow-blocking

| # | Defect | Evidence |
|---|---|---|
| 1 | **Create deck is a dead end.** Every "Create deck" button (dashboard, library empty-state, library create-sheet) pushes `/deck/new/content`, but that flow only calls `setDeckContentUseCase` on deck id `'new'`, which never exists → error banner. The domain `createDeck` use case is never called by any UI. On a fresh install NO deck can ever be created, which also blocks import (needs an existing deck), study, export, cards. | `src/app/(tabs)/library.tsx:27`, `src/app/(tabs)/index.tsx:28`, `src/features/library/ui/use-deck-content-choice.ts:43`; dynamic step "BUG? naming + choosing content FAILS to create a deck" |
| 2 | **Study-settings hub children unreachable.** The hub rows push `/settings/study?screen=<key>` — a same-pathname, query-only push that expo-router (web) swallows: URL doesn't change, child never renders. Word display / SRS / Mode / Voice can only be reached by deep link. (The "Language pairs" row navigates fine — different pathname.) | `src/app/settings/study.tsx:37`; dynamic steps "BUG? hub → … DEAD" + passing deep-link twins |
| 3 | **5-stage session stalls at Stage 2 (Match).** `StudySessionScreen` renders `StageMatch` with `onPick={onPickTile}`, but the container never passes `onPickTile` (only `onPickOption`) → tiles are dead, the learner cannot answer stage 2 or finish a full session (only Exit works). | `src/features/session/ui/study-session-screen.tsx:91`, `study-session-container.tsx`; dynamic step "BUG? study-session stage-2 match tiles dead" |

### P1 — dead controls / wrong wiring

| # | Defect | Evidence |
|---|---|---|
| 4 | **`/card/new` is pushed WITHOUT `deckId` from every entry point** — including `deck/[deckId]/cards.tsx`, which knows the deck. The editor container then runs with `deckId: ''`: the deck context falls back to the fixture deck name ("TOPIK I — Vocabulary") and Save fails `makeCard` validation ("A card must belong to a deck.") after the user has filled the form. Not data-corrupting (validation blocks the write) but a broken create path. | `src/app/deck/[deckId]/cards.tsx` (`onAddCard`), also dashboard/library/mode-picker pushes |
| 5 | **Card actions sheet: "Move card" and "Hide card" are no-ops.** The screen exposes `onMoveCard`/`onHideCard`; no route or container wires them (no target screens exist either). | static audit; dynamic step "BUG? Move card + Hide card are no-ops" |
| 6 | **Subdeck actions sheet: Rename / Move / Delete subdeck + "Import subdecks" are no-ops.** `onRenameSubdeck`, `onMoveSubdeck`, `onDeleteSubdeck`, `onImportSubdecks` unwired in `deck/[deckId]/index.tsx`. | static audit |
| 7 | **Dashboard bell (with unread dot) is dead.** `onNotifications` never wired; the bell renders with `onPress: undefined`. | static audit |

### P2 — known/intentional gaps (recorded, not defects)

- Settings root "Backup / Restore" row: deliberate no-op until WBS 10.3.
- Fixture (`?state=`) previews only wire `onBack` — preview-only buttons being
  inert is by design (goldens harness).

## What was verified working (dynamic, live build)

- **Tabs**: Today ↔ Library ↔ Stats ↔ Profile all navigate; back works everywhere tested.
- **Dialogs/sheets open AND close** (via button and via scrim): library create-sheet + filter-sheet, flashcard add-sheet + card-actions sheet + delete-confirm dialog, deck-settings rename dialog / move sheet / reset dialog / delete dialog, mode-picker scope sheet, session exit dialog (Stay + Leave), reminder time-picker (Done), settings words-per-round picker (pick closes + persists), languages pick-sheet.
- **Live flows on a fresh DB**: languages add-pair creates a real pair; import (paste → mapping → preview) reaches a safe `import-error` with no deck; export runs to `done` with Share/Save present; search opens/backs; every `/session/*` route, `/player`, `/session/result` renders a safe state with an empty DB (no crashes, no blank screens).
- **Static**: all 34 `router.push/replace` targets resolve to real routes (the one dynamic `${mode}` target covers exactly the five existing mode routes).

## Suggested fixes (not applied)

1. `/deck/new/content` flow: when `deckId === 'new'`, call `createDeck`
   (needs a language pair — also add an onboarding path when none exists).
2. Study hub: navigate children via `router.push({ pathname: '/settings/study', params: { screen: key } })`
   or give children their own pathnames (e.g. `/settings/study/worddisplay`).
3. Session shell: pass `onPickTile={ctrl.pickOption}` in `study-session-container.tsx`.
4. Thread `deckId` into `/card/new?deckId=…` wherever a deck is in context;
   hide/disable the entry points that have none.
5. Either wire Move/Hide card + subdeck rename/move/delete to real flows or
   drop the menu items until their WBS rows exist.

## Resolution (same day)

P0-1/P0-2/P0-3 and P1-4 are FIXED (WBS 12.1–12.4) and the dynamic suite now
runs fully positive: **46/46 steps**, including a fresh-install create-deck
journey (no-pair → add-pair → deck created), all four study-hub children
opened from real hub presses (root cause: `screen` is a RESERVED React
Navigation param name — the child route param is `[section]`), a COMPLETE live
5-stage session driven to the result screen, and Add-card entries carrying
their deck context end-to-end. Fixing 12.4 surfaced one more defect, also
fixed: sheets did not close before navigating (flashcard-list add/actions,
library create, subdeck create, deck-settings export), which blocked the
pushed screen on web. Remaining documented no-ops: defects 5–7 (WBS 12.11,
product decision) and the Backup/Restore row (WBS 10.3).
