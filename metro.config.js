const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { resolver } = config;

  resolver.sourceExts.push('cjs');

  resolver.unstable_enablePackageExports = false;

  return config;
})();
