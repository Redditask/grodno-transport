import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'work/**', '.idea/**'],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    extends: [js.configs.recommended],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'prefer-const': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:', '^@?\\w'],
            ['^@/', '^#'],
            ['^\\.'],
            ['^\\u0000?.+\\.(?:css|s[ac]ss)(?:\\u0000)?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  prettier,
]);
