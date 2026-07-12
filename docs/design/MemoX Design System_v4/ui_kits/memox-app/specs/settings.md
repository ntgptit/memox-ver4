# settings — Settings — screen spec

> **Format.** Hand-maintained structural spec (`export_specs.mjs` absent; the prior 65 KB DOM
> dump is superseded by the hierarchical IA below). Source of truth:
> `../_features/settings/Settings.jsx`; PNGs `../shots/settings--<state>--<theme>.png`
> (390×780). Verify: `node tool/ui_kit_shots/shoot.mjs settings` (gated).

## Responsibility

The Profile-tab destination. **Hierarchical IA:** a flat root with a single **Study settings**
hub row (plus app-level rows), and the hub opens one child screen per study concern. This IA
absorbed everything that used to live in the retired Drawer — study rows are grouped, language
management moved to its own **Language Pairs** screen, and **Export** got a home under APP.

## States (7, each light + dark)

| # | state | body |
| --- | --- | --- |
| 1 | `loaded` | root — `variant="root"` bar "Settings" + bottom nav · Profile card · **STUDY**: one row "Study settings" → hub · **APP**: Theme · Reminders · Backup / Restore · Export cards |
| 2 | `study-hub` | nested bar "Study settings" · one card of 5 rows: Language pairs → Language Pairs screen · Word display · Spaced repetition · Mode settings · Voice |
| 3 | `study-worddisplay` | child — Meaning language · Color by gender (switch) · Show romanization (switch) |
| 4 | `study-srs` | child — Leitner boxes · Intervals (days) · Due notifications (switch) |
| 5 | `study-mode` | child — Words per round · Shuffle cards (switch) · Autoplay audio (switch) |
| 6 | `study-voice` | child — Text-to-speech (switch) · Speech rate · Speech-to-text (switch) |
| 7 | `value-picker` | `loaded` + `ValuePickerSheet` bottom sheet |

### Composition

- **Root** — Profile card, then two labelled sections. STUDY holds exactly one row ("Study
  settings") that routes to the hub; APP holds Theme, Reminders, Backup / Restore, Export cards
  (Export routes to the existing Export screen; Import stays in Library by deck context).
- **Hub + children** — every child is a `nested` app bar (back + title) over a single grouped
  `MxCard` of `ListRow`s; value rows show a chevron `Val`, boolean rows an `MxSwitch`. The
  Spaced-repetition child is the former `group-expanded` card, now a first-class screen.
- **Language pairs** row is a pointer into the standalone **Language Pairs** screen
  (`languages.md`), not an inline list.

## Handoff notes

Spacing scale `{4,8,12,16,24,32,48}`; tokens only. Root is the only `variant="root"` bar with a
bottom nav; every child is nested (no bottom nav). Max one primary objective per screen — these
are navigation/config surfaces, so no competing CTA. Touch targets ≥ 44×44. Quoted strings are
MOCK COPY.
