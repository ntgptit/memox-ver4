# Remaining kit ↔ app parity divergences

Snapshot after the overlay-composite + component-token + MxButton fixes. Run
`npm run parity:app` to refresh. Every 50–69% overlay offender is now < 17%.
What's left splits into three buckets — only bucket C is "more chrome to fix".

## A. Semantic / product divergences (NOT conversion bugs — need a product call)

These render correctly; they diverge because the RN feature was designed
differently from the kit mock. Do not force-convert without a decision.

| Screen | % | Divergence |
| --- | --- | --- |
| `deck-settings--move` | 16.5 | Kit moves a deck **between decks** (Library root / TOPIK Prep / This deck); RN moves it **between language pairs**. Different destinations, different feature. |
| `languages--add` | 11.6 | Kit is a **preset language picker** (two LangCards + dropdowns); RN is **free-text entry** (two MxTextFields). Different interaction model. |

If the product intent is the kit's model, these are feature reworks, not
styling — scope them as their own tasks.

## B. Text-reflow / anti-alias noise (acceptable — no action)

The kit shoots at 2× DPR and RN-web rasterizes text/AA differently, so body
copy wraps at slightly different widths. Residual diff, structurally identical.

| Screen | % |
| --- | --- |
| `deck-settings--delete-confirm` | 10.7 |
| `deck-settings--rename` | 9.1 |
| `deck-settings--reset-confirm` | 7.5 |
| `search--results--dark` | 9.6 |
| `languages--empty` | 7.5 |

## C. Study-screen card-layout rebuilds (real drift — scoped per screen)

The study modes (recall / fill / guess) were built with a **compact** card
layout; the kit uses **large, flex-fill** cards with richer card anatomy
(e.g. recall's prompt card has an edit pencil top-right + a speaker
bottom-right; the answer card is a tall empty surface with a centered
"Recall the meaning, then tap Show" hint, and the action is bottom-anchored).
The shared `ProgressHeader` is already aligned to the kit (single-row bar +
`done/total`); the remaining diff is per-screen card structure.

| Screen | % |
| --- | --- |
| `fill-mode--*` | 7–14 |
| `recall-mode--*` | 4–14 |
| `guess-mode--*` | 4–9 |

Fixing these means rebuilding each study screen's card layout to the kit
composition (not a token/component tweak). Recommended as a follow-up slice
per mode, verified against its kit shots via `npm run parity:app`, because
each touches working session-play wiring and should be reviewed on its own.
