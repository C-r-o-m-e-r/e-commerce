// /backend/eslint.config.js

import globals from "globals";
import js from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import prettierConfig from "eslint-config-prettier";

export default [
  // FIX: Moved ignores to the top level for global application
  {
    ignores: ["node_modules/", "dist/", "src/generated/prisma/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", 
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // FIX: Allow unused variables if they start with an underscore
      "no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
        },
      ],
      "semi": ["error", "always"],
    },
  },
  {
    files: ["tests/**/*.js"],
    ...pluginJest.configs['flat/recommended'],
    rules: {
        ...pluginJest.configs['flat/recommended'].rules,
        "no-undef": "off" 
    }
  },
  prettierConfig,
];