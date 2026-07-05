import type { Config } from '@aryaemami59/eslint-config'
import { createESLintConfig, tseslintConfigs } from '@aryaemami59/eslint-config'
import type { PackageJsonPluginSettings } from 'eslint-plugin-package-json'
import packageJsonEslintPlugin from 'eslint-plugin-package-json'
import packageJson from './package.json' with { type: 'json' }

const eslintConfig: Config[] = createESLintConfig([
  {
    extends: [
      tseslintConfigs.strictTypeChecked,
      tseslintConfigs.stylisticTypeChecked,
    ],
    files: ['**/*.?(c|m)[jt]s?(x)'],
    name: `${packageJson.name}/overrides/files`,
    rules: {
      '@typescript-eslint/consistent-type-definitions': [2, 'type'],
      '@typescript-eslint/no-floating-promises': [
        2,
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              name: ['describe', 'suite', 'it', 'test'],
              package: 'node:test',
            },
          ],
        },
      ],
    },
  },
  {
    extends: [
      packageJsonEslintPlugin.configs.recommended,
      packageJsonEslintPlugin.configs.stylistic,
      tseslintConfigs.disableTypeChecked,
    ],
    files: ['**/package.json'],
    name: `${packageJson.name}/overrides/package-json`,
    rules: {
      // TODO: Disable these rules in `@aryaemami59/eslint-config` package.
      // '@typescript-eslint/consistent-type-exports': [0],
      '@typescript-eslint/consistent-type-imports': [0],
      // '@typescript-eslint/no-confusing-void-expression': [0],
      // '@typescript-eslint/no-duplicate-type-constituents': [0],
      // '@typescript-eslint/no-redundant-type-constituents': [0],
      // '@typescript-eslint/no-unnecessary-type-arguments': [0],
      // '@typescript-eslint/no-unnecessary-type-assertion': [0],
      // '@typescript-eslint/no-unnecessary-type-parameters': [0],
      // '@typescript-eslint/prefer-nullish-coalescing': [0],
      // '@typescript-eslint/require-await': [0],
      'package-json/require-author': [2, { ignorePrivate: false }],
    },
    settings: {
      'package-json': {
        enforceForPrivate: true,
      } satisfies PackageJsonPluginSettings,
    },
  },
])

export default eslintConfig
