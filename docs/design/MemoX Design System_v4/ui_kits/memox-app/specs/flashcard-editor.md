# flashcard-editor — Card Editor — screen spec

> **Format.** Hand-maintained structural spec (the DOM-dump exporter `export_specs.mjs` is
> absent from this repo). Sources of truth: `../_features/flashcard-editor/FlashcardEditor.jsx`
> (+ `components/{Field,DupBanner,AudioRow}.jsx`); PNGs
> `../shots/flashcard-editor--<state>--<theme>.png` (390×780). Verify:
> `node tool/ui_kit_shots/shoot.mjs flashcard-editor` (gated).

## Responsibility

A **focused form** to create or update ONE flashcard. Single primary objective, single primary
action = **Save**. **Progressive disclosure**: the default view shows only **Term → Meaning**
(+ Tags) so a blank card fits one screen with no scroll; Example, additional translation and
advanced options are one tap away. Same design language as Dashboard / Library / Subdeck List /
Flashcard List.

## Shared anatomy

- **App bar** — `MxContextualAppBar variant="focused"`: `Close(✕) · centered title · —`. The
  top-right is intentionally empty; **Save moved to a sticky bottom bar** so it is reachable
  one-handed. Title fixed ("New card" / "Edit card"), centered.
- **Sticky Save bar** — a bottom action bar (`SaveBar`, via `MxScaffold bottomNav`) holding a
  **"Create another card after saving"** checkbox (`KeepAdding`) above a full-width `MxButton`
  block. Save states: Disabled (create / validation / submit-success) · Enabled · `Saving…`
  (submitting, disabled) · `Done` (success, disabled). Never active on a blank/invalid/pristine
  form. Width/label stable → no layout shift.
- **Deck context** — a **prominent pill** (`folder` icon · "Deck" · **bold deck name**) under
  the bar; anchors the target deck without outweighing the title.
- **Language labels are DECK-DRIVEN** — never hard-coded. `Term · <termLang>`,
  `Meaning · <meaningLang>`, `Translation · <altLang>` read from the deck (fixture Beginner
  Grammar → 한국어 / English / Tiếng Việt), so every language pair reads correctly.
- **Groups** (priority order): Card content (Term, Meaning) → Tags → More options. Spacing:
  screen padding 16; group gap 24 (scaffold), related items 12, label→field 8.

## Components (feature-local)

- `Field` — label **row** (label + optional `labelAction`) · input surface · supporting/error
  text. States: default / filled / focused (accent) / error (error border + message) / disabled
  (sunken, dimmed). **Term & Meaning share the same base height** (min = touch target);
  `multiline` lets Meaning grow line-by-line as it wraps. Records runtime keyboard intent as
  design-intent `data-*` (lang, input-mode, autofocus, enter-key-hint) for production. Used ONLY
  for real input (Term, Meaning, Translation, Example, Example translation).
- `AudioRow` — the **compact pronunciation control** (a small icon button inside the Term field
  `trailing` slot, not a row): `volume_up` (tap to hear) / spinner (generating, disabled) /
  error→retry. Auto-generated from the term; no autoplay.
- `TagsField` (in `FlashcardEditor.jsx`) — compact tag input (leading `sell` icon · `MxChip`
  tags, or placeholder). For filtering / SRS cycles; low weight.
- `DupBanner` — compact warning (not error); **View existing** (secondary, emphasized) ranks
  above **Add anyway** (ghost). Actions wrap at 320px.
- `VisibilityRow` (in `FlashcardEditor.jsx`) — flat compact "Hide during study" switch row,
  tucked inside **More options** (advanced, off the main flow).
- `Banner` — soft-tone recoverable submit error/success (Library offline/error treatment).

## Progressive disclosure

- **Add translation** — a `+` `MxIconButton` beside the **Meaning** label; expands the
  `Translation · <altLang>` field (the `additional-translation` state), which carries a Remove.
- **More options** — a collapsed text toggle (`expand_more` "More options"); expands to
  **Example**, **Example translation** (both `Field`, deck-lang scoped) and the
  **Hide during study** switch. Collapsed by default (open in the `edit` fixture).

## States (9, each light + dark)

| # | state | Save | notes |
| --- | --- | --- | --- |
| 1 | `create` | disabled | blank Term + Meaning; More options collapsed; autoFocus Term |
| 2 | `edit` | enabled | prefilled (dirty); tags + More options expanded (Example pair) |
| 3 | `validation` | disabled | blank + `Enter a term.` / `Enter a meaning.` error borders |
| 4 | `duplicate` | enabled | prefilled + DupBanner (View existing > Add anyway) |
| 5 | `additional-translation` | enabled | `Translation · Tiếng Việt` field + Remove |
| 6 | `audio-generating` | enabled | Term pronunciation icon → spinner (Play disabled) |
| 7 | `submitting` | `Saving…` (disabled) | all editable controls + Close disabled; no double submit |
| 8 | `submit-error` | enabled | values retained + error Banner ("changes are still here") + Try again |
| 9 | `submit-success` | `Done` (disabled) | success Banner; can't re-save unchanged data |

## Interaction contract

- Invalid (blank Term/Meaning) → Save disabled; validation errors show after a save attempt /
  blur (not on a freshly-opened Create form).
- **Runtime keyboard/focus (production, annotated in the kit):** Term gets the term-language
  keyboard (`lang`/`inputMode`) and `autoFocus` on Create; `enterKeyHint="next"` flows Term →
  Meaning → Translation, switching keyboard language per field.
- **"Create another card after saving" (`KeepAdding`, production behaviour):**
  - **checked** → Save → persist card → transient success **toast** → **clear all inputs** →
    **refocus Term** (rapid consecutive entry, no re-navigation).
  - **unchecked** → Save → persist card → **close** the editor (navigate back to the card list).
  - **State persistence** — remember the last checked/unchecked choice across cards so the
    learner ticks it once and keeps adding (annotated `data-persist="last-choice"`).
- Dirty Close/Cancel → shared `ConfirmDialog` ("Discard changes? / Keep editing · Discard") —
  same reference as Deck Settings; not a 10th top-level state. No prompt when pristine/empty or
  after success.
- Global-Create adds a required "Save to <deck>" selector before Save.

## Handoff notes

Tokens only (`--memox-*`); no glow/purple shadow. Quoted strings are MOCK COPY. Touch targets
≥ 44×44. Light/Dark parity holds fixtures, validation, audio, and submit status constant.
