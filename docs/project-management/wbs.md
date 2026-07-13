# MemoX v4 — Production Implementation WBS

Turns the **UI Kit design system** (`docs/design/MemoX Design System_v4/`) into an implementation
plan for **Expo SDK 57 + React Native + Expo Router**, delivered as **vertical slices**:

```
Screen/state → domain/use case → repository → local persistence → tests → visual verification
```

## Source of truth

- **Screens / states / archetype / objective / CTA:** `tool/ui_kit_shots/registry.mjs` (26 screens · 168 states). This WBS does not rename or add/remove any screen or state.
- **Per-screen specs:** `docs/design/MemoX Design System_v4/ui_kits/memox-app/specs/<id>.md`.
- **Canonical reference PNGs:** `docs/design/MemoX Design System_v4/ui_kits/memox-app/shots/<id>--<state>--<theme>.png` (336).
- **Construction rules:** `docs/design/mobile-ui-construction-contract.md`.
- **Design system tokens/components:** `docs/design/MemoX Design System_v4/tokens/*.css`, `.../components.css`, `.../components/**/Mx*.jsx` (18 primitives), `.../readme.md`, `.../SKILL.md`.

## Repository reality (baseline `ce0f8bb`)

Production is a **fresh Expo Router scaffold**, not MemoX. Verified present: `src/app/{index,explore,_layout}.tsx`, `src/components/*` (starter widgets — `themed-text`, `app-tabs`, `animated-icon`, …), `src/constants/theme.ts`, `src/hooks/use-color-scheme.ts`, `src/global.css`, `scripts/reset-project.js`, `assets/`. **Absent:** `app/` at root, any `Mx*` production component, any domain / repository / persistence / feature code, any production test. Therefore **no** feature is `Implemented` or `Partial`; every business row is `Specified` or `Blocked`. The UI Kit being complete does **not** make any production feature `Implemented`.

## Status contract

| Status | Meaning |
|---|---|
| `Implemented` | Production source + tests + docs evidence exist |
| `Partial` | Real implementation exists but acceptance not fully met |
| `Specified` | Enough information for an agent to start |
| `Blocked` | Missing dependency, decision, or upstream work |
| `Future` | Outside current MVP |
| `Deprecated` | No longer used |

Only rows marked `Implemented`/`Partial` cite a real repo-root implementation path in **Evidence/Source**. `Specified`/`Blocked` rows cite the **spec** source (registry, specs, shots, contract) and name the **target** production path to be created (marked *(to create)*, never claimed as existing).

## Dependency identifiers

Every token in a **Dependencies** cell is either a **WBS id** (`N.N`) or a **capability id** from the Dependency Approval Register (`DEP-…`). Section-level wildcards, ad-hoc dependency labels and placeholder groups are not used — a dependency is always a concrete work-package id or a registered capability id.

## Row legend

- **Parallel** = may run concurrently with peers. `No` = touches a shared surface (Expo Router tree, design-system primitives, DB schema, `wbs.md`) and must be serialized against other writers of that surface.
- **Owner:** `Opus` = Claude Code Opus (write). `Codex` = read-only audit/regression/scope guard. `Design` = Claude Design (composition map, kit mapping, screenshot comparison). `Human` = approval only.
- **Commit:** `TBD` until the package lands; then the squash-merge hash.

---

## 0. Governance and Architecture

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.1 | Production folder architecture | Define `src/` layout: `src/app` routes, `src/features/<feature>/{domain,data,ui}`, `src/design-system`, `src/shared`, `src/db`; retire starter widgets not reused | all | — | Implemented | P0 | No (defines shared tree) | ADR committed; every later target path derives from it; no starter route claimed as MemoX; folder rules match a chosen contract | `docs/adr/0001-architecture.md`; `src/{design-system,features,shared,db}/README.md` (skeleton) | Opus + Human | TBD |
| 0.2 | Expo Router strategy | Route tree + groups: `(tabs)` root nav, study `session` group, modal routes for sheets, typed routes; map registry screens → routes | app-bar, all | 0.1 | Implemented | P0 | No (owns route tree) | Every non-shared registry screen has one route; typed-routes build passes; back/deep-link behavior specified per screen | `docs/adr/0002-routing.md`; `src/app/**` (26 route files + layouts); `src/design-system/dev/route-placeholder.tsx` | Opus | TBD |
| 0.3 | State-management decision | Choose local UI/server-state approach (e.g. React Context + hooks vs a store) using only installed deps or an approved one; no premature global store | all | 0.1 | Implemented | P0 | No | ADR with rationale + rejected options; no new dependency added without register approval | `docs/adr/0003-state.md` (repository-hooks over `useSyncExternalStore` + focused Contexts; no store lib; 0 new deps) | Opus + Human | TBD |
| 0.4 | Local database decision | Evaluate local DB (`expo-sqlite`) as source of truth; schema outline for decks/subdecks/cards/languages/sessions/attempts/SRS; **decision gate that decides DEP-DB** | all persistence | 0.1 | Implemented | P0 | No | Candidate evaluated + **DEP-DB approved** (register → Approved); `expo-sqlite ~57.0.0` added (config plugin in `app.json`); offline source-of-truth confirmed; schema outline + access-layer contract drafted; unblocks 0.5 | `docs/adr/0005-db-schema.md`; `package.json` (`expo-sqlite ~57.0.0`); `app.json` (plugin) | Human | TBD |
| 0.5 | Migration strategy | Versioned schema migrations + forward-only upgrade path + migration test harness design | all persistence | 0.4 | Specified | P1 | No (owns schema) | Migration runner contract; rollback/`PRAGMA user_version` strategy; test plan for vN→vN+1 | `docs/adr/0005-db-schema.md` (access-layer contract); target *(to create)* `src/db/migrations/`, `src/db/client.ts` | Opus | TBD |
| 0.6 | Error/result model | Define `Result<T,E>`/typed error model + user-facing error mapping used by every use case | all | 0.1, 0.13, DEP-TEST | Blocked | P0 | Yes | Discriminated result type; recoverable-error contract wired to every screen's error state; unit tests for mapping (needs the test harness, 0.13) | `docs/design/mobile-ui-construction-contract.md` (state matrix); target *(to create)* `src/shared/result.ts` | Opus | TBD |
| 0.7 | Repository/use-case contracts | Interface contracts for repositories + use cases (inputs/outputs/errors) independent of DB engine | sections 3–10 | 0.3, 0.6 | Blocked | P0 | Yes | TS interfaces compile; each feature domain references them; no UI or DB import in the domain layer | Target *(to create)* `src/shared/contracts/`, `src/features/*/domain/` | Opus | TBD |
| 0.8 | Test framework decision | Evaluate the candidate test framework (`jest-expo` + RNTL, DEP-TEST) + coverage tiers (unit/repo/integration/a11y/visual). **Decision gate that decides DEP-TEST — it does not depend on DEP-TEST.** No package install or test config here | 11.1–11.9 | 0.1 | Implemented | P0 | No | Candidate framework evaluated; **DEP-TEST approved** (register → Approved); no package installed / no test config in this row; unblocks the harness setup 0.13 | Dependency Approval Register (DEP-TEST = Approved); harness install/config is 0.13 | Human | TBD |
| 0.9 | Dependency approval register | Maintain the register (below) as the single gate; any package used by an unapproved row keeps that row `Blocked` | all | — | Specified | P0 | No | Register present and current; no package self-approved; every `Blocked` dep-row traces to a `DEP-*` line | This document — Dependency Approval Register | Opus + Human | TBD |
| 0.10 | UI Kit → React Native mapping | Rulebook: token CSS → TS theme, `Mx*` base class → RN component, `.card`/variant modifiers → props; one-way Token→Component→Screen preserved | all components + screens | 0.1 | Implemented | P0 | Yes | Mapping table for all 18 primitives + variants; screen layer imports only components; components import only tokens | `docs/adr/0004-uikit-rn-mapping.md` (18-primitive table + token/idiom mapping); `docs/design/MemoX Design System_v4/components/**/Mx*.jsx` | Design + Opus | TBD |
| 0.11 | `data-mx-node` → `testID` mapping | Rule to carry each kit `data-mx-node` id onto the RN node as `testID` for test + visual anchoring | all | 0.10 | Implemented | P1 | Yes | Deterministic id→testID rule; every screen spec's nodes covered; used by a11y/visual tests | `docs/adr/0006-testid-mapping.md` | Opus | TBD |
| 0.12 | Raw visual-value guard | Lint/guard forbidding raw hex/px/typography outside the design system in `src/features` and `src/app` | all components + screens | 0.1, 0.10 | Specified | P1 | No (adds tooling) | Guard fails on a raw `#hex`/literal px color/off-scale spacing above the token layer; wired into verification | `eslint.config.js`; `docs/design/mobile-ui-construction-contract.md` (§4) | Opus | TBD |
| 0.13 | Production test harness setup | Install + configure the approved test framework; create the `npm test` script; sample unit test, sample RN component test, and a sample repository/integration test contract; wire the test command into verification/CI per repo convention | 11.1–11.9 | 0.8, DEP-TEST | Specified | P0 | No (adds config) | DEP-TEST approved by Human; test config exists; `npm test` runs; sample unit test passes; sample RN component test passes; sample repository/integration contract in place; no package added beyond the approved dependency | `package.json`, `.github/workflows/ui-kit.yml`; target *(to create)* test config + `src/**/__tests__`; DEP-TEST | Opus | TBD |

