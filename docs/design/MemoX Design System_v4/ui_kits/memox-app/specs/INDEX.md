# UI Kit DOM Specs — Manifest

> **Note.** The DOM-dump exporter (`tool/ui_kit_shots/export_specs.mjs`) and freshness gate
> (`tool/verify/run.mjs`) are **not present in this repository**, so the per-node DOM specs
> can no longer be auto-refreshed. New/updated specs are hand-maintained structural specs
> (see `subdeck-list.md`, `flashcard-list.md`, `deck-settings.md`, `deck-content-choice.md`,
> `library.md`); the remaining older specs are the last auto-generated DOM dumps. Source of
> truth is the screen `*.jsx` + the reference PNGs in `../shots/`.

| ID | Screen | Spec file | States |
| --- | --- | --- | --- |
| dashboard | Today | `dashboard.md` | 5 |
| library | Library | `library.md` | 12 |
| subdeck-list | Subdeck List | `subdeck-list.md` | 12 |
| flashcard-list | Flashcard List | `flashcard-list.md` | 15 |
| deck-settings | Deck Settings | `deck-settings.md` | 5 |
| deck-content-choice | Deck Content Choice | `deck-content-choice.md` | 1 |
| flashcard-editor | Card Editor | `flashcard-editor.md` | 9 |
| mode-picker | Mode Picker | `mode-picker.md` | 3 |
| match-mode | Match | `match-mode.md` | 6 |
| guess-mode | Guess | `guess-mode.md` | 5 |
| recall-mode | Recall | `recall-mode.md` | 5 |
| fill-mode | Fill | `fill-mode.md` | 6 |
| review-mode | Review | `review-mode.md` | 4 |
| player | Player | `player.md` | 4 |
| study-result | Study Result | `study-result.md` | 7 |
| search | Search | `search.md` | 5 |
| statistics | Stats | `statistics.md` | 4 |
| reminder | Reminders | `reminder.md` | 3 |
| account-sync | Account & Sync | `account-sync.md` | 5 |
| theme | Theme | `theme.md` | 3 |
| import | Import | `import.md` | 5 |
| export | Export | `export.md` | 3 |
| drawer | Drawer & Languages | `drawer.md` | 3 |
| study-session | Study Session (5 stages) | `study-session.md` | 10 |
| settings | Settings | `settings.md` | 3 |

Total: 25 screens · 142 states.
