# Remaining kit ↔ app parity divergences

Status after the full parity push (safe-area floor, kit body bottom band,
dialog content-box geometry, study-screen rebuilds, picker add-form,
fractional line-height): **40 of 41 compared pairs are below 3%** —
most below 1.5%, the study modes at 0.3–1%. Run `npm run parity:app`
to refresh.

## The one pair above 3%

| Screen | % | Why |
| --- | --- | --- |
| `deck-settings--move` | ~10 | **Semantic, by design.** The kit mock moves a deck *between decks* (`Library (root)` / `TOPIK Prep` / `This deck`); the shipped domain moves a deck *between language pairs* (`moveDeckUseCase` in `src/features/library/domain/use-cases.ts` — decks live under language pairs, subdecks under decks). The sheet chrome, row anatomy (icon tile · bold title · radio · muted current) and the select-then-apply `Move` flow all match the kit; only the destination row TEXT differs, which is the product's real data model. Closing this gap means changing the kit mock's fixture copy, not the app. |

## Deck-model unification (kit leads the app)

The kit treats **Deck and Subdeck as one model** — a "subdeck" is just a `Deck` with a
non-null `parentId` (root deck = `parentId: null`), not a separate object. The kit's copy,
fixtures (`id` + `parentId`) and components (`DeckRowCard`, `CreateDeckSheet`) reflect this;
user-facing "Subdeck" wording became "Deck" / "nested deck". Most screens (subdeck-list,
library) stay **below 3%** after the copy change, but two pairs cross the gate and are
allowlisted:

| Screen | % | Why |
| --- | --- | --- |
| `deck-content-choice--default` (light + dark) | ~6 | **Kit screen RETIRED** (create_deck_change_note spec §1/§22): creation no longer asks cards-vs-nested and has no Default view — that decision moved to the new `empty-deck` screen, and creation is `create-deck-firstrun` / `create-deck-dialog`. The frozen `deck-content-choice--*` shots are kept ONLY as the parity reference for the app's still-shipping screen (~6% vs app baseline; app also has a `deck-content-choice--named` state with no kit counterpart). **Follow-up:** migrate the app to the new create flow, then retire the `deck-content-choice--*` pair + this allowlist entry. |

Frozen contract kept stable per AGENTS.md golden rule: the group `SubdeckList` and all
`subdeck-*` / `subdeck-list/*` `data-mx-node` ids are unchanged (the app maps onto them). Only
display copy, fixtures and internal component file names changed.

### One screen for every deck level (kit leads the app)

Because a nested deck IS a Deck (just `parentId != null`), the kit now models **one deck-list
screen** — `library` — for every level, instead of two. The library screen renders the root
(`parentId: null`, bottom-nav tab) directly and **delegates its `nested-*` states** to the same
`SubdeckList` render module (a deck's child decks: pushed chrome, back + breadcrumb + Deck
Settings). The `subdeck-list` **registry/spec screen entry was retired** (folded into `library`);
its render module, `SubdeckList` group and every `subdeck-list/*` node id are **kept frozen** — the
delegation renders those exact node ids, so no app-mapping identifier moved.

Kit ↔ app screen-count divergence (app alignment tracked):

| Concern | Kit (now) | App (still) |
| --- | --- | --- |
| Deck list | **1** screen `library` (root + `nested-*`) | **2** screens `library` + `subdeck-list` |
| Parity refs | `library--nested-*` shots (kit-only, no app baseline yet) | `subdeck-list--*` baselines still diff the **frozen** `subdeck-list--*` kit shots (kept) — all ≤ 3% |

The frozen `subdeck-list--*` kit shots are retained precisely so the app's still-present
subdeck-list screen keeps a real parity reference until the app merges its two screens. They show
the **pre-chrome-merge** nested design (no controls row / bottom nav), matching the app as shipped;
the newer `library--nested-*` shots show the merged design where nested mode is **chrome-identical
to the Library root** (FilterRow + bottom nav, back + breadcrumb). **Follow-up:** collapse the
app's `library` + `subdeck-list` into one screen with the shared chrome, re-baseline its goldens
against `library--nested-*`, then retire the `subdeck-list--*` shots.

## Accepted residual (below 3%, no action)

The kit shoots at 2× DPR and RN-web rasterizes text differently, so pairs
with dense text (dialogs ~2.6–2.8%, choice grids ~2.6%) carry unavoidable
anti-aliasing residue. Structural geometry is aligned — verified
band-by-band with pixel measurements, not by eye.

## Comparison gaps (no kit counterpart)

- `deck-content-choice--named` and `shell-dashboard--loaded` have no
  same-named kit reference shot; they are listed by the report but cannot
  be scored. The dashboard is still a placeholder slice (WBS 5.3).
- **Create-Deck flow reconnected the entry points (kit-ahead vs the app's current build):**
  - `library--create-sheet` (~62%): the Library FAB now opens the Create Deck **dialog** directly
    (§10), replacing `LibraryCreateSheet`. `flashcard-list--empty` (~4%): a leaf that lost its last
    card is now the unified **Empty Deck** screen (§15). Both allowlisted; the old
    `LibraryCreateSheet`/`CreateDeckSheet` components + `library/create-*` / `subdeck-list/create-*`
    node ids are kept for the app's still-shipping build. **Follow-up:** migrate the app, then drop
    these two allowlist entries.
  - The nested create sheet + parent-empty are delegated to the same dialog / empty-deck; those kit
    shots are kit-only (no app pair). New entry to the Leaf→Parent conversion lives in
    `deck-settings--leaf-actions` ("Organise into nested decks"), kit-only.
- **Create-Deck flow screens are kit-only (kit-ahead)** — `create-deck-firstrun`,
  `create-deck-dialog`, `empty-deck`, `add-card-target` (plus `import--parent-target` and
  `flashcard-list--convert-*`) have **no app_golden baseline**, so the construction-contract §8/§9
  parity gate (< 3% per screen) cannot run yet. They implement `docs/prompts/create_deck_change_note.md`
  ahead of the app. **Follow-up (per screen, when the app builds it):** add its canonical states to
  `tool/app_golden/shoot.mjs` TARGETS → `npm run golden:update` → `npm run parity:gate`. The app
  already ships `create-deck-dialog` (screenshot) but at a divergent input height — the kit fixed the
  field to ~48px (`box-sizing:border-box`); the app must re-sync to match.
- `library--nested-*` (15 states × 2 themes) are **kit-only** — the merged
  library screen's nested mode has no app baseline yet (the app still ships a
  separate `subdeck-list` screen). They are not scored until the app screen
  merge lands; the app's `subdeck-list--*` pairs remain scored against the
  retained frozen kit shots in the meantime.
