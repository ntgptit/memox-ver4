# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Design System — single source of truth

`docs/design/MemoX Design System_v4/` is the **primary design kit** for this project. All UI/design work (screens, components, styling, prototypes, mocks) MUST be built from it.

- Read `docs/design/MemoX Design System_v4/readme.md` and `SKILL.md` before doing any visual work. The `memox-design` skill (user-invocable) is backed by this kit — prefer it for design tasks.
- **Three one-way layers:** Token → Component → Screen. Screens use only Components; Components use only Tokens. No layer-skipping.
- **No raw visual values** above the token layer — no `#rrggbb`, literal px colors/spacing. Use `--memox-<role>` tokens (`tokens/*.css`), light in `:root`, dark in `[data-theme="dark"]`.
- Use the frozen `Mx*` component family (`components/<group>/`) with their stable base classes; variants are modifiers, never new names.
- **Golden rule:** changing a *value* is free; changing a *name or id* breaks the system. Keep token names, `Mx*` names/classes, and `data-mx-node` ids stable.
- CSS/HTML in the kit is the design-reference/prototyping layer; production maps these tokens and base classes onto React Native styles and `Mx*` RN components. Icons: Material Symbols Rounded (Google Fonts CDN). No emoji in UI.

# Mobile UI — Construction Contract (bắt buộc)

Building any mobile screen is governed by **`docs/design/mobile-ui-construction-contract.md`**. It is MANDATORY, not advisory. Do NOT build a screen by only assembling tokens/theme/shared widgets.

- **Before coding a screen**, complete steps 1–5: screen objective (single primary CTA), chosen archetype, composition map, and confirm layout + hierarchy rules. If the primary objective is undefined, do not start.
- **Spacing** is restricted to `{4, 8, 12, 16, 24, 32, 48}`; screen padding 16; section gap 24/32; item gap 8/12. Max 3 nested surfaces, max 5 typography roles, exactly one top-level heading and one primary CTA. Touch targets ≥ 44×44. No hard-coded color/radius/typography/spacing outside the design system.
- **Do not close a task on the happy path alone.** Build the full state matrix (loading, loaded normal/min/dense, empty, recoverable error, long text, large font, narrow device, dark mode) and, for forms, the submit lifecycle (validation error, disabled, submitting, failure, success).
- **Edge-data + visual verification are required** (steps 6–8): render each fixture, screenshot, diff against the reference, file numbered defects, fix, re-shoot, and pass every visual gate before marking done.
- **Definition of Done** = all step-9 artifacts present. Never sign off with "clean/modern/polished/looks good" — every conclusion must cite the specific rule, fixture, or visual gate satisfied.
