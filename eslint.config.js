// Committed ESLint flat config so `npm run lint` (expo lint) is reproducible — no auto-install /
// auto-generated config on first run. Extends eslint-config-expo (SDK 57).
// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

const expo = Array.isArray(expoConfig) ? expoConfig : [expoConfig];

// WBS 0.12 — raw visual-value guard. Above the token layer (screens + features), raw
// visual values are forbidden: colours come from `useTheme()` tokens, never `#hex` /
// `rgb()` / `hsl()` literals, and the raw token layer (`@/design-system/tokens`) must
// not be imported directly (one-way layering: Token → Component → Screen, ADR 0004).
// The design-system layer itself is exempt (it *defines* the tokens); tests may assert
// on raw values. Enforced by `npm run lint`; the off-scale-spacing rule is documented
// in docs/design/mobile-ui-construction-contract.md §4 and reviewed.
const RAW_COLOR_MESSAGE =
  'Raw colour literal above the token layer (WBS 0.12). Use a `--memox-*` token via `useTheme()` (t.color.*), not a #hex/rgb/hsl literal.';
const RAW_TOKEN_IMPORT_MESSAGE =
  'Do not import the raw token layer into a screen/feature (WBS 0.12, one-way layering). Read values from `useTheme()` instead.';

const rawValueGuard = {
  files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
  ignores: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/fixtures.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
        message: RAW_COLOR_MESSAGE,
      },
      {
        selector: 'Literal[value=/\\b(rgb|rgba|hsl|hsla)\\(/]',
        message: RAW_COLOR_MESSAGE,
      },
      {
        selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]',
        message: RAW_COLOR_MESSAGE,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: '@/design-system/tokens', message: RAW_TOKEN_IMPORT_MESSAGE },
          { name: '@/design-system', importNames: ['tokens', 'Tokens'], message: RAW_TOKEN_IMPORT_MESSAGE },
        ],
        patterns: [
          { group: ['**/design-system/tokens', '**/design-system/tokens/**'], message: RAW_TOKEN_IMPORT_MESSAGE },
        ],
      },
    ],
  },
};

module.exports = [
  ...expo,
  rawValueGuard,
  {
    ignores: ['dist/*', 'node_modules/*', 'docs/design/**', '.expo/*'],
  },
];
