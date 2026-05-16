// ESLint v9 flat config (CommonJS)
const prettierPlugin = require("eslint-plugin-prettier");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "mysql_data/**",
      "**/dist/**",
      "**/build/**",
      "**/*.min.js"
    ]
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        global: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      }
    },
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin
    },
    rules: {
      "prettier/prettier": ["warn", { endOfLine: "auto" }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["parent", "sibling", "index"]],
          "newlines-between": "always"
        }
      ]
    }
  }
];


