/**
 * ESLint configuration file for the On Coder's MikroTik NOC application.
 * Enforces strict TypeScript rules, Vue 3 best practices, and code formatting standards.
 */
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import * as tseslint from "typescript-eslint";
import parserVue from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: ["coverage/*", "dist/**", "src-tauri/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,vue,js}"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // TypeScript strict overrides
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Vue rules
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/attribute-hyphenation": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/attributes-order": "off",

      // General code style enforcement
      "no-console": "off",
      eqeqeq: "off",
    },
  }
);
