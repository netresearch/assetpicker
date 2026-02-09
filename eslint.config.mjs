import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.commonjs,
      },
    },
    rules: {
      // Downgrade to warnings for legacy code patterns.
      // These should be addressed over time but are pre-existing issues.
      "no-undef": "warn",
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
      "no-prototype-builtins": "warn",
      "no-useless-escape": "warn",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-shadow-restricted-names": "warn",
    },
  },
  {
    files: ["src/js/adapter/googledrive/**/*.js"],
    languageOptions: {
      globals: {
        gapi: "readonly",
      },
    },
  },
  {
    files: ["gulpfile.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "warn",
      "no-unused-vars": ["warn", { args: "none" }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