---

## 1. React Native Design System Runtime

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Tokens → TypeScript | Map `tokens/*.css` (colors light+dark, spacing, radius, typography, elevation, motion, size, stroke, opacity, icon-size) to a typed theme object; names frozen | all | 0.1, 0.10 | Implemented | P0 | No (shared tokens) | Every `--memox-*` token has a typed value for light+dark; no value drift vs CSS; spacing restricted to {4,8,12,16,24,32,48} | `src/design-system/tokens/*.ts` (colors/spacing/radius/typography/elevation/motion/size + index) | Opus | TBD |
| 1.2 | Theme provider + light/dark | Theme context reading system scheme + user override; exposes tokens to components; dark via provider not per-component override | theme | 1.1 | Implemented | P0 | No | Toggling theme reskins all components from tokens only; no hard-coded colors; matches canonical light/dark shots | `src/design-system/theme/{theme.ts,theme-context.tsx,index.ts}`, mounted in `src/app/_layout.tsx` | Opus | TBD |
| 1.3 | Plus Jakarta Sans fonts | Load variable font via `expo-font` (installed); weight tokens (400/600/700/800); tracking rules | all | 1.1 | Specified | P0 | Yes | Font loads on Android/iOS/web; weight tokens resolve; no system-font fallback in rendered text | `package.json` (expo-font ~57), `docs/design/MemoX Design System_v4/fonts/`, `.../tokens/typography.css` | Opus | TBD |
| 1.4 | Icon adapter | ONE canonical **Material Symbols Rounded** source across Android/iOS/web via `expo-font` (installed) bundling the Material Symbols Rounded variable-font asset (DEP-ICON-FONT — not yet in the repo). Do **not** use SF Symbols on iOS — that breaks parity with the kit. Adapter exposes the kit glyph set at icon-size tokens | all | 1.1, DEP-ICON-FONT | Blocked | P0 | No | DEP-ICON-FONT approved by Human; same Material Symbols Rounded glyph renders on Android, iOS and web; no SF Symbols on iOS; no emoji; weight, FILL and icon size come from design tokens; deterministic missing-glyph fallback behaviour; the font is bundled locally so runtime does not depend on a CDN. (Automated tests for this adapter, incl. the missing-glyph fallback, are owned by 1.8.) | `package.json` (expo-font ~57), `docs/design/MemoX Design System_v4/readme.md` (§Iconography), `.../tokens/icon-size.css`; DEP-ICON-FONT | Opus | TBD |
| 1.5 | Surface primitives | RN `MxScaffold`, `MxContextualAppBar`, `MxCard`, `MxSectionHeader`, `MxIconTile`, `MxList` with frozen names/variants + `testID` from node | app-bar, all | 0.10, 0.11, 1.1, 1.4 | Blocked | P0 | No (shared) | Variants match kit base classes; ≥44×44 targets; light/dark + 320–430px per shots; a11y roles + `testID` contract implemented. **MxList**: canonical wrapper for any stack of cards (decks/subdecks/cards/results); default item gap uses the 12px token `--memox-space-3` (optional `gap` override); list screens wrap card lists in MxList and never drop cards straight into the scroll body (whose 24px section gap is wrong for items). (MxList fixtures + accessibility + token-parity tests are owned by 1.8.) | `.../components/surfaces/*.jsx` (incl. `MxList.jsx`), `.../components.css` | Opus + Design | TBD |
| 1.6 | Navigation primitives | RN `MxBottomNav`, `MxFab`, `MxSearchDock`, `MxIconButton` | app-bar, dashboard, library | 0.10, 0.11, 1.1, 1.4 | Blocked | P0 | No (shared) | Active-item pill + FAB placement match shots; hit areas ≥48px; keyboard/focus states present | `.../components/navigation/*.jsx` | Opus + Design | TBD |
| 1.7 | Core input/action primitives | RN `MxButton`, `MxLink`, `MxTextField`, `MxChip`, `MxBadge`, `MxSwitch`, `MxSegmentedControl`, `MxAvatar` | all | 0.10, 0.11, 1.1, 1.4 | Blocked | P0 | No (shared) | Variants/modifiers only (no new names); contrast pairs pass AA; disabled/focus/error states; matches shots | `.../components/core/*.jsx`. Requires 1.4: `MxLink.jsx` defaults `trailingIcon='chevron_right'` (renders an icon by default), and `MxButton`/`MxChip`/`MxSegmentedControl` render icon-bearing canonical variants present in the shots — so canonical parity needs the icon adapter | Opus + Design | TBD |
| 1.8 | Fixtures + accessibility + parity tests | Component fixtures per state; a11y (roles, labels, target size); token-parity + `testID` presence tests for all 18 primitives (incl. MxList); the icon-adapter missing-glyph fallback test | all | 1.4, 1.5, 1.6, 1.7, 0.13, DEP-TEST | Blocked | P1 | No | Fixtures + accessibility + token-parity tests exist for all 18 primitives; the 1.4 icon adapter's missing-glyph fallback is tested; MxList has its fixture + a11y + token-parity test (gap-token asserted); token parity asserts no raw values; needs the test harness (0.13, DEP-TEST) | Depends on 0.13 and DEP-TEST; `.../components/**/*.prompt.md` | Opus + Codex | TBD |

> The 18 production primitives = surface (6: MxScaffold, MxContextualAppBar, MxCard, MxSectionHeader, MxIconTile, MxList) + navigation (4: MxBottomNav, MxFab, MxSearchDock, MxIconButton) + core (8: MxButton, MxLink, MxTextField, MxChip, MxBadge, MxSwitch, MxSegmentedControl, MxAvatar).

---

