# Changelog — MemoX Design System

> Closes audit items **KIT-02-06** (no changelog/version-history proving the v4 snapshot
> is frozen) and **KIT-48-05** (no version metadata / changelog for release).

All notable changes to this kit are recorded here. This file is the source of truth for
version history and consumer notification (see `governance/versioning.md`). Impact
classes: **[additive]** new names, nothing renamed/removed · **[value]** value-only,
names/ids stable · **[breaking]** an existing name/id/class removed or renamed · **[docs]**.

The format follows Keep-a-Changelog conventions adapted to the kit's frozen-identifier
contract. Dates are ISO. The kit's major version is encoded in the folder name
(`MemoX Design System_v4`).

---

## [Unreleased] — targeting v4.1 kit freeze

Audit-remediation batch closing governance / release / scope / deprecation gaps from
`../mobile-design-kit-audit-v5/issue-register.md`. **Additive and documentation only —
no existing token/`Mx*`/class/`data-mx-node` identifier was renamed or removed, and
existing 390×780 light+dark shots are pixel-unchanged.**

### Added — governance & release docs [docs]
- `governance/OWNERS.md` — ownership index mapping foundation/component/pattern/theme to
  owner (Design System team) + reviewer role (KIT-46-01).
- `governance/CONTRIBUTING.md` — contribution template: use-cases, duplicate-check,
  required states, a11y, docs (KIT-46-02).
- `governance/acceptance-criteria.md` — token vs. component vs. pattern acceptance matrix
  (KIT-46-03).
- `governance/versioning.md` — version-bump/approval/migration/cadence/notification
  process (KIT-46-04, KIT-46-05).
- `governance/deprecation-policy.md` + structured deprecation table and the lint-blocks-
  new-usage rule (KIT-47-02…47-06).
- `governance/duplicate-scan.md` — duplicate/near-duplicate scan process (KIT-47-01).
- `governance/exception-register.md` — exceptions with owner/target/expiry (KIT-40-06,
  KIT-46-06).
- `governance/asset-export-spec.md` — asset export spec + tracked logo/app-icon gap
  (KIT-14-05, KIT-45-05).
- `governance/coverage-report.md` — aggregated shots/specs/contrast coverage (KIT-48-04).
- `governance/release-signoff.md` — sign-off record template, status BLOCKED (KIT-42-06,
  KIT-48-01, KIT-48-02, KIT-48-06).
- `governance/component-promotion.md` — promotion evaluation of recurring `_shared`
  composites (KIT-15-06).
- `SCOPE.md` — supported/not-supported/planned matrix + Current/Future/Deprecated status
  taxonomy (KIT-01-02, KIT-01-06, KIT-32-06, KIT-33-*, KIT-36-06).
- `CHANGELOG.md` — this file (KIT-02-06, KIT-48-05).

### Notes
- These are additive/doc changes. No consumer migration required.
- Open P0/P1 audit items (e.g. RTL/i18n KIT-37, responsive KIT-32, some a11y) remain
  tracked; release stays **BLOCKED** per `governance/release-signoff.md`.

---

## [v4] — deep-violet baseline (frozen)

The from-scratch v4 visual system for MemoX (React Native), frozen under
`MemoX Design System_v4/`. This is the baseline snapshot; the entries below describe the
state captured at freeze, reconstructed from the kit sources (`readme.md`,
`_ds_manifest.json`, tokens, components).

### Foundation
- Deep-violet palette as the single color source of truth in `tokens/colors.css` —
  primary `#4b3a8c`, accent `#7355d6` (light) / `#a88fff` (dark), full light (`:root`)
  and dark (`[data-theme='dark']`) role sets, semantic success/warning/error/info.
- Token layers: `colors`, `typography` (+ `@font-face`), `spacing`, `component`,
  `opacity`, `radius`, `stroke`, `size`, `icon-size`, `elevation`, `motion`.
- Typeface: Plus Jakarta Sans variable (weight `200 800`),
  `fonts/PlusJakartaSans[wght].ttf`.
- Icons: Material Symbols Rounded (Google Fonts CDN), weight 400 / FILL 0.

### Components
- Frozen `Mx*` family: core (`MxButton`, `MxTextField`, `MxChip`, `MxBadge`, `MxSwitch`,
  `MxSegmentedControl`, `MxAvatar`, `MxLink`), surfaces (`MxScaffold`,
  `MxContextualAppBar`, `MxCard`, `MxSectionHeader`, `MxIconTile`, `MxList`), navigation
  (`MxBottomNav`, `MxFab`, `MxSearchDock`, `MxIconButton`). Each has a stable PascalCase
  name + stable base class; variants are modifiers.

### Screens
- App UI kit: **26 screens** under `ui_kits/memox-app/_features/`, assembled only from
  `Mx*` + kit-helpers, each state carrying a `data-mx-node` id — rendered in light + dark
  (**336** shots = 168 light + 168 dark) with **26** DOM specs under `specs/`.
- Kit ↔ app parity gate at **< 3%** per state × theme (`tool/parity/`), with **165**
  app-golden baseline shots.

### Migrations at freeze [value]
- **Legacy Tokyo-palette colors → deep violet.** An earlier revision sampled the Tokyo
  admin dashboard for its *color values only*; those values were fully migrated to deep
  violet before freeze (`readme.md`). No token names, component names/classes, or layout
  ever came from Tokyo — only the now-replaced color values. Do not reintroduce them.
  Tracked in `governance/deprecation-policy.md`.

### Known caveats at freeze
- No brand logo / app-icon asset — the wordmark is Plus Jakarta Sans Extrabold type
  (tracked in `governance/asset-export-spec.md` and `exception-register.md`).
- Screens use realistic placeholder copy/data; no real content/navigation/validation.
- Scope is phone portrait 390×780 (see `SCOPE.md`).
