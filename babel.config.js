module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // ... other plugins (like 'nativewind/babel')
      "react-native-reanimated/plugin", // <--- Add this line LAST
    ],
  };
};
