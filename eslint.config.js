import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import astroPlugin from 'eslint-plugin-astro';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'build/'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...configPrettier.rules,

      // React Hooks厳格運用（04-quality P0要件）
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',

      // 変数管理
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',

      // 型安全性（04-quality P0要件）
      eqeqeq: 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // React セキュリティ
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-find-dom-node': 'error',

      // TypeScript品質
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/only-throw-error': 'error',

      // 警告レベル
      'no-console': 'warn',
      'react/no-danger': 'warn',
      'react/display-name': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',

      // React 17+ & TypeScript環境での無効化
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Prettier
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroPlugin.parser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  },
  // テストファイル用設定
  {
    files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*', '**/test/**/*'],
    languageOptions: {
      globals: {
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-undef': 'off',
    },
  },
  // 設定ファイル用設定
  {
    files: ['**/*.config.*', '**/.*rc.*'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
    },
  },
];
