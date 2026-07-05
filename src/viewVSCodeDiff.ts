import type * as childProcess from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
/*
TODO: Investigate why `import { spawn } from 'node:child_process'` cause `index.d.ts` to be different from `index.d.cts`.
*/
// import { spawn } from 'node:child_process'
// import * as child_process from "node:child_process"
import * as process from 'node:process'
import type { ContentsInfo } from './checkForDuplicateSymbols.ts'
import type { DistributedOmit, LiteralUnion, Simplify } from './typeHelpers.ts'

// process.setSourceMapsEnabled(true)

const child_process: typeof childProcess =
  process.getBuiltinModule('node:child_process')

export type ViewVSCodeDiffOptions = Simplify<
  {
    /**
     * Included file extensions.
     *
     * @default []
     */
    includedExtensions?: readonly LiteralUnion<
      | `.${'c' | '' | 'm'}js`
      | `${'index' | '.legacy-esm'}.js`
      | `.${'browser' | 'modern'}.mjs`
      | `.${'development' | 'production.min'}.cjs`
      | `.d.${'c' | '' | 'm'}ts`
      | 'uncheckedindexed.ts',
      string
    >[]

    /**
     * Excluded file extensions.
     */
    excludedExtensions?: readonly string[]

    /**
     * The locale to use (e.g. `"en-US"` or `"zh-TW"`).
     *
     * @default "en-US"
     */
    locale?: string

    /**
     * Disable GPU hardware acceleration.
     *
     * @default false
     */
    disableGpu?: boolean

    /**
     * Disable LCD font rendering.
     *
     * @default false
     */
    disableLcdText?: boolean
  } & DistributedOmit<ContentsInfo, 'relativePath' | 'relativePosixPath'>
>

/**
 * Burrowed from {@link https://github.com/sxzz/rolldown-plugin-dts/blob/62aeaeac6af7169c5a69bdfeaa6c1d6ee3a587bc/src/tsgo.ts#L9C1-L14C5 | rolldown-plugin-dts}.
 */
export const spawnAsync = (
  ...args: Parameters<typeof child_process.spawn>
): Promise<ChildProcess> => {
  // process.setSourceMapsEnabled(true)

  return new Promise<ChildProcess>((resolve, reject) => {
    const child = child_process.spawn(...args)

    return child
      .on('close', () => {
        resolve(child)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

export const viewVSCodeDiff = async (
  viewVSCodeDiffOptions: ViewVSCodeDiffOptions,
): Promise<ChildProcess | undefined> => {
  const {
    disableGpu = false,
    disableLcdText = false,
    includedExtensions = [],
    locale = 'en-US',
    newOutput,
    oldOutput,
  } = viewVSCodeDiffOptions

  // const excludedExtensions =
  //   viewVSCodeDiffOptions.excludedExtensions ??
  //   ([
  //     '.production.min.cjs',
  //     '.development.cjs',
  //     '.browser.mjs',
  //     '.legacy-esm.js',
  //     '.d.ts',
  //     '.d.mts',
  //     'uncheckedindexed.ts',
  //     '.modern.mjs',
  //     'index.js',
  //   ] as const satisfies readonly string[])

  if (
    // !excludedExtensions.some((excludedExtension) =>
    //   oldOutput.absolutePath.endsWith(excludedExtension),
    // )
    // ||
    includedExtensions.length &&
    includedExtensions.some((includedExtension) =>
      oldOutput.absolutePath.endsWith(includedExtension),
    )
  ) {
    const vSCodeDiff = spawnAsync(
      'bash',
      [
        '-lc',
        `(
        code ${disableGpu ? '--disable-gpu' : ''} ${disableLcdText ? '--disable-lcd-text' : ''} ${locale ? `--locale "${locale}"` : ''} --diff ${oldOutput.absolutePosixPath} ${newOutput.absolutePosixPath}
        ) &`,
      ] as const,
      { stdio: 'inherit' } as const,
    )

    return vSCodeDiff
  }

  return undefined
}
