/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */


/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2023: true,
    worker: true
  },
  reportUnusedDisableDirectives: true,

  // Base config
  extends: [
    "eslint:recommended"
  ],
  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
        "import/resolver": {
          typescript: {},
        },
      },
      rules: {
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "off",
        "react/function-component-definition": [
          "error",
          {
            namedComponents: "function-declaration",
            unnamedComponents: "arrow-function",
          },
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
      },
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },

      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      rules: {
        "no-unused-vars": "off",
        "no-constant-condition": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
        ],
        "@typescript-eslint/consistent-type-imports": [
          "warn",
          {
            prefer: "type-imports",
            disallowTypeAnnotations: true,
            fixStyle: "inline-type-imports",
          },
        ]
      }
    },

    // tailwind
    {
      files: ["**/*.{jsx,tsx}"],
      plugins: ["tailwindcss"],
      settings: {
        config: "./tailwind.config.js",
        "callees": ["cn", "cva"],
      },

    },

    // Node
    {
      files: [".eslintrc.cjs", "server.js"],
      env: {
        node: true,
      },
    },
  ],
};
