# Non-compliant Navigation Flows — pre-fix snapshot (2026-07-15)

Baseline data: `docs/navigation/nav-flows-raw.md` (440 raw flows) →
`nav-flows-final.md` (166 unique behaviours over 270 interactive controls +
35 overlays on 28 routes). This report freezes the NON-COMPLIANT subset before
any mass fix. Compliance = the control does something, and that something is
the semantically correct destination/behaviour.

## Headline numbers

| Metric | Count |
|---|---:|
| Unique behaviours (deduped walk list) | 166 |
| **Non-compliant flows (this report)** | **22** |
| — A. Dead controls (no handler at all) | 12 |
| — B. Handler exposed but never wired (press does nothing) | 7 |
| — C. Wired but WRONG destination / no-op key | 3 |
| Share of unique behaviours non-compliant | ≈ 13% |

Every other behaviour in `nav-flows-final.md` resolves to a real route push,
overlay open/close, or controller action, and the 46-step dynamic suite
(`tool/nav_audit/run.mjs`) covers the trunk flows end-to-end.

## A. Dead controls — rendered as buttons, NO handler (12)

Pressing does nothing; no prop exists to wire. All are kit-mock leftovers.

| # | Control | Where (file:line) | Route | What it should do (kit intent) |
|---|---|---|---|---|
| A1 | `library/fs-sort-recent` | `src/features/library/ui/library-screen.tsx:409` | `/library` | Select sort "Recently studied" in the filter sheet |
| A2 | `library/fs-sort-name` | `library-screen.tsx:410` | `/library` | Select sort "Name A–Z" |
| A3 | `library/fs-sort-due` | `library-screen.tsx:411` | `/library` | Select sort "Most due" |
| A4 | `library/fs-f-due` | `library-screen.tsx:416` | `/library` | Toggle filter "Due cards" |
| A5 | `library/fs-f-new` | `library-screen.tsx:417` | `/library` | Toggle filter "New cards" |
| A6 | `library/fs-f-sub` | `library-screen.tsx:418` | `/library` | Toggle filter "Has subdecks" |
| A7 | `library/scope` chip | `library-screen.tsx:493` | `/library` | Scope picker ("All decks") |
| A8 | `library/sort` chip | `library-screen.tsx:496` | `/library` | Open the sort control |
| A9 | `player/options` ⋮ | `src/features/session/ui/player-screen.tsx:62` | `/player` | Player options menu |
| A10 | `review-mode/text-size` | `src/features/session/ui/review-mode-screen.tsx:58` | `/session/review` | Text-size adjustment |
| A11 | `review-mode/options` ⋮ | `review-mode-screen.tsx:59` | `/session/review` | Review options menu |
| A12 | `study-session/options` ⋮ | `src/features/session/ui/study-session-screen.tsx:143` | `/session/play` | Session options menu |

Net effect of A1–A8: the library **filter/sort sheet opens, applies and closes
but is entirely decorative** — no selection changes anything.

## B. Handler exposed by the screen, never wired by route/container (7)

The screen calls its `on*` prop; nothing passes it → silent no-op.

| # | Control | Prop | Where (file:line) | Route | What it should do |
|---|---|---|---|---|---|
| B1 | `flashcard-list/action-move` | `onMoveCard` | `src/features/flashcards/ui/flashcard-list-screen.tsx:412` | `/deck/[deckId]/cards` | Move card to another deck/subdeck (no target flow exists yet) |
| B2 | `flashcard-list/action-hide` | `onHideCard` | `flashcard-list-screen.tsx:413` | `/deck/[deckId]/cards` | Hide card from study (no persistence flag flow exists yet) |
| B3 | `subdeck-list/action-rename` | `onRenameSubdeck` | `src/features/library/ui/subdeck-list-screen.tsx:372` | `/deck/[deckId]` | Rename-subdeck dialog (domain rename use case EXISTS, unwired) |
| B4 | `subdeck-list/action-move` | `onMoveSubdeck` | `subdeck-list-screen.tsx:373` | `/deck/[deckId]` | Move subdeck within the tree (domain move EXISTS, unwired) |
| B5 | `subdeck-list/action-delete` | `onDeleteSubdeck` | `subdeck-list-screen.tsx:374` | `/deck/[deckId]` | Delete-subdeck confirm dialog (domain delete EXISTS, unwired) |
| B6 | `subdeck-list/create-import` | `onImportSubdecks` | `subdeck-list-screen.tsx:358` | `/deck/[deckId]` | Import into subdeck structure |
| B7 | Dashboard bell (dot) | `onNotifications` | `src/features/dashboard/ui/dashboard-screen.tsx:74` | `/` | Notifications surface (no screen exists) |

## C. Wired, but wrong destination or dead key (3)

| # | Control / flow | Where (file:line) | Today | Correct behaviour |
|---|---|---|---|---|
| C1 | `deck-content-choice/import` — "Import from a file" | `src/app/deck/[deckId]/content.tsx:46` | Pushes `/deck/new/cards` during the NEW-deck flow — the flashcard list of a deck that does not exist (empty dead-end) | Route to the import flow (`/settings/import`, after/with deck creation) |
| C2 | Open deck from library | `src/app/deck/[deckId]/index.tsx` (no organisation branch) | ALWAYS renders subdeck-list; a `cards`-organisation deck lands on an empty subdeck screen | Branch by `deck.organisation`: `cards` → flashcard-list, `subdecks` → subdeck-list (WBS 12.12) |
| C3 | `settings/backup` row | `src/app/(tabs)/profile.tsx` (`OPEN_ROUTES` has no `backup` key) | Press does nothing | Backup/Restore screen — intentionally deferred to WBS 10.3, but it IS a shipped dead row until then |

## Disposition (proposed, NOT executed)

- **Fix now (wiring/semantics, no product question):** B3, B4, B5 (domain use
  cases already exist — need dialog + route wiring), C1, C2.
- **Product decision needed (WBS 12.11 — wire or remove):** A1–A12 (each needs
  a real feature behind it: library sort/filter state, session/player/review
  options menus, text-size), B1, B2, B6, B7.
- **Deferred by plan:** C3 (WBS 10.3).

No fixes have been applied on top of this snapshot; the generated inventory
(`node tool/nav_audit/inventory.mjs`) re-derives categories A and B at any
time, so this document can be diffed against a regenerated run after the fix
wave.
