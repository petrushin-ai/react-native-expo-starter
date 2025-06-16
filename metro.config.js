const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .lottie files
config.resolver.assetExts.push('lottie');

module.exports = config; 