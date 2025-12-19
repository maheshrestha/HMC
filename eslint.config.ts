import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
// @ts-expect-error Please Ignore
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.strict.rules,
      curly: ['error', 'all'],

      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],
      'consistent-return': ['error'],
      'no-undef': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-dupe-class-members': 'off',
      'no-fallthrough': ['error', { allowEmptyCase: true }],
      'no-return-await': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-extra-boolean-cast': 'error',
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'spaced-comment': ['error', 'always', { block: { balanced: true } }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['block', 'class', 'function', 'try'], next: '*' },
        { blankLine: 'always', prev: '*', next: ['return'] },
      ],

      'import/no-extraneous-dependencies': ['error', { devDependencies: false }],

      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'classMethod',
          modifiers: ['private'],
          format: ['camelCase'],
        },
        {
          selector: 'property',
          modifiers: ['requiresQuotes'],
          format: null, // Allow quoted property names (like ESLint rule names)
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          printWidth: 100,
          arrowParens: 'avoid',
          bracketSpacing: true,
          insertPragma: false,
          bracketSameLine: false,
          jsxSingleQuote: true,
          proseWrap: 'preserve',
          quoteProps: 'as-needed',
          requirePragma: false,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          useTabs: false,
        },
      ],
    },
  },
  {
    files: ['eslint.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: null,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['src/**/*.spec.ts', 'test/**/*'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
