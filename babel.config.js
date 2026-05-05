module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: react-native-reanimated/plugin is NOT needed for reanimated v4
    // (Expo SDK 54+). Adding it here would cause web bundling failures.
  };
};
