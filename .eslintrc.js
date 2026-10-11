const path = require("path");

module.exports = {
  extends: "next/core-web-vitals",
  // Resolve the preset from this package. The IDE lints with cwd set to the
  // workspace root, where `next/babel` is not installed.
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  settings: {
    next: {
      rootDir: path.join(__dirname, "/"),
    },
  },
  ignorePatterns: ["package.json", "package-lock.json"],
};