## 2. App Shell, Navigation and Theme — maps `app-bar`, `theme`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 | App shell + router layout | Root `(tabs)` layout, `MxScaffold` + `MxBottomNav` + fixed app bar; safe-area + FAB slot | app-bar (root-top/scrolled/unread) | 0.1, 0.2, 1.5, 1.6 | Blocked | P0 | No (owns shell) | Tabs route between placeholders; app bar elevates on scroll; safe-area/notch handled; matches app-bar shots | `.../specs/app-bar.md`, `.../shots/app-bar--root-*.png` | Opus | TBD |
| 2.2 | Contextual app-bar variants | Nested/overflow/search/selection/modal app-bar variants + title truncation behavior | app-bar (nested, nested-overflow, search, selection, modal) | 2.1, 1.5 | Blocked | P0 | No (shared shell) | All 8 app-bar states render; overflow truncates without clipping meaning; selection count + actions correct | `.../specs/app-bar.md`, `.../shots/app-bar--*.png` | Opus + Design | TBD |
| 2.3 | Theme screen + persistence | `theme` screen: appearance (light/dark/system), accent picker, text-size; persist choice; live preview | theme (light, dark, accent-size) | 1.2, 1.7, 0.5 | Blocked | P1 | No | Choice persists across restart using the approved DB decision (0.4) and the migration/storage strategy (0.5); preview updates live; accent swatches labeled + ≥48px; light/dark/font-scale 1.5 verified | `.../specs/theme.md`, `.../shots/theme--*.png`; persistence needs 0.5 (hard prerequisite, gated by 0.4) | Opus | TBD |
| 2.4 | Shell/theme state matrix + tests | State-matrix fixtures + interaction + a11y tests for shell + theme | app-bar, theme | 2.1, 2.2, 2.3, 0.13, 0.11, DEP-TEST | Blocked | P1 | Yes | Every app-bar/theme state tested; testID anchors present; framework required (DEP-TEST) | Depends on 0.13 and DEP-TEST; `.../specs/{app-bar,theme}.md` | Opus + Codex | TBD |
| 2.5 | Shell/theme visual verification | Render shell + theme states, compare to canonical shots, file numbered defects | app-bar, theme | 2.4 | Blocked | P1 | Yes | Screenshot compare vs `shots/`; 0 unaccepted overflow/clip; defect report filed + resolved | Blocked: waiting for shell/theme render states and the test framework through 2.4; `.../shots/{app-bar,theme}--*.png` | Design | TBD |
| 2.6 | Feature quality harness readiness | Readiness gate confirming the shared test, accessibility and visual-regression harnesses are ready before any production feature screen begins | all | 11.1, 11.3, 11.4 | Blocked | P0 | No (readiness gate) | Test harness baseline (11.1) complete; accessibility tooling baseline (11.3) complete; visual regression harness (11.4) complete; the shared fixture, accessibility helper and visual-diff contract are usable by the feature screen slices; **does not claim any production feature screen is complete** — it is only a readiness gate for the vertical feature screen slices | Rows 11.1, 11.3, 11.4; Vertical Slice Quality Ownership (below) | Opus + Codex + Design | TBD |

---

## 3. Content Foundation — maps `languages`, `library`, `subdeck-list`, `deck-content-choice`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 | Deck/subdeck/language domain | Entities + use cases (create/rename/move/delete deck & subdeck; add/remove language pair; deck-vs-cards organisation) using 0.7 contracts | languages, library, subdeck-list, deck-content-choice | 0.6, 0.7, 0.13, DEP-TEST | Blocked | P0 | Yes | Pure-TS domain compiles; use cases return typed results; no UI/DB imports; unit tests cover invariants (no orphan subdeck) | `docs/design/MemoX Design System_v4/readme.md` (domain: Deck>Subdeck, no folders); `.../specs/{library,subdeck-list,languages}.md` | Opus | TBD |
| 3.2 | Content persistence + repositories | Tables + repositories for decks/subdecks/cards-count/languages; transactional multi-table writes | languages, library, subdeck-list | 0.4, 0.5, 3.1, 0.13, DEP-TEST | Blocked | P0 | No (owns schema) | Restart preserves data; multi-table create/move is transactional with rollback test; DB is source of truth | Depends on 0.4/0.5; `.../specs/library.md` | Opus | TBD |
| 3.3 | Languages slice | `languages` screen + list/one/empty/add/remove states + interactions wired to 3.1/3.2 | languages (list, one, empty, add, remove) | 3.1, 3.2, 1.5, 1.6, 1.7, 2.6 | Blocked | P1 | No | All 5 states; add/remove persists; empty + recoverable-error states; light/dark/320–430px/font-scale 1.5 | `.../specs/languages.md`, `.../shots/languages--*.png` | Opus + Design | TBD |
| 3.4 | Library slice | `library` screen: deck grid/list, search, filter, selection, create sheet, offline/loading; wired to 3.1/3.2 | library (12 states) | 3.1, 3.2, 4.6, 1.5, 1.6, 1.7, 2.6 | Blocked | P0 | No | All 12 states; search/filter/selection functional; FAB clearance; loading/empty/offline/error; visual parity | `.../specs/library.md`, `.../shots/library--*.png` | Opus + Design | TBD |
| 3.5 | Subdeck-list slice | `subdeck-list` screen: browse/manage subdecks, deep nesting, actions sheet, play, states | subdeck-list (13 states) | 3.1, 3.2, 1.5, 1.6, 1.7, 2.6 | Blocked | P0 | No | All 13 states incl. deep/error/offline; subdeck actions persist; breadcrumb nav; visual parity | `.../specs/subdeck-list.md`, `.../shots/subdeck-list--*.png` | Opus + Design | TBD |
| 3.6 | Deck-content-choice slice | `deck-content-choice`: choose subdecks-vs-cards organisation for a new empty deck | deck-content-choice (default) | 3.1, 3.2, 1.5, 1.7, 2.6 | Blocked | P1 | No | Choice sets deck organisation + persists; routes to subdeck-list or flashcard-list; single default state matches shot | `.../specs/deck-content-choice.md`, `.../shots/deck-content-choice--default--*.png` | Opus | TBD |

---

## 4. Flashcard Authoring and Search — maps `flashcard-list`, `flashcard-editor`, `deck-settings`, `search`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 | Flashcard domain | Card entity + use cases (create/edit/duplicate-detect/delete/additional-translation) + validation rules | flashcard-list, flashcard-editor | 0.6, 0.7, 3.1, 0.13, DEP-TEST | Blocked | P0 | Yes | Domain compiles; duplicate-detection + validation unit-tested; term/meaning/tags/audio-ref modeled | `.../specs/{flashcard-list,flashcard-editor}.md` | Opus | TBD |
| 4.2 | Flashcard persistence + repository | Cards table + repository; deck card-count maintenance; transactional edits | flashcard-list, flashcard-editor | 0.4, 0.5, 4.1, 3.2, 0.13, DEP-TEST | Blocked | P0 | No (schema) | Restart preserves cards; edit/delete transactional; count stays consistent (rollback test) | Depends on 0.4/0.5; `.../specs/flashcard-list.md` | Opus | TBD |
| 4.3 | Flashcard-list slice | `flashcard-list` screen: browse/filter/select/add-sheet/card-actions/delete-confirm + dense/min/long-text/offline/error | flashcard-list (15 states) | 4.1, 4.2, 1.5, 1.6, 1.7, 2.6 | Blocked | P0 | No | All 15 states; long/minimum data render without clipping; delete-confirm; visual parity + font-scale 1.5 | `.../specs/flashcard-list.md`, `.../shots/flashcard-list--*.png` | Opus + Design | TBD |
| 4.4 | Flashcard-editor slice | `flashcard-editor` form: create/edit/validation/duplicate/additional-translation + submit lifecycle (submitting/error/success) + audio-generating | flashcard-editor (9 states) | 4.1, 4.2, 1.5, 1.7, DEP-TTS, 2.6 | Blocked | P0 | No | Full submit lifecycle (validation/disabled/submitting/failure/success); audio-generating gated on DEP-TTS; primary Save reachable over keyboard | `.../specs/flashcard-editor.md`, `.../shots/flashcard-editor--*.png` | Opus + Design | TBD |
| 4.5 | Deck-settings slice | `deck-settings`: metadata + lifecycle (rename/move/reset-confirm/delete-confirm) via action sheet | deck-settings (5 states) | 3.1, 3.2, 1.5, 1.7, 2.6 | Blocked | P1 | No | All 5 states; destructive actions use danger + confirm; move/reset/delete persist with rollback test | `.../specs/deck-settings.md`, `.../shots/deck-settings--*.png` | Opus | TBD |
| 4.6 | Search slice + index | `search` screen + local query over cards/decks (word/meaning); recent/results/filtered/no-results/loading | search (5 states), library-search | 4.2, 3.2, 1.5, 1.7, 2.6 | Blocked | P1 | No | Query returns from DB; recent history persists; no-results quotes query; debounced; visual parity | `.../specs/search.md`, `.../shots/search--*.png` | Opus + Design | TBD |

---

## 5. Study Entry, Dashboard and Session Core — maps `dashboard`, `mode-picker`, `study-session`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 5.1 | Study/session domain + SRS | Session lifecycle (start/resume/finalize), attempt model, 5-stage ordering, SRS scheduling use cases | dashboard, mode-picker, study-session | 0.6, 0.7, 4.1, 0.13, DEP-TEST | Blocked | P0 | Yes | Session state machine + SRS scheduling unit-tested; due/relearn logic deterministic; resume rebuilds state | `.../specs/{study-session,dashboard,mode-picker}.md`, `docs/design/MemoX Design System_v4/readme.md` | Opus | TBD |
| 5.2 | Session + progress persistence | Sessions/attempts/SRS tables + repository; durable mid-session state for resume | study-session, dashboard, statistics | 0.4, 0.5, 5.1, 0.13, DEP-TEST | Blocked | P0 | No (schema) | Kill/restart mid-session resumes losslessly; attempts persist per stage; SRS updates transactional (rollback test) | Depends on 0.4/0.5; `.../specs/study-session.md` | Opus | TBD |
| 5.3 | Dashboard slice | `dashboard` screen: due summary, streak/goal, continue-CTA, onboarding/empty/loading | dashboard (8 states) | 5.1, 5.2, 1.5, 1.6, 1.7, 2.6 | Blocked | P0 | No | All 8 states incl. caught-up/streak-reset/goal-met/empty/loading; numbers from DB; FAB clearance; visual parity | `.../specs/dashboard.md`, `.../shots/dashboard--*.png` | Opus + Design | TBD |
| 5.4 | Mode-picker slice | `mode-picker`: choose mode + scope, not-enough-words guard, scope dropdown | mode-picker (default, scope-dropdown, not-enough) | 5.1, 5.2, 1.5, 1.7, 2.6 | Blocked | P1 | No | All 3 states; not-enough explains threshold + offers fix; scope selection feeds session start | `.../specs/mode-picker.md`, `.../shots/mode-picker--*.png` | Opus | TBD |
| 5.5 | Study-session shell slice | `study-session` orchestrator: 5-stage flow shell, progress header, exit/resume-error/answer-save-error, due-review/relearn | study-session (10 states) | 5.1, 5.2, 6.1, 6.2, 6.3, 7.1, 7.2, 2.6 | Blocked | P0 | No | All 10 states; exit=danger; resume-error + answer-save-error recover; progress bar + n/N; stages mount from 6.1/6.2/6.3/7.1/7.2 | `.../specs/study-session.md`, `.../shots/study-session--*.png` | Opus + Design | TBD |

---

## 6. Study Modes 1–3 — maps `review-mode`, `match-mode`, `guess-mode`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 6.1 | Review-mode slice | `review-mode` (stage 1): browse round, inline edit, audio, end; persists attempts | review-mode (browsing, editing, audio, loading, error, end) | 5.1, 5.2, 1.5, 1.7, DEP-TTS, 2.6 | Blocked | P0 | No | All 6 states; edit persists; audio gated on DEP-TTS; loading/error/end; progress header; visual parity | `.../specs/review-mode.md`, `.../shots/review-mode--*.png` | Opus + Design | TBD |
| 6.2 | Match-mode slice | `match-mode` (stage 2): term↔meaning grid, selected/correct/wrong/almost/complete | match-mode (playing, selected, correct, wrong, almost, complete) | 5.1, 5.2, 1.5, 1.7, 2.6 | Blocked | P0 | No | All 6 states; wrong pairs use color+non-color cue; count label; attempts persisted; visual parity | `.../specs/match-mode.md`, `.../shots/match-mode--*.png` | Opus + Design | TBD |
| 6.3 | Guess-mode slice | `guess-mode` (stage 3): pick meaning, correct/wrong/long-text/complete | guess-mode (waiting, correct, wrong, long-text, complete) | 5.1, 5.2, 1.5, 1.7, 2.6 | Blocked | P0 | No | All 5 states; feedback = color+icon; long-text no clip; attempts persisted; visual parity | `.../specs/guess-mode.md`, `.../shots/guess-mode--*.png` | Opus + Design | TBD |

---

## 7. Study Modes 4–5, Player and Finalization — maps `recall-mode`, `fill-mode`, `player`, `study-result`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7.1 | Recall-mode slice | `recall-mode` (stage 4): reveal + self-grade forgot/remembered | recall-mode (before-reveal, revealed, forgot, remembered, complete) | 5.1, 5.2, 1.5, 1.7, 2.6 | Blocked | P0 | No | All 5 states; grade pair equal-width ≥48px; grade persists to SRS; visual parity | `.../specs/recall-mode.md`, `.../shots/recall-mode--*.png` | Opus + Design | TBD |
| 7.2 | Fill-mode slice | `fill-mode` (stage 5): type term, hint, correct/wrong; keyboard-aware | fill-mode (waiting, typing, hint, correct, wrong, complete) | 5.1, 5.2, 1.5, 1.7, 2.6 | Blocked | P0 | No | All 6 states; check reachable over keyboard; hint + char-compare; attempts persisted; visual parity | `.../specs/fill-mode.md`, `.../shots/fill-mode--*.png` | Opus + Design | TBD |
| 7.3 | Player slice | `player`: hands-free audio playback of a deck, transport, speed, error/end | player (playing, paused, speed, error, end) | 5.1, 5.2, 1.5, 1.7, DEP-TTS, 2.6 | Blocked | P1 | No | All 5 states; transport ≥48px; audio gated on DEP-TTS; error/end handled; visual parity | `.../specs/player.md`, `.../shots/player--*.png` | Opus + Design | TBD |
| 7.4 | Study-result + finalization slice | `study-result`: summary, goal-met/missed, many-wrong, finalizing/retry/finalize-error; commit SRS + streak | study-result (7 states) | 5.1, 5.2, 7.1, 7.2, 2.6 | Blocked | P0 | No | All 7 states; finalize is transactional with retry on error; result numbers from DB; visual parity | `.../specs/study-result.md`, `.../shots/study-result--*.png` | Opus + Design | TBD |

---

