# flashcard-editor — Card Editor — screen spec

> **Format.** Hand-maintained structural spec (the DOM-dump exporter `export_specs.mjs` is
> absent from this repo). Sources of truth: `../_features/flashcard-editor/FlashcardEditor.jsx`
> (+ `components/{Field,DupBanner,AudioRow}.jsx`); PNGs
> `../shots/flashcard-editor--<state>--<theme>.png` (390×780). Verify:
> `node tool/ui_kit_shots/shoot.mjs flashcard-editor` (gated).

## Responsibility

A **focused form** to create or update ONE flashcard. Single primary objective, single primary
action = **Save**. Secondary settings (audio, additional translation, visibility) must not
compete with the card content. Same design language as Dashboard / Library / Subdeck List /
Flashcard List.

## Shared anatomy

- **App bar** — `MxContextualAppBar variant="focused"` (`components/surfaces/MxContextualAppBar.jsx`):
  `Close · title · Save`. Solid surface + divider, sticky. No notification / avatar / bottom
  nav / FAB. Title is **centered** and fixed ("New card" / "Edit card") — it never shifts
  across states because the Save action reserves `--memox-size-lg` width (≥ "Saving…").
- **Save states** — Disabled (create / validation / submit-success) · Enabled · `Saving…`
  (submitting) · `Done` (success, disabled). Never active on a blank/invalid/pristine form.
- **Deck context** — a light `Deck · Beginner Grammar` line under the bar (not a card, never
  outweighs the title).
- **Groups** (priority order): Card content → Additional translation → Pronunciation → More
  options. Spacing: screen padding 16; group gap 24 (scaffold), related items 12, label→field 8.

## Components (feature-local)

- `Field` — label · input surface · supporting/error text. States: default / filled / focused
  (accent border) / error (error border + message) / disabled (sunken, dimmed). Used ONLY for
  real input (Term, Meaning, Translation).
- `AudioRow` — dedicated pronunciation row (subtle sunken surface, status glyph, action
  buttons); NOT a text field. Statuses: auto / none / generating (spinner, Play disabled) /
  ready / error. No autoplay.
- `DupBanner` — compact warning (not error); **View existing** (secondary, emphasized) ranks
  above **Add anyway** (ghost). Actions wrap at 320px.
- `VisibilityRow` (in `FlashcardEditor.jsx`) — flat compact settings row, switch trailing.
- `Banner` — soft-tone recoverable submit error/success (Library offline/error treatment).

## States (9, each light + dark)

| # | state | Save | notes |
| --- | --- | --- | --- |
| 1 | `create` | disabled | blank Term + Meaning; no grammatical gender (Korean) |
| 2 | `edit` | enabled | prefilled (dirty) values |
| 3 | `validation` | disabled | blank + `Enter a term.` / `Enter a meaning.` error borders |
| 4 | `duplicate` | enabled | prefilled + DupBanner (View existing > Add anyway) |
| 5 | `additional-translation` | enabled | Translation (Vietnamese) field + Remove |
| 6 | `audio-generating` | enabled | AudioRow spinner + "Generating…", Play disabled |
| 7 | `submitting` | `Saving…` (disabled) | all editable controls + Close disabled; no double submit |
| 8 | `submit-error` | enabled | values retained + error Banner ("changes are still here") + Try again |
| 9 | `submit-success` | `Done` (disabled) | success Banner; can't re-save unchanged data |

## Interaction contract

- Invalid (blank Term/Meaning) → Save disabled; validation errors show after a save attempt /
  blur (not on a freshly-opened Create form).
- Dirty Close/Cancel → shared `ConfirmDialog` ("Discard changes? / Keep editing · Discard") —
  same reference as Deck Settings; not a 10th top-level state. No prompt when pristine/empty or
  after success.
- Grammatical gender belongs in **More options** and appears only for languages that have it
  (not Korean). Global-Create adds a required "Save to <deck>" selector before Save.

## Handoff notes

Tokens only (`--memox-*`); no glow/purple shadow. Quoted strings are MOCK COPY. Touch targets
≥ 44×44. Light/Dark parity holds fixtures, validation, audio, and submit status constant.
