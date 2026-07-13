# ADR 0005 — Local database + schema outline (WBS 0.4)

- **Status:** Accepted — **DEP-DB approved** (Human owner, 2026-07-13)
- **WBS:** 0.4 Local database decision
- **Depends on:** ADR 0001 (architecture)

## Decision

Adopt **`expo-sqlite` `~57.0.0`** (installed; config plugin registered in `app.json`) as the **offline-first single source of truth**. All decks, subdecks, cards, languages, sessions, attempts and SRS state live in SQLite on-device; the UI derives from it and writes through repositories/use cases (ADR 0001/0003). No network is required to create or study content; cloud sync (WBS 10.2/10.3) is an additive layer that reconciles with this local DB, never replacing it.

`DEP-DB` in the Dependency Approval Register is set **Approved**. This unblocks WBS 0.5 (migration strategy). The persistence rows (3.2, 4.2, 5.2, 11.2) remain blocked on their other prerequisites (0.5 migrations, feature domains, the test harness 0.13).

## Access-layer contract (implemented in WBS 0.5 / *.2)

- `src/db/client.ts` — opens the named database (`memox.db`) via `expo-sqlite`, exposes `getDb()` and a `tx(work)` transaction helper (BEGIN/COMMIT/ROLLBACK) so multi-table writes are atomic (WBS 3.2/4.2/5.2 rollback tests).
- `src/db/schema/` — table definitions. `src/db/migrations/` — forward-only versioned migrations keyed by `PRAGMA user_version` (WBS 0.5).
- Repositories (`features/*/data`) depend on the `shared/contracts` interfaces (WBS 0.7) and never leak SQL above the data layer.

## Schema outline (tables — columns finalized per feature slice)

| Table | Purpose | Key columns |
|---|---|---|
| `language_pair` | learning↔native pairs (WBS 3.3) | `id`, `learning`, `native`, `created_at` |
| `deck` | top-level deck | `id`, `title`, `language_pair_id`, `organisation` (`subdecks`\|`cards`), `created_at`, `updated_at` |
| `subdeck` | subdeck within a deck (self-nesting) | `id`, `deck_id`, `parent_id` (nullable), `title`, `position` |
| `card` | flashcard | `id`, `deck_id`, `subdeck_id` (nullable), `term`, `meaning`, `tags`, `audio_ref`, `created_at`, `updated_at` |
| `card_translation` | additional meanings/translations | `id`, `card_id`, `text`, `position` |
| `srs_state` | per-card scheduling | `card_id` (pk), `due_at`, `interval`, `ease`, `reps`, `lapses`, `stage` |
| `session` | a study session | `id`, `deck_id`, `mode`, `scope`, `status`, `started_at`, `finalized_at` |
| `attempt` | per-stage answer within a session | `id`, `session_id`, `card_id`, `stage`, `result`, `answered_at` |
| `reminder` | daily reminder config (WBS 8.2) | `id`, `enabled`, `time`, `days` |
| `app_setting` | key/value app + study settings (WBS 10.1) | `key` (pk), `value` |

Constraints (indexes, FKs, cascade rules) and exact column types are fixed by each owning persistence slice; migrations are forward-only and tested (WBS 0.5/11.2). Invariants (no orphan subdeck/card; deck card-count consistency) are enforced by the domain layer (WBS 3.1/4.1) + transactional writes.

## Consequences

- Restart preserves all data (offline-first); multi-table writes are transactional with rollback.
- `expo-sqlite` is now an approved dependency; no further approval needed for the persistence rows.
- WBS 0.5 (migrations) is unblocked and becomes the next persistence prerequisite.