## 8. Progress and Reminder — maps `statistics`, `reminder`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 8.1 | Statistics slice | `statistics`: streaks/retention/heatmap/bars, scope switch, insufficient/loading/error | statistics (loaded, scope-switch, insufficient, loading, error) | 5.2, 7.4, 2.6 | Blocked | P1 | No | All 5 states; charts have axis labels + legend; insufficient-data state; values from DB after finalization (7.4); visual parity. Does **not** block MVP B | `.../specs/statistics.md`, `.../shots/statistics--*.png` | Opus + Design | TBD |
| 8.2 | Reminder slice | `reminder`: daily study reminder on/off + time-picker; schedule local notifications | reminder (on, off, time-picker) | 0.5, 1.5, 1.7, DEP-NOTIFICATIONS, 2.6 | Blocked | P1 | No | All 3 states; scheduling gated on DEP-NOTIFICATIONS; choice persists across restart via the migration/storage strategy (0.5); day-chips + time render per shots | `.../specs/reminder.md`, `.../shots/reminder--*.png`; persistence needs 0.5 (hard prerequisite); needs DEP-NOTIFICATIONS | Opus | TBD |

---

## 9. Import and Export — maps `import`, `export`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 9.1 | Import slice | `import`: source/mapping/preview/dup-warning/importing/import-error/done; parse file or pasted text → cards | import (7 states) | 4.1, 4.2, 1.5, 1.7, DEP-FILE-PICKER, 2.6 | Blocked | P1 | No | All 7 states; column mapping + dup handling; transactional bulk insert with rollback; file picker gated on DEP-FILE-PICKER | `.../specs/import.md`, `.../shots/import--*.png` | Opus + Design | TBD |
| 9.2 | Export slice | `export`: config/exporting/error/done; write deck to shareable file format | export (config, exporting, export-error, done) | 4.2, 1.5, 1.7, DEP-FILE-SHARING, 2.6 | Blocked | P1 | No | All 4 states; export format valid + re-importable; error/done states; sharing gated on DEP-FILE-SHARING | `.../specs/export.md`, `.../shots/export--*.png` | Opus + Design | TBD |

---

## 10. Settings, Account, Sync and Backup — maps `settings`, `account-sync`

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 10.1 | Settings hub slice | `settings`: navigation hub + study sub-screens (word-display/SRS/mode/voice) + value-picker | settings (loaded, study-hub, study-worddisplay, study-srs, study-mode, study-voice, value-picker) | 2.3, 5.2, 1.5, 1.7, DEP-TTS, 2.6 | Blocked | P1 | No | All 7 states; sub-settings persist + feed study behavior; value-picker; voice gated on DEP-TTS; visual parity | `.../specs/settings.md`, `.../shots/settings--*.png` | Opus + Design | TBD |
| 10.2 | Account & sync slice | `account-sync`: sign-in + cloud sync states signed-out/in/syncing/conflict/offline | account-sync (5 states) | 5.5, 7.4, DEP-AUTH, DEP-CLOUD, 2.6 | Blocked | P2 | No | All 5 states; the 5-stage study session works (5.5) and session finalization + SRS update work (7.4) before this starts — account/sync must not begin before a usable learning flow; sign-in gated on DEP-AUTH; conflict resolution defined | `.../specs/account-sync.md`, `.../shots/account-sync--*.png` | Opus + Human | TBD |
| 10.3 | Backup & restore | Local backup export + restore import; cloud backup gated on approved provider | account-sync, settings | 4.2, 5.2, 5.5, 7.4, DEP-FILE-PICKER, DEP-FILE-SHARING, DEP-CLOUD, 2.6 | Blocked | P2 | No | Local backup export; local restore import; restore validation before write; backup/restore round-trips losslessly; must not begin before a usable learning flow (5.5 + 7.4); cloud backup only runs when DEP-CLOUD is approved | `.../specs/account-sync.md`; Dependency Approval Register | Opus + Human | TBD |

---

## 11. Quality and Release

| ID | Work package | Scope | UI-kit mapping | Dependencies | Status | Priority | Parallel | Acceptance criteria | Evidence/Source | Owner | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 11.1 | Test harness baseline and quality contract | Test pyramid; folder convention; shared fixtures; sample unit/component/repository tests; coverage + command contract; the rule that **every vertical slice owns its own tests** | all | 0.13, DEP-TEST | Blocked | P0 | Yes | Test harness works; a shared fixture convention exists; sample tests present at each supported tier; the contract requires every feature slice to add its tests in that slice's own PR; **this row does not claim that all feature tests are complete** | Depends on 0.13; Vertical Slice Quality Ownership (below) | Opus + Codex | TBD |
| 11.2 | Repository + migration tests | Transactional multi-table write + rollback + vN→vN+1 migration tests | 3.2, 4.2, 5.2 | 0.4, 0.5, 0.13, DEP-TEST | Blocked | P0 | No (schema) | Rollback on failure proven; migrations forward-only + tested; DB source-of-truth asserted | Depends on 0.4, 0.5, 0.13 and DEP-TEST | Opus | TBD |
| 11.3 | Accessibility tooling baseline | Role/label convention; target-size rule; font-scale rule; contrast-check approach; shared accessibility test helpers | all | 1.8, 2.4, 0.13, DEP-TEST | Blocked | P1 | Yes | Shared accessibility checks work on the design-system + shell fixtures; a mandatory per-slice contract exists; **does not claim an audit of all production screens while those screens do not yet exist** | `docs/design/MemoX Design System_v4/audit/UI-UX Audit.html`; Vertical Slice Quality Ownership (below) | Codex + Design | TBD |
| 11.4 | Visual regression harness | Choose + configure the golden/screenshot approach; canonical-shot lookup; naming convention; diff-artifact convention; baseline sample for the shell or one fixture | all | 0.13, 2.5, DEP-GOLDEN, DEP-TEST | Blocked | P1 | Yes | Golden solution approved (DEP-GOLDEN); harness runs on the baseline sample; diff artifacts are produced and reviewable; each feature slice adds its own canonical screen states; **does not claim golden coverage of all RN screens while those features do not yet exist** | `.../shots/*.png`; needs DEP-GOLDEN; Vertical Slice Quality Ownership (below) | Design + Opus | TBD |
| 11.5 | Performance | List virtualization, session-flow responsiveness, cold-start, DB query budgets | library, subdeck-list, flashcard-list, study-session | 3.4, 3.5, 4.3, 5.5 | Blocked | P2 | Yes | Large decks scroll at target FPS; no N+1 DB reads; cold-start budget met | Feature slices 3.4/3.5/4.3/5.5 | Opus + Codex | TBD |
| 11.6 | Android/iOS smoke | Device smoke of the content, learning and portability flows on both platforms | all | 3.3, 3.4, 3.6, 4.3, 4.4, 4.6, 5.5, 7.4, 9.1, 9.2, 10.3 | Blocked | P1 | No | On both Android and iOS: create language pair (3.3); create deck (3.4); choose deck content structure (3.6); create and edit flashcard (4.3, 4.4); browse and search content (3.4, 4.6); start, resume and finish a study session (5.5); finalize session and update SRS (7.4); import (9.1); export (9.2); backup and restore (10.3); safe area; keyboard; hardware/system back behaviour. No flow is called smoked unless its prerequisite slice is done | Device runs | Opus + Human | TBD |
| 11.7 | Backup compatibility | Forward/backward backup-format compatibility across schema versions | 10.3 | 10.3, 0.5 | Blocked | P2 | No | Old backup restores on new schema; format versioned | 10.3 | Opus | TBD |
| 11.8 | Release readiness | App icon/splash, store metadata, permissions review, build profiles | all | 4.6, 7.4, 10.3, 11.6 | Blocked | P2 | No | Signed builds; permissions justified; checklist complete | `app.json` | Opus + Human | TBD |
| 11.9 | Docs-code parity | Keep this WBS, ADRs and register in sync with merged commits | all | — | Specified | P1 | Yes | Every merged slice updates the Traceability Log + row status/commit; 0 stale `Implemented` claims | This document | Opus + Codex | TBD |

