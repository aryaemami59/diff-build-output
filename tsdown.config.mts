import { builtinModules } from 'node:module'
import type { InlineConfig, Rolldown, UserConfig, UserConfigFn } from 'tsdown'
import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'
import packageJson from './package.json' with { type: 'json' }

const external = [
  ...Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  }),
  ...builtinModules,
  /^node:/,
]

const tsdownConfig: UserConfigFn = defineConfig((cliOptions) => {
  const commonOptions = {
    attw: { enabled: false, level: 'error' },
    checks: { circularDependency: true },
    cjsDefault: false,
    clean: false,
    cwd: import.meta.dirname,
    deps: {
      dts: { neverBundle: external },
      neverBundle: external,
      onlyBundle: [],
    },
    devtools: { clean: true, enabled: true },
    dts: {
      build: false,
      cjsDefault: false,
      cwd: import.meta.dirname,
      dtsInput: false,
      eager: false,
      emitDtsOnly: false,
      emitJs: false,
      enabled: true,
      generator: 'tsc',
      incremental: false,
      logger: console,
      newContext: false,
      oxc: {},
      parallel: false,
      resolver: 'tsc',
      sideEffects: false,
      sourcemap: true,
      tsconfig: 'tsconfig.build.json',
      tsgo: {},
      vue: false,
    },
    inputOptions(options) {
      return {
        ...options,
        experimental: {
          ...options.experimental,
          lazyBarrel: true,
          nativeMagicString: true,
        },
        transform: {
          ...options.transform,
          typescript: {
            ...options.transform?.typescript,
            optimizeConstEnums: true,
            optimizeEnums: true,
          },
        },
      } as const satisfies Rolldown.InputOptions
    },
    minify: 'dce-only',
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
        // minify: { codegen: { legalComments: 'external' } },
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
        strict: true,
      } as const satisfies Rolldown.OutputOptions
    },
    entry: ['src/index.ts'],
    failOnWarn: true,
    fixedExtension: false,
    format: ['esm'],
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
      plugins: [
        ApiSnapshot({
          categorizedExports: true,
          extensionDts: '.snapshot.d.ts',
          extensionRuntime: '.snapshot.js',
          header: true,
          omitArgumentNames: false,
          outputDir: '__snapshots__/tsnapi',
          typeWidening: true,
          // update: true,
        }),
      ],
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
