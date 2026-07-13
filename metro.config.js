// Metro configuration (WBS 2.3). Extends the Expo default only to register the
// `.wasm` asset that `expo-sqlite`'s web build imports (wa-sqlite), so the offline
// database bundles for web as well as native.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = config;
