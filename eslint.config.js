// Committed ESLint flat config so `npm run lint` (expo lint) is reproducible — no auto-install /
// auto-generated config on first run. Extends eslint-config-expo (SDK 57).
// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

const expo = Array.isArray(expoConfig) ? expoConfig : [expoConfig];

module.exports = [
  ...expo,
  {
    ignores: ['dist/*', 'node_modules/*', 'docs/design/**', '.expo/*'],
  },
];