---

## Vertical Slice Quality Ownership

Quality is **not** deferred to Wave 11. Each screen slice (sections 3–10) owns its own quality work and adds it in the slice's own PR:

- **Interaction tests** — the slice's user actions behave per spec.
- **State-matrix tests** — every registry state for the screen renders (loading, empty, error, submit lifecycle, edge data).
- **Accessibility checks** — roles/labels, ≥44×44 targets, font-scale 1.5, AA contrast, using the shared helpers from 11.3.
- **Visual verification** — the slice's canonical screen states compared to `shots/` using the harness from 11.4.

Rows **11.1** (test harness baseline + quality contract), **11.3** (accessibility tooling baseline) and **11.4** (visual regression harness) provide **only** the shared harness and contract — they do not implement or complete any feature's tests, and they do not claim app-wide coverage.

The ordering is enforced by the **dependency graph**, not by an incidental DB block:

- The shell/theme rows **2.1–2.5** build the bootstrap fixtures the harnesses need; they therefore **must not** depend on 2.6 (that would be a cycle).
- The shared harnesses **11.1, 11.3, 11.4** consume those bootstrap fixtures and provide the shared fixture, accessibility-helper and visual-diff contracts.
- The readiness gate **2.6** depends on 11.1, 11.3 and 11.4 and confirms the harnesses are usable.
- **Every** production screen slice in sections 3–10 (the feature screen slices 3.3–10.3) depends on **2.6** — so no feature slice can start until the harnesses are ready. This is a real graph edge, not merely a side effect of the DB gate.

Each feature slice still **owns** its own interaction tests, state-matrix tests, accessibility checks and visual verification (using the shared harnesses); 2.6 and 11.1/11.3/11.4 only make those tools available.

---

## UI Kit Coverage

`app-bar` is shared design-system/shell work (rows 1.5–1.7, 2.1, 2.2), not a business feature screen.

| Screen | Registry states | WBS IDs | Missing states | Blocked reason |
|---|---:|---|---|---|
| dashboard | 8 | 5.1, 5.2, 5.3 | 0 | DEP-DB via 0.4/5.2; Quality readiness gate: 2.6 |
| library | 12 | 3.1, 3.2, 3.4 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| subdeck-list | 13 | 3.1, 3.2, 3.5 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| flashcard-list | 15 | 4.1, 4.2, 4.3 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| deck-settings | 5 | 3.1, 3.2, 4.5 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| deck-content-choice | 1 | 3.1, 3.2, 3.6 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| flashcard-editor | 9 | 4.1, 4.2, 4.4 | 0 | DEP-DB via 0.4; audio needs DEP-TTS; Quality readiness gate: 2.6 |
| mode-picker | 3 | 5.1, 5.2, 5.4 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| review-mode | 6 | 5.1, 5.2, 6.1 | 0 | DEP-DB via 0.4; audio needs DEP-TTS; Quality readiness gate: 2.6 |
| match-mode | 6 | 5.1, 5.2, 6.2 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| guess-mode | 5 | 5.1, 5.2, 6.3 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| recall-mode | 5 | 5.1, 5.2, 7.1 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| fill-mode | 6 | 5.1, 5.2, 7.2 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| player | 5 | 5.1, 5.2, 7.3 | 0 | DEP-DB via 0.4; audio needs DEP-TTS; Quality readiness gate: 2.6 |
| study-result | 7 | 5.1, 5.2, 7.4 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| search | 5 | 4.2, 4.6 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| statistics | 5 | 5.2, 8.1 | 0 | DEP-DB via 5.2; after finalization (7.4); Quality readiness gate: 2.6 |
| reminder | 3 | 8.2 | 0 | DEP-NOTIFICATIONS + DEP-DB; Quality readiness gate: 2.6 |
| account-sync | 5 | 10.2, 10.3 | 0 | DEP-AUTH + DEP-CLOUD; after learning flow (7.4); Quality readiness gate: 2.6 |
| theme | 3 | 1.2, 2.3 | 0 | DEP-DB via 0.4 |
| import | 7 | 4.1, 4.2, 9.1 | 0 | DEP-FILE-PICKER + DEP-DB; Quality readiness gate: 2.6 |
| export | 4 | 4.2, 9.2 | 0 | DEP-FILE-SHARING + DEP-DB; Quality readiness gate: 2.6 |
| languages | 5 | 3.1, 3.2, 3.3 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| study-session | 10 | 5.1, 5.2, 5.5 | 0 | DEP-DB via 0.4; Quality readiness gate: 2.6 |
| settings | 7 | 2.3, 5.2, 10.1 | 0 | DEP-DB via 0.4; voice needs DEP-TTS; Quality readiness gate: 2.6 |
| app-bar | 8 | 1.5, 1.6, 1.7, 2.1, 2.2 | 0 | Shared shell (not a feature screen) |

```
Unmapped production screens:  0
Unmapped registry states:     0   (168/168 covered)
```

---

## Dependency Approval Register

No package is self-approved. Any work package that depends on a `Pending` capability stays `Blocked`.

| ID | Capability | Candidate dependency | Needed by WBS | Status | Human decision required |
|---|---|---|---|---|---|
| DEP-DB | Local database | `expo-sqlite` `~57.0.0` | 0.4, 0.5, 3.2, 4.2, 5.2, 11.2 | **Approved** (2026-07-13, ADR 0005) | Yes — approved: offline source-of-truth confirmed |
| DEP-ICON-FONT | Canonical cross-platform icon font | Material Symbols Rounded variable-font asset | 1.4 | Pending | Yes — approve license, source, bundling and update process |
| DEP-FILE-PICKER | File picker (import) | `expo-document-picker` | 9.1, 10.3 | Pending | Yes |
| DEP-FILE-SHARING | File sharing (export) | `expo-sharing` (+ `expo-file-system`, installed via SDK) | 9.2, 10.3 | Pending | Yes |
| DEP-NOTIFICATIONS | Local notifications | `expo-notifications` | 8.2 | Pending | Yes — approve + plan permissions |
| DEP-TTS | Text-to-speech | `expo-speech` | 4.4, 6.1, 7.3, 10.1 | Pending | Yes |
| DEP-AUTH | Google authentication | `expo-auth-session` / provider SDK | 10.2 | Pending | Yes — provider + OAuth config |
| DEP-CLOUD | Cloud/Drive backup | Provider SDK (TBD) | 10.2, 10.3, 11.7 | Pending | Yes — choose provider |
| DEP-TEST | Production test framework | `jest-expo` + `@testing-library/react-native` | 0.6, 0.8, 0.13, 1.8, 2.4, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 11.1, 11.2, 11.3, 11.4 | **Approved** (2026-07-13) | Yes — approved; install/config in 0.13 |
| DEP-GOLDEN | Screenshot/golden tests | RN golden solution (TBD; Playwright already present for the web kit only) | 11.4 | Pending | Yes — choose golden approach |

Notes: `expo-font`, `expo-router`, `expo-web-browser`, `react-native-*` are already in `package.json` (SDK 57) and need **no** new approval — section 1's tokens/theme/fonts and section 2's shell build on them. Row 1.4 loads its glyphs with the installed `expo-font`, but the **Material Symbols Rounded font asset itself is not yet in the repo** (DEP-ICON-FONT); it is licensed/sourced/bundled by human approval, so 1.4 is `Blocked` until DEP-ICON-FONT is approved. SF Symbols are deliberately not used (they would break cross-platform glyph parity with the kit).

---

## Agent Allocation

