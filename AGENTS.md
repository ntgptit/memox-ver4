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
