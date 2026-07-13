# Accessibility baseline & contract (WBS 11.3)

The accessibility rules every MemoX component and screen follows, and the shared
helpers that enforce them. This baseline runs against the design system + shell; it
does **not** audit feature screens that don't exist yet — each slice adds its own a11y
tests (the per-slice contract below).

## Role & label convention

- Every interactive element has an **accessibility role**: `button` (MxButton,
  MxIconButton, MxChip, MxFab), `link` (MxLink), `switch` (MxSwitch), `tab` /
  `tablist` (MxBottomNav, MxSegmentedControl), `header` (MxContextualAppBar),
  `image` (a labelled Icon).
- Icon-only controls **must** carry an `accessibilityLabel` (the RN mapping of the
  kit's `ariaLabel`). A purely decorative icon is hidden from a11y instead.
- Stateful controls expose `accessibilityState`: `disabled`, `checked` (switch),
  `selected` (chip / tab).

## Target-size rule

- Interactive targets are **≥ 44×44 px** (48 preferred). Components that render a
  smaller visual (e.g. `MxIconButton size="sm"`, `MxSwitch`) restore the target with
  `hitSlop`. Enforced via `MIN_TOUCH_TARGET` in `src/shared/testing/a11y.ts`.

## Font-scale rule

- Text sizes come from `theme.font.text(...)`, which honours the user **text scale**
  (WBS 2.3: 0.9 / 1 / 1.15). Screens must not hard-code font sizes, so raising the
  scale enlarges all text without clipping. Verify layouts at the `1.15` (large) scale.

## Contrast-check approach

- Colour pairs meet **WCAG AA**: 4.5:1 for normal text, 3:1 for large text / UI.
- Checked with `contrastRatio` / `meetsContrastAA` (`src/shared/testing/a11y.ts`),
  which parse hex + `rgba()` tokens and alpha-composite soft tints over the canvas.
- The token foreground/background pairs are asserted at AA in **both** schemes by
  `src/shared/testing/__tests__/a11y.test.ts`. (The kit palette was contrast-tuned;
  this locks it so a future token edit that breaks AA fails a test.)
- **Semantic soft tints** (`*Soft` on-`*`Soft pairs) exclusively back **bold** status
  badges/chips (`MxBadge`/`MxChip`), so the applicable bar is AA-**large** (3:1). Body
  text never sits on a semantic soft tint; the strong on-tint tokens are used there.

## Shared helpers

`src/shared/testing/a11y.ts` (test-only): `contrastRatio`, `meetsContrastAA`,
`parseColor`, `compositeOver`, `relativeLuminance`, `MIN_TOUCH_TARGET`, `flatStyle`.

## Vertical Slice Quality Ownership — a11y

**Every screen/component slice adds accessibility tests in its own PR**: roles +
labels present, interactive targets ≥44px, stateful controls announce their state,
and any new colour pairing meets AA. A slice is not done until these pass. See the
*Vertical Slice Quality Ownership* section of `docs/project-management/wbs.md` and the
primitive a11y suite in `src/design-system/components/__tests__/a11y.test.tsx`.
