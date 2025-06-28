const js = require("@eslint/js");
const globals = require("globals");
const complexity = require("eslint-plugin-complexity");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        require: "readonly",
        module: "readonly",
        process: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    },
    plugins: { js, complexity },
    rules: {
      "complexity": ["warn", { "max": 10 }]
    }
  }
];