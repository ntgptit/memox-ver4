# db

Offline-first persistence source of truth. `schema/` (tables), `migrations/` (forward-only,
WBS 0.5), `client.ts` (DB client + transaction helper). Gated by the DEP-DB decision (WBS 0.4).
See `docs/adr/0001-architecture.md`.