| Owner | Responsibilities |
|---|---|
| **Claude Code Opus** | Architecture, vertical-slice implementation, domain/data/persistence, multi-file production screens, tests, docs-code parity |
| **Codex** | Read-only audit, edge-case analysis, regression review, diff review, scope/dependency guard |
| **Claude Design** | Composition map, UI-kit component mapping, screenshot comparison vs `shots/`, visual defect reports, design-ambiguity review |
| **Human** | Dependency approval, database/schema direction, cloud provider, product behavior without a contract, priority/scope changes |

Concurrency rule: no two write agents (Opus instances) may modify a **shared surface** at once — the Expo Router tree (0.2, 2.1, 2.2), design-system primitives (1.5, 1.6, 1.7), the DB schema (0.4, 0.5, 3.2, 4.2, 5.2), or this `wbs.md`. Those rows are `Parallel = No` and serialized. Feature domain rows (3.1, 4.1, 5.1) and independent slices are `Parallel = Yes`.

---

## Critical Path

```
Governance and architecture (0.1–0.13)
→ RN design system (1.1–1.8)
→ app shell and bootstrap fixtures (2.1–2.5)
→ shared quality harnesses (11.1, 11.3, 11.4)
→ feature quality readiness gate (2.6)
→ content creation (3.1–3.6)
→ content management (4.1–4.6)
→ study entry/resume (5.1–5.5)
→ five-stage study flow (6.1–6.3, 7.1–7.3)
→ session finalization and SRS update (7.4)
→ statistics and progress (8.1–8.2)
→ import/export (9.1–9.2)
→ settings (10.1)
→ account/sync/backup (10.2, 10.3)
```

Statistics (8.1) follows session finalization (7.4) and does **not** block MVP B. Cloud/account work (10.2, 10.3) must **not** precede a usable learning flow (MVP B).

### MVP A — Content usable
Create language pair · create deck/subdeck · create + manage flashcards (incl. the audio-generating state) · search/browse · restart preserves data.
Covers: 0.1–0.13, 1.1–1.8, 2.1–2.6, the shared quality harnesses 11.1/11.3/11.4, 3.1–3.6, 4.1–4.6. Gates (all required): **DEP-DB, DEP-TEST, DEP-ICON-FONT, DEP-GOLDEN, DEP-TTS** approved (DEP-TTS because 4.4 includes the flashcard `audio-generating` state).

### MVP B — Learning usable
Start + resume session · complete five study stages · persist attempts · finalize session · update SRS · show result.
Covers: 5.1–5.5, 6.1–6.3, 7.1–7.4. Depends on MVP A + 0.4/0.5. (Statistics 8.1 is progress, delivered after 7.4 — it does not gate MVP B.)

### MVP C — Data portability
Import · export · backup · restore.
Covers: 9.1–9.2, 10.3, 11.7. Depends on MVP A/B + DEP-FILE-PICKER / DEP-FILE-SHARING / DEP-CLOUD approved.

---

## Next 10 Tasks

Ten packages deliverable from `main` now — governance and RN design-system foundation first, no feature screen jumped. Every task is either `Specified` with its dependencies completed by an earlier task here, or an explicit **Human decision gate**. Rows that became `Blocked` by a test/icon prerequisite (0.6, 0.7, 1.5–1.7) are intentionally **not** listed as deliverable now; `0.13` is excluded because it needs 0.8 + DEP-TEST approved first.

| # | WBS ID | Agent | Dependencies | Expected touched areas | Acceptance | Stop condition |
|---|---|---|---|---|---|---|
| 1 | 0.1 | Opus + Human | — | `docs/adr/0001-architecture.md` *(to create)*, folder plan for `src/` | ADR committed; target tree defined; starter widgets triaged | Stop if architecture needs a product decision not in the contract |
| 2 | 0.2 | Opus | 0.1 (task 1) | `src/app/_layout.tsx`, route-tree plan | Every non-shared registry screen mapped to one typed route | Stop if a screen has no clear route archetype |
| 3 | 0.3 | Opus + Human | 0.1 (task 1) | `docs/adr/0002-state.md` *(to create)* | State ADR with rationale + rejected options; no new dep without register approval | Stop if the state approach needs an unapproved dependency |
| 4 | 0.10 | Design + Opus | 0.1 (task 1) | Mapping rulebook doc | All 18 primitives + variants mapped Token→Component→Screen | Stop on any kit ambiguity → design review |
| 5 | 0.4 | Human | 0.1 (task 1) | Dependency register (DEP-DB), schema outline | **Human decision gate — no implementation before approval.** DEP-DB approved/rejected; schema outline ratified | No code/schema work until DEP-DB is approved |
| 6 | 0.8 | Human | 0.1 (task 1) | Dependency register (DEP-TEST) | **Human decision gate — no install/config before approval.** DEP-TEST approved/rejected (unblocks 0.13) | No package/test-config work until DEP-TEST is approved |
| 7 | 0.11 | Opus | 0.10 (task 4) | testID mapping rule doc | Deterministic `data-mx-node`→`testID` rule covering every spec node | Stop if a spec node has no stable id |
| 8 | 1.1 | Opus | 0.1 (task 1), 0.10 (task 4) | `src/design-system/tokens/` *(to create)* | All tokens typed for light+dark; no value drift vs CSS | Stop if a token has no CSS source |
| 9 | 1.2 | Opus | 1.1 (task 8) | Theme provider, `src/hooks/use-theme.ts` | Theme reskins from tokens only; matches light/dark shots | Stop if dark requires a non-token override |
| 10 | 1.3 | Opus | 1.1 (task 8) | `expo-font` load, typography tokens | Plus Jakarta Sans loads on all platforms; weights resolve | Stop if the variable font fails on a platform |

---

## Commit Traceability Log

Newest first. Update on every merged slice with the actual squash-merge hash and the WBS IDs it delivered.

