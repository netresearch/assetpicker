import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "vendor/**"],
  },
  js.configs.recommended,
  // "essential" = the plugin's error-prevention rules only. The stylistic
  // tiers ("strongly-recommended", "recommended") are left out: the project
  // has no formatter and does not enforce template layout.
  ...pluginVue.configs["flat/essential"],
  {
    files: ["app/**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    // vite.config.js sets `test.globals: true`, so the specs use
    // describe/it/expect/vi without importing them.
    files: ["app/tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.vitest,
        ...globals.node,
      },
    },
  },
  {
    files: ["*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
