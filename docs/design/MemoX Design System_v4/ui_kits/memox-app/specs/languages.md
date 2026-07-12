# languages — Language Pairs — screen spec

> **Format.** Hand-maintained structural spec (`export_specs.mjs` absent). Source of truth:
> `../_features/languages/Languages.jsx`; PNGs `../shots/languages--<state>--<theme>.png`
> (390×780). Verify: `node tool/ui_kit_shots/shoot.mjs languages` (gated).

## Responsibility

Manage the user's **learning ↔ native language pairs** (each pair owns its decks/cards).
Rehomed from the retired Drawer; reached from **Settings › Study settings › Language pairs**.
One primary objective: add or remove a pair. Domain terms only: *language pair*, *learning*,
*native* — never Folder/Collection.

## States (5, each light + dark)

| # | state | body |
| --- | --- | --- |
| 1 | `list` | nested bar "Language pairs" · card of pair rows (each `translate` · "한국어 → English" · "1240 cards" · trailing delete) · secondary "Add language pair" |
| 2 | `one` | minimum data — a single pair row + add button |
| 3 | `empty` | no pairs — `EmptyState` (`translate`, title, text) + primary "Add language pair" |
| 4 | `add` | nested bar "Add language pair" · LEARNING `LangCard` · downward arrow · NATIVE `LangCard` · primary "Add language pair" |
| 5 | `remove` | `list` + centered `ConfirmDialog` ("Remove 한국어 → English?", danger Remove / ghost Cancel) |

### Composition

- **List** — `MxCard` grouping `ListRow`s; each row a pair with card-count sub and a `delete`
  `MxIconButton`. Below the card, a `secondary` "Add language pair" button (single primary
  objective; the add CTA is the only action-weight element).
- **Add** — two `LangCard`s (learning, native) separated by a direction arrow; a `primary`
  block CTA confirms.
- **Empty** — shared `EmptyState`; its action is the only (primary) CTA.
- **Remove** — shared `ConfirmDialog` over the list; destructive action is `danger`.

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; tokens only. One primary CTA per state. Touch targets
≥ 44×44. Long pair titles (three-line CJK) wrap without clipping the card. Quoted strings are
MOCK COPY.