| Commit | Date | WBS IDs | Summary |
|---|---|---|---|
| TBD — replace with actual squash-merge hash in the next WBS update. | 2026-07-13 | 1.2 | WBS 1.2 Theme provider + light/dark: add `src/design-system/theme/` (`resolveTheme(scheme)` → active `Theme` from tokens; `ThemeProvider` reads system scheme via `@/hooks/use-color-scheme` + in-memory `mode` override; `useTheme`/`useThemeMode` hooks; `font.text()` composer since the kit has no named type roles) + top barrel `src/design-system/index.ts`; mount `ThemeProvider` in `src/app/_layout.tsx`. No component branches on scheme (ADR 0004); override persistence deferred to 6.x/10.1. `tsc` + `expo lint` clean. 1.2 → Implemented; counts 9 Implemented / 6 Specified / 52 Blocked |
| 181e8d9 | 2026-07-13 | 1.1 | WBS 1.1 Tokens → TypeScript: add `src/design-system/tokens/` (colors light+dark, spacing+layout, radius, typography, elevation, motion, size/icon-size/stroke/opacity + barrel `index.ts` exposing a frozen `tokens` object). Verbatim from `tokens/*.css`, no value drift; role names frozen; RN-native shadow mapping for elevation (webShadow kept for parity). `tsc --noEmit` + `expo lint` clean. 1.1 → Implemented; counts 8 Implemented / 7 Specified / 52 Blocked |
| dd962fe | 2026-07-13 | 0.11 | WBS 0.11 `data-mx-node` → `testID` mapping: add `docs/adr/0006-testid-mapping.md` — deterministic rule carrying each kit `data-mx-node` id (the `node` prop, `"<screen>/<part>"` slug) onto the RN node as `testID` 1:1 (R1–R5: identity carry-through, single `node` input, one id→one host node, frozen slug shape, coverage), kept distinct from `accessibilityLabel`. 0.11 → Implemented; counts 7 Implemented / 8 Specified / 52 Blocked |
| e67934a | 2026-07-13 | 0.8 | WBS 0.8 Test framework decision: **DEP-TEST approved** (register → Approved; `jest-expo` + `@testing-library/react-native`). Decision only — no install/config here (that is 0.13). Unblocks 0.13 → Specified. 0.8 → Implemented; counts 6 Implemented / 9 Specified / 52 Blocked |
| 44d21ab | 2026-07-13 | 0.4 | WBS 0.4 Local database decision: **DEP-DB approved** (register → Approved); add `expo-sqlite ~57.0.0` (config plugin in `app.json`); `docs/adr/0005-db-schema.md` (offline-first source-of-truth, access-layer contract with `tx()` transaction helper, 10-table schema outline). Unblocks 0.5 → Specified. 0.4 → Implemented; counts 5 Implemented / 8 Specified / 54 Blocked |
| 86e8dd3 | 2026-07-13 | 0.10 | WBS 0.10 UI Kit → React Native mapping: add `docs/adr/0004-uikit-rn-mapping.md` — layering rule, token-CSS→TS-theme mapping, web-idiom→RN-idiom table (onClick→onPress, className→theme styles, material-symbols→Icon, data-mx-node→testID), and a mapping table for all 18 `Mx*` primitives (base class + variants→props, names frozen). 0.10 → Implemented; counts 4 Implemented / 7 Specified / 56 Blocked |
| 9d767a0 | 2026-07-13 | 0.3 | WBS 0.3 State-management decision: add `docs/adr/0003-state.md` — no global store lib; DB-backed state via a repository-hooks layer over `useSyncExternalStore`, focused Contexts for theme/session/db-readiness, local `useState`/`useReducer` for UI/forms; rejected Redux/Zustand/Jotai/React-Query/MobX; 0 new dependencies. 0.3 → Implemented; counts 3 Implemented / 8 Specified / 56 Blocked |
| 770c84f | 2026-07-13 | 0.2 | WBS 0.2 Expo Router strategy: add `docs/adr/0002-routing.md` (screen→route map for all 25 business screens + back/deep-link notes) and the `src/app/**` route tree — `(tabs)` group (Today/Library/Stats/Profile), `session`/`settings`/`deck/[deckId]` stacks, `card`/`search`/`player` modals, 26 placeholder route files + `+not-found`, retire starter `index`/`explore`. `tsc --noEmit` + `expo lint` pass. 0.2 → Implemented; counts 2 Implemented / 9 Specified / 56 Blocked |
| b6893dc | 2026-07-13 | 0.1 | **Implementation begins.** WBS 0.1 Production folder architecture: add `docs/adr/0001-architecture.md` (feature-sliced layered layout, one-way dependency direction, `@/*` alias, starter-widget retirement plan) + `src/{design-system,features,shared,db}/` skeleton READMEs. 0.1 → Implemented; counts 1 Implemented / 10 Specified / 56 Blocked |
| ea77269 | 2026-07-13 | UI Kit Coverage (sections 3–10 screens) | Surface the 2.6 quality-readiness gate in the UI Kit Coverage table: add "Quality readiness gate: 2.6" to the Blocked reason of every production screen (24 rows), keeping theme and app-bar (bootstrap shell) unchanged. Docs-only, coverage table only — no dependency-graph or status-count change |
| 2d00d10 | 2026-07-13 | 1.4, 1.5, 1.8, 2.3, 2.4, 2.6, 8.2, 11.2, 3.3–10.3 | Enforce quality-harness ordering: move 1.4/1.5 automated tests into 1.8 (implementation contracts only); add 2.6 feature quality-harness readiness gate (deps 11.1/11.3/11.4); gate all production screen slices (3.3–10.3) on 2.6 without a cycle; add 0.13 + shared quality harnesses + 2.6 to the Critical Path and MVP A; correct MVP A gates (DEP-DB, DEP-TEST, DEP-ICON-FONT, DEP-GOLDEN, DEP-TTS); fix stale 0.8/0.4 evidence (1.8/2.4/11.2 → 0.13; 2.3/8.2 persistence → 0.5); recount (67 rows: 11 Specified / 56 Blocked) |
| a4155ee | 2026-07-13 | 0.6, 0.7, 0.8, 0.13, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 8.2, 11.1, 11.3, 11.4, 11.6 | Fix test and quality prerequisites: split the test-framework decision (0.8) from the harness setup (0.13, new); add the test-harness prerequisite to test-owning domain/persistence rows (0.6, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2 → Blocked); gate icon-based primitives 1.5/1.6/1.7 on 1.4 (Blocked, cascading 0.7/2.1/2.2); convert 11.1/11.3/11.4 into harness/contract rows + add Vertical Slice Quality Ownership; expand 11.6 content-flow prerequisites; gate theme/reminder persistence on 0.5; recalculate work-package and status counts (66 rows: 11 Specified / 55 Blocked) |
| 093ea6e | 2026-07-13 | 0.4, 1.4, 10.2, 10.3, 11.6 | Fix remaining dependency gates: remove the DEP-DB self-cycle from the 0.4 decision gate; add DEP-ICON-FONT and set 1.4 Blocked; gate 10.2 and 10.3 behind MVP B (5.5 + 7.4); add DEP-FILE-PICKER/DEP-FILE-SHARING to 10.3; gate 11.6 smoke on import/export (9.1, 9.2); recalculate status counts (21 Specified / 44 Blocked) |
| e4ca0e3 | 2026-07-13 | 1.4, 1.5, 7.4, 8.1 | Fix WBS review findings: add MxList (18 primitives), correct 7.4↔8.1 dependency direction, reorder Next 10 (0.3 before 0.7), set 2.5 Blocked, normalize dependency ids to WBS/DEP-*, fix icon parity strategy |
| 7015e0b | 2026-07-13 | — | Create production implementation WBS from the UI Kit (docs-only) |

---

## Status Summary

67 work packages total (0.13 and 2.6 added).

| Status | Count |
|---|---:|
| Implemented | 9 |
| Partial | 0 |
| Specified | 6 |
| Blocked | 52 |
| Future | 0 |
| Deprecated | 0 |

`Implemented` = 0.1 (folder architecture), 0.2 (Expo Router route tree), 0.3 (state-management ADR), 0.10 (UI-Kit→RN mapping), 0.4 (local DB — DEP-DB approved), 0.8 (test-framework decision — DEP-TEST approved), 0.11 (`data-mx-node`→`testID` mapping rule), 1.1 (tokens → typed TS, `src/design-system/tokens/`), 1.2 (ThemeProvider + light/dark, mounted in root layout). `Specified` = 0.5, 0.9, 0.12, 0.13, 1.3, 11.9 (0.5←0.4, 0.13←0.8, 1.3←1.1) — governance + font foundation, startable now. `Blocked` = the remaining 52 rows, gated on the local-DB decision (0.4/0.5), the test-framework decision + harness (0.8/0.13), the icon font (1.4/DEP-ICON-FONT), the feature quality-harness readiness gate (2.6, via 11.1/11.3/11.4), or another unapproved capability (DEP-TEST, DEP-GOLDEN, DEP-TTS, DEP-NOTIFICATIONS, DEP-FILE-PICKER, DEP-FILE-SHARING, DEP-AUTH, DEP-CLOUD). Notably 0.6/0.7 (need the test harness), 1.4–1.7 (need the icon font DEP-ICON-FONT), 2.1/2.2 (need those primitives) and every feature slice 3.3–10.3 (gated on 2.6) are Blocked; 9 + 0 + 6 + 52 + 0 + 0 = 67. Production foundation is being laid decision-by-decision; feature screens remain scaffolds until 2.6.
