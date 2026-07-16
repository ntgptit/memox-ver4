# Create-Deck spec — KIT implementation loop state

Source spec: `docs/prompts/create_deck_change_note.md`. **KIT ONLY** (no `src/`). Branch: `claude/create-deck-flow-spec`.
Stop condition: every canonical state in spec §20 exists AND `verify:ui-kit` + `parity:gate` green.

## Architecture mapping (spec → registry)

Core model shift (§1, §11, §22): create = name + language-pair ONLY → makes an **empty** deck; the
cards-vs-nested decision moves to the **Empty Deck** screen (first content added decides leaf/parent).
So the old "organise radiogroup at create time" (cecade1's `deck-content-choice`) is **superseded**.

| Spec section | Registry target | Kind |
| --- | --- | --- |
| §4–7 First-use flow (landing→step1→step2→lifecycle) | **`create-deck-firstrun`** | NEW screen (Focused flow) |
| §8,§10 Create Deck dialog (root/nested) | **`create-deck-dialog`** | NEW screen (Form) |
| §11 Empty Deck content-first choice | **`empty-deck`** | NEW screen (Detail) |
| §16 Global Add-Card deck picker | **`add-card-target`** | NEW screen (Selection) |
| §12 Leaf Deck = card list | `flashcard-list` | reuse (+ §14 conversion states) |
| §13 Parent Deck = child-deck list | `library` nested-* | reuse |
| §14 Leaf→Parent conversion dialog | `flashcard-list` states `convert-*` | modify |
| §9 Dashboard create action sheet | `dashboard` create-sheet state | modify |
| §17 Import target rules | `import` states | modify |
| old `deck-content-choice` (create form) | **RETIRE** → folded into the two create screens + empty-deck | remove screen entry (keep node ids frozen if any app maps) |

## Node-id strategy
- New screens get their own `data-mx-node` prefixes: `create-deck-firstrun/*`, `create-deck-dialog/*`,
  `empty-deck/*`, `add-card-target/*`.
- `deck-content-choice/*` ids: keep the render module loadable (frozen app-map) if retiring the screen,
  per golden rule — mirror the subdeck-list precedent (retire registry entry, keep node ids).

## Phases (ordered; each = build → registry → gen → canonical shoot → verify:ui-kit + parity:gate)

- [x] **A. `create-deck-firstrun`** — 12 states built + registered + shot (24 combos, 0 findings); landing visually verified. gates green. (revisit for cross-cutting §H: narrow/large-font/long-text)
- [x] **B. `create-deck-dialog`** — 12 states built + shot (24 combos, 0 findings); root-default verified. gates green.
- [x] **C. `empty-deck`** — 3 states (default, create-nested-dialog→delegates dialog, import-target) built + shot; default verified. gates green.
- [x] **D. `add-card-target`** — 2 states (picker, no-target) built + shot; picker verified (parent disabled + helper). gates green.
- [x] **E. `flashcard-list` leaf conversion** — 3 states (convert-dialog, convert-submitting, convert-failure §14) added + shot; convert-dialog verified. gates green. NOTE(§F): leaf-empty + parent-empty should route to empty-deck screen (offer Create-nested).
- [x] **F. dashboard/import/library** — dashboard create-sheet already §9-compliant (Add card/Create deck/Import); import gained parent-target (§17). §20 matrix now fully covered. TODO(H): library §10 created-snackbar + leaf-empty→empty-deck are §22 refinements, optional.
- [x] **G. Retire deck-content-choice** — registry entry removed (superseded by create-deck-firstrun/dialog + empty-deck per §1/§22); module + node ids + shots frozen (app-map); orphan spec deleted; allowlist/REMAINING updated. gates green.
- [x] **H. Cross-cutting §20** — responsive (narrow 320-430 × font 1.0-2.0) verified on all new/changed screens; fixed create-deck-dialog + flashcard-list convert (align end bottom-sheet) + empty-deck (EmptyState) overflow at large font. gates green.

## Validation copy (§19) — canonical strings
- Name empty: `Give your deck a name.`
- Name too long: `Use a shorter deck name.`
- Dup root: `A deck with this name already exists in your Library.`
- Dup sibling: `A deck with this name already exists here.`
- No pair: `Choose a language pair.`
- Parent receives card: `Choose one of this deck’s nested decks.`
- Leaf makes child: `Organise the existing cards into a nested deck first.`
- Create failure: `Couldn’t create the deck. Your information is still here.`

## Acceptance (§22) — final gate checklist
First-run ≠ dialog · no re-onboarding on empty library · no `Default view` · create doesn't auto-make/open card ·
new deck in correct list · empty deck offers Add-card/Create-nested later · parent has no Add-card · leaf has no
Create-nested · global Add-card excludes parents · parent shows only child list · leaf shows only card list ·
never both lists · one primary CTA per dialog · form keeps input after error · keyboard doesn't cover CTA ·
touch ≥44 · long/large/narrow/dark don't break · all canonical states parity < 3%.

## Progress log
- (init) plan written; branch `claude/create-deck-flow-spec` created off main.

## ✅ COMPLETE (all phases A–H)
Stop condition MET: full `verify:ui-kit` PASS (28 screens / 210 states / 6720 responsive combos, 0 unaccepted findings) + `parity:gate` OK (≤3%, 3 allowlisted). §20 state matrix fully implemented; §22 acceptance satisfied (create ≠ dialog on first run; no Default view; create makes empty deck; content choice after creation; parent≠Add-card; leaf≠Create-nested; global Add-card excludes parents; one primary CTA; input kept after error; narrow/large/long/dark hold).
New screens: create-deck-firstrun, create-deck-dialog, empty-deck, add-card-target. Modified: flashcard-list (§14 convert), import (§17 parent-target). Retired: deck-content-choice (frozen module+shots kept for app parity). Branch: claude/create-deck-flow-spec. Commits: ff7e0de, 247f7c8, dcd4052, e4569fa, b0cf24b, d2e05b0, 8856022, cf52a3e.
