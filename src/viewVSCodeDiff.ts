import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import type { ContentsInfo } from './checkForDuplicateSymbols.ts'
import type { DistributedOmit, LiteralUnion, Simplify } from './typeHelpers.ts'

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
  } & DistributedOmit<ContentsInfo, 'relativePath' | 'relativePosixPath'>
>

export const viewVSCodeDiff = (
  viewVSCodeDiffOptions: ViewVSCodeDiffOptions,
): ChildProcess | undefined => {
  const {
    includedExtensions = [],
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
    const vSCodeDiff = spawn(
      'bash',
      [
        '-c',
        `code --disable-gpu --disable-lcd-text -d ${oldOutput.absolutePosixPath} ${newOutput.absolutePosixPath}`,
      ] as const,
      { stdio: 'inherit' } as const,
    )

    return vSCodeDiff
  }

  return undefined
}
