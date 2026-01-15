import { createESLintConfig } from '@aryaemami59/eslint-config'
import packageJsonEslintPlugin from 'eslint-plugin-package-json'

const eslintConfig = createESLintConfig([
  {
    files: ['**/*.?(c|m)[jt]s?(x)'],
    name: 'overrides/files',
  },
  {
    extends: [
      packageJsonEslintPlugin.configs.recommended,
      packageJsonEslintPlugin.configs.stylistic,
    ],
    files: ['package.json'],
    name: 'overrides/package-json',
    rules: {
      // TODO: Disable these rules in `@aryaemami59/eslint-config` package.
      '@typescript-eslint/consistent-type-exports': [0],
      '@typescript-eslint/consistent-type-imports': [0],
      '@typescript-eslint/no-confusing-void-expression': [0],
      '@typescript-eslint/no-duplicate-type-constituents': [0],
      '@typescript-eslint/no-redundant-type-constituents': [0],
      '@typescript-eslint/no-unnecessary-type-arguments': [0],
      '@typescript-eslint/no-unnecessary-type-assertion': [0],
      '@typescript-eslint/no-unnecessary-type-parameters': [0],
      '@typescript-eslint/prefer-nullish-coalescing': [0],
      '@typescript-eslint/require-await': [0],
      'package-json/require-author': [2],
    },
  },
])

export default eslintConfig
