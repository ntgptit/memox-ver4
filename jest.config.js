// Jest configuration — WBS 0.13 (production test harness).
// Uses the approved DEP-TEST stack: jest-expo preset + @testing-library/react-native.
// The transformIgnorePatterns whitelist lets Babel transform the RN/Expo ESM packages
// that ship untranspiled (jest-expo's documented value).
// Docs: https://docs.expo.dev/develop/unit-testing/
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  // Test files live next to source in __tests__ folders (ADR 0001 testing convention).
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**'],
};
