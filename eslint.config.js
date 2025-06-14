import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/', 
      'node_modules/', 
      '.astro/', 
      'build/', 
      'storybook-static/',
      // Re-enable Astro linting with proper virtual file configuration
    ],
  },
  // Base ESLint recommended
  eslint.configs.recommended,
  
  // JavaScript/JSX files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // 基本的なルール
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': 'error',
      
      // React Rules
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-danger': 'warn',
      'react/display-name': 'warn',
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/prop-types': 'off', // TypeScript環境
      
      // React Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // TypeScript files (source code)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      
      // 基本的なルール
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': 'error',
      
      // React Rules
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-danger': 'warn',
      'react/display-name': 'warn',
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/prop-types': 'off', // TypeScript環境
      
      // React Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // Disable conflicting rules
      'no-unused-vars': 'off', // Use @typescript-eslint version
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // TypeScript files (config files) - No project requirement
  {
    files: ['**/*.config.{ts,js}', '.storybook/**/*.{ts,js}', 'vitest.workspace.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        __dirname: 'readonly', // Add __dirname global
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off', // Disable for config files
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off', // Allow type in config files
      // Basic quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': 'error',
    },
  },
  
  // Astro base configuration only (avoiding TypeScript conflicts)
  ...eslintPluginAstro.configs.base,
  
  // Configuration for Astro virtual files (client script blocks as *.ts)
  {
    files: ['**/*.astro/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        dataLayer: 'writable', // Google Tag Manager global
      },
      parserOptions: {
        sourceType: 'module',
        project: null, // Disable type information for virtual files
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable all TypeScript rules that require type information
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      
      // Basic quality rules that don't require type info
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      
      // Note: prettier/prettier should be disabled for virtual files as per docs
      'prettier/prettier': 'off',
    },
  },
  
  // Configuration for Astro virtual files (client script blocks as *.js)
  {
    files: ['**/*.astro/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        dataLayer: 'writable', // Google Tag Manager global
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      // Basic quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      
      // Note: prettier/prettier should be disabled for virtual files as per docs
      'prettier/prettier': 'off',
    },
  },
  
  // Additional Astro rules override for quality standards
  {
    files: ['**/*.astro'],
    rules: {
      // Disable TypeScript rules that need type information for Astro files
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      
      // Basic quality rules for Astro (from 04-quality.mdc)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'eqeqeq': 'error',
      
      // Enhanced Astro specific rules for quality and security (manual)
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
      'astro/no-set-html-directive': 'warn', // Security warning (from docs)
      'astro/no-deprecated-astro-canonicalurl': 'error',
      'astro/no-deprecated-astro-fetchcontent': 'error',
      'astro/no-deprecated-astro-resolve': 'error',
      'astro/no-deprecated-getentrybyslug': 'error',
      'astro/valid-compile': 'error',
      'astro/semi': 'error', // Consistency with 04-quality.mdc
      'astro/missing-client-only-directive-value': 'error',
      
      // Additional basic rules that don't require type information
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  
  // Storybook files
  {
    files: ['.storybook/**/*', '**/*.stories.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off', // Allow type in stories
      // Basic quality rules
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // Test files
  {
    files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*', '**/test/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },
]; 