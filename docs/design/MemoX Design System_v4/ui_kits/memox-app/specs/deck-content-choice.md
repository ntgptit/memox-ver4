# deck-content-choice — Deck Content Choice — screen spec

> **Format.** Hand-maintained structural spec (`export_specs.mjs` absent). Source of truth:
> `../_shared/DeckContentChoice.jsx`; PNGs `../shots/deck-content-choice--default--<theme>.png`
> (390×780). Verify: `node tool/ui_kit_shots/shoot.mjs deck-content-choice` (gated).

## Responsibility

The decision state for a brand-new deck that has **neither subdecks nor cards yet**. Replaces
the old mixed `empty` state. One question, exactly **two** primary choices, no competing FAB,
no search / filter / list. No `branch` / `leaf` terminology in copy.

## States (1, each light + dark)

| # | state | body |
| --- | --- | --- |
| 1 | `default` | nested app bar (deck title) · one heading "How do you want to organise this deck?" · two choice cards · tertiary import link |

### Composition

- **Heading** (single top-level) — "How do you want to organise this deck?".
- **Choice 1** — `account_tree` tile · "Organise with subdecks" · "Create nested topics
  before adding cards." · chevron → routes to **Subdeck List**.
- **Choice 2** — `playing_cards` tile · "Add cards directly" · "Use this as a final study
  deck." · chevron → routes to **Flashcard List**.
- **Tertiary** — centred `MxLink` "Import from a file" (never a third primary CTA).

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; tokens only. Exactly one primary objective (choose a
direction); import stays tertiary. Touch targets ≥ 44×44. Quoted strings are MOCK COPY.
