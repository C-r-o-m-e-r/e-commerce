// /backend/eslint.config.js
import globals from "globals";
import js from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/", "dist/"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "semi": ["error", "always"],
    },
  },

  {
    files: ["**/*.test.js", "**/*.spec.js"],
    ...pluginJest.configs['flat/recommended'],
  },

  prettierConfig,
];
