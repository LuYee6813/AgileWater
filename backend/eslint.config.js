import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/** @type { import("eslint").Linter.Config[] } */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}']
  },
  {
    ignores: ['eslint.config.js', '.env', '.env.*', '!env.example', '**/dist/**']
  },
  {
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase']
        }
      ]
    }
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended
];
