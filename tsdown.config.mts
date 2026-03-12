import { builtinModules } from 'node:module'
import type { InlineConfig, Rolldown, UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

const external = [
  ...Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  }),
  ...builtinModules,
  /^node:/,
]

const tsdownConfig = defineConfig((cliOptions) => {
  const commonOptions = {
    attw: { enabled: false, level: 'error' },
    checks: { circularDependency: true },
    clean: false,
    cwd: import.meta.dirname,
    deps: { neverBundle: external, onlyBundle: [] },
    devtools: { clean: true, enabled: true },
    dts: {
      emitJs: false,
      enabled: true,
      oxc: false,
      resolver: 'tsc',
    },
    inputOptions(options) {
      return {
        ...options,
        experimental: {
          ...options.experimental,
          lazyBarrel: true,
          nativeMagicString: true,
        },
      } as const satisfies Rolldown.InputOptions
    },
    minify: false,
    nodeProtocol: true,
    outputOptions(options, format, context) {
      return {
        ...options,
        codeSplitting: false,
        comments: {
          annotation: true,
          jsdoc: true,
          legal: true,
        },
        strict: true,
        // plugins: [
        //   {
        //     name: 'remove-cjs-outputs-from-dts-builds',

        //     generateBundle: {
        //       handler(outputOptions, bundle, isWrite) {
        //         console.log(bundle)
        //         Object.values(bundle).forEach((outputBundles) => {
        //           if (
        //             outputOptions.format === 'cjs' &&
        //             isWrite &&
        //             (outputBundles.fileName.endsWith('index.cjs') ||
        //               outputBundles.fileName.endsWith('index.cjs.map'))
        //           ) {
        //             delete bundle[outputBundles.fileName]
        //           }
        //         })
        //       },
        //     },
        //   },
        // ],
        ...(format === 'cjs' && !context.cjsDts
          ? {
              externalLiveBindings: false,
            }
          : {}),
      } as const satisfies Rolldown.OutputOptions
    },
    entry: ['src/index.ts'],
    failOnWarn: true,
    fixedExtension: false,
    format: ['es'],
    hash: false,
    name: packageJson.name,
    platform: 'node',
    publint: { enabled: false, strict: true },
    report: { enabled: true, gzip: true },
    root: 'src',
    shims: true,
    sourcemap: true,
    target: ['esnext'],
    treeshake: { moduleSideEffects: false },
    tsconfig: 'tsconfig.build.json',
    unused: {
      depKinds: ['dependencies', 'peerDependencies'],
      enabled: true,
      level: 'error',
      root: import.meta.dirname,
    },
    ...cliOptions,
  } as const satisfies InlineConfig

  return [
    {
      ...commonOptions,
    },
    {
      ...commonOptions,
      dts: {
        ...(typeof commonOptions.dts === 'object' ? commonOptions.dts : {}),
        // emitDtsOnly: true,
      },
      format: ['cjs'],
    },
  ] as const satisfies UserConfig[]
})

export default tsdownConfig
