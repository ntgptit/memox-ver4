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

## Accepted residual (below 3%, no action)

The kit shoots at 2× DPR and RN-web rasterizes text differently, so pairs
with dense text (dialogs ~2.6–2.8%, choice grids ~2.6%) carry unavoidable
anti-aliasing residue. Structural geometry is aligned — verified
band-by-band with pixel measurements, not by eye.

## Comparison gaps (no kit counterpart)

- `deck-content-choice--named` and `shell-dashboard--loaded` have no
  same-named kit reference shot; they are listed by the report but cannot
  be scored. The dashboard is still a placeholder slice (WBS 5.3).
