# Scope statement — MemoX Design System

> Closes audit items **KIT-01-02** (no Current/Future/Deprecated status field),
> **KIT-01-06** (no Supported/Not-supported/Planned scope matrix), **KIT-32-06**
> (foldable/split-view/hinge support statement), **KIT-33-01…33-05** (platform-profile /
> platform-parity scope), **KIT-36-06** (portrait-only statement), and the scope portions
> of **KIT-13-05** / **KIT-37** (RTL / i18n scope).

This document states, explicitly, what the kit **supports**, what it **does not
support**, and what is **planned**. Anything not listed as supported is out of scope and
must not be assumed to work. This replaces the previously silent phone-portrait
assumption.

## Supported (in scope, verified)

| Dimension | Supported value | Evidence |
| --- | --- | --- |
| Target platform | **React Native** app; CSS/HTML kit is the design-reference/prototyping layer | `readme.md`, `SKILL.md` |
| Form factor | **Phone, portrait** | `ui_kits/memox-app/` gallery |
| Reference frame | **390 × 780** portrait; parity shot frame 390×780 | `tool/parity/verify-app-parity.mjs`, kit `shots/` |
| Themes | **Light** (`:root`) and **dark** (`[data-theme='dark']`) | `tokens/colors.css`; 168 light + 168 dark shots |
| Visual language | **One** visual language across iOS + Android — no per-platform adaptation | this document (§Platform) |
| Typography | Plus Jakarta Sans variable (200–800), identical on both platforms | `tokens/typography.css` |
| Icons | Material Symbols Rounded (CDN), identical on both platforms | `readme.md` iconography |
| Touch targets | ≥ 44×44 (baseline `--memox-touch-min: 48px`), identical on both platforms | `tokens/spacing.css` |
| Language / direction | **English, LTR** placeholder content | `_features/**` |

## Not supported (out of scope, not planned)

| Dimension | Status | Note |
| --- | --- | --- |
| **Tablet / large-screen** layouts | Not supported | No large-screen breakpoints, adaptive grids, or multi-pane layouts. |
| **Landscape** orientation | Not supported | Kit is portrait-only; landscape is not designed or shot. |
| **Foldable / split-view / hinge** | Not supported | No foldable/dual-screen/hinge-aware layouts or postures. |
| **Platform-specific (iOS vs. Android) adaptation** | Not supported | Single visual language; MemoX does **not** adapt controls to Cupertino/Material per platform. See platform decisions below. |
| **RTL** (right-to-left) | Not supported | No logical properties/mirroring; directional icons (`chevron_right`, `arrow_back`) do not mirror. Product is LTR-only. |
| **i18n / string externalization** | Not supported | Copy is English-only, hardcoded in JSX; no locale-format layer for number/date/plural/unit. |

## Planned (future, not yet in the kit)

| Item | Status | Tracked by |
| --- | --- | --- |
| Brand logo / app-icon asset + clear-space/min-size/dark-bg specs | Planned | `governance/asset-export-spec.md`, `exception-register.md` (EXC-02) |
| Real product content replacing placeholders | Planned | `exception-register.md` (EXC-03) |
| High-contrast profile (`[data-hc='true']`) rollout across screens | Planned | additive; token profile defined |
| Localization expansion corpus + CJK/Vietnamese font-stack declaration | Planned | audit KIT-37 |
| Dashboard slice completion | Planned | WBS 5.3, `REMAINING-DIVERGENCES.md` |

## Platform decisions (single visual language)

MemoX ships **one** visual language on both iOS and Android — it does not swap to
Cupertino or platform-native controls. The relevant component/interaction choices:

| Concern | Decision | Rationale |
| --- | --- | --- |
| Switch / toggle | Custom `MxSwitch` (thumb grows as it travels) on both platforms | One brand feel; no iOS/Android divergence |
| Segmented control | Custom `MxSegmentedControl` | Consistent tinted pill across platforms |
| Selection / action sheets | Custom `MxCard`-based sheets (`DeckActionsSheet`, `SelectSheet`, `ValuePickerSheet`, …) | Brand-consistent bottom sheets, not OS action sheets |
| Time picker | Custom `TimePickerSheet` (reminder) | Matches the kit's sheet system rather than the OS wheel/clock picker; consistent chrome and theming |
| Back gesture / modal / navigation | One presentation, not platform-specific flow recordings | Single visual language; platform gesture behavior is delegated to RN navigation at runtime |

There is intentionally **no** platform-parity matrix that adapts these controls per OS —
the parity is "identical on both," which is the design decision, not a gap.

## Artifact status taxonomy (Current / Future / Deprecated)

The kit is a single `v4` release, so **every shipped artifact is implicitly `Current`**
unless marked otherwise. This taxonomy makes the status explicit going forward:

| Status | Meaning | Where recorded |
| --- | --- | --- |
| **Current** | Shipped in `v4`, supported, safe to use | default for all tokens/`Mx*`/composites in `_ds_manifest.json` |
| **Future** | Planned, defined but not rolled out | this file §Planned; `CHANGELOG.md` [Unreleased] |
| **Deprecated** | Replaced; new usage blocked; awaiting usage=0 removal | `governance/deprecation-policy.md` register |

Currently deprecated artifacts: legacy Tokyo color values (migrated/retired) and
`--memox-appbar-lg-height` (kept for compatibility). See the deprecation register.
