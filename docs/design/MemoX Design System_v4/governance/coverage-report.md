# Coverage report

> Closes audit item **KIT-48-04** (coverage evidence — shots/specs/contrast — existed but
> was never aggregated into a released coverage report).

Aggregates the kit's existing verification evidence into one released view. Counts are
taken from the kit sources at the v4 baseline; the authoritative per-screen list lives in
`ui_kits/memox-app/specs/INDEX.md` (generated from `tool/ui_kit_shots/registry.mjs`).
Re-generate with the commands in each section — do not hand-edit counts elsewhere.

## Rendered-state coverage (kit gallery)

| Metric | Count | Source |
| --- | --- | --- |
| Screens (feature modules) | **26** | `ui_kits/memox-app/_features/` |
| DOM specs | **26** | `ui_kits/memox-app/specs/` |
| Rendered shots (total) | **336** | `ui_kits/memox-app/shots/*.png` |
| — light | **168** | `shots/*--light.png` |
| — dark | **168** | `shots/*--dark.png` |
| Theme parity | **1:1** light↔dark for every state | 168 = 168 |

Every screen is rendered through its full state matrix in **both** themes (per the mobile
UI construction contract). Regenerate: `npm run verify:ui-kit`.

## Component & token coverage

| Metric | Count | Source |
| --- | --- | --- |
| Frozen `Mx*` components | **18** | `components/` (core 8, surfaces 6, navigation 4) |
| Feature + shared composites registered | **80+** | `_ds_manifest.json` `components[]` |
| Token files | **11** | `tokens/` (colors, typography, spacing, component, opacity, radius, stroke, size, icon-size, elevation, motion) |
| Tokens inventoried | **190+** | `_ds_manifest.json` `tokens[]` |

## Contrast (accessibility) coverage

| Metric | Value | Source |
| --- | --- | --- |
| Contrast checker | `tool/ui_kit_shots/contrast.mjs` | wired into `npm run verify:ui-kit` |
| Standard | WCAG AA, **light + dark** | `readme.md` caveats |
| Scope | All text/icon color roles in `tokens/colors.css` | both `:root` and `[data-theme='dark']` |
| Status | Passing at v4 baseline | `verify:ui-kit` |

Regenerate: `node tool/ui_kit_shots/contrast.mjs`.

## Kit ↔ app parity coverage

| Metric | Value | Source |
| --- | --- | --- |
| App-golden baseline shots | **165** | `tool/app_golden/baseline/` |
| Compared pairs | **41** | `tool/parity/verify-app-parity.mjs` |
| Pairs below the 3% gate | **40** | `REMAINING-DIVERGENCES.md` |
| Pairs above the gate | **1** (`deck-settings--move` ~10%, **semantic by design**) | `parity-allowlist.json` + `exception-register.md` EXC-01 |
| Frame | 390 × 780 | parity gate |
| Comparison gaps (no kit counterpart) | 2 (`deck-content-choice--named`, `shell-dashboard--loaded`) | `REMAINING-DIVERGENCES.md`, EXC-05 |

Regenerate: `npm run parity:gate` (gate) / `npm run parity:app` (report).

## Coverage summary

- **Visual states:** 26 screens × light+dark fully rendered and spec'd (336 shots / 26
  specs) — no screen ships happy-path-only.
- **Accessibility:** all color roles contrast-checked AA in both themes.
- **Parity:** 40/41 production pairs under 3%; the single over-gate pair is a documented
  semantic divergence, not styling drift.
- **Open coverage gaps** (feed `release-signoff.md`): logo/app-icon assets absent
  (`asset-export-spec.md`), 2 uncomparable parity pairs (EXC-05), and RTL/i18n +
  responsive coverage not in scope (`SCOPE.md`).
