# features

One folder per feature area. Each `features/<feature>/` has `domain/` (pure TS use cases),
`data/` (repositories over `@/db`), and `ui/` (screens + feature-local components importing
`@/design-system`). Domain imports neither UI nor DB. See `docs/adr/0001-architecture.md`.
