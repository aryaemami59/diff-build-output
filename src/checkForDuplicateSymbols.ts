import { styleText } from 'node:util'
import type { DistributedOmit, LiteralUnion, Simplify } from './typeHelpers.ts'

export type OutputInfo = {
  /**
   * The absolute path to the output file.
   */
  readonly absolutePath: string

  /**
   * The absolute POSIX path to the output file.
   */
  readonly absolutePosixPath: string

  /**
   * The relative path to the output file.
   */
  readonly relativePath: string
}

export type ContentsInfo = {
  /**
   * The new output file information.
   */
  readonly newOutput: OutputInfo

  /**
   * The old output file information.
   */
  readonly oldOutput: OutputInfo

  /**
   * The relative path to the old output file.
   */
  readonly relativePath: string

  /**
   * The relative POSIX path to the old output file.
   */
  readonly relativePosixPath: string
}

export type WithEnabled<OptionType> = OptionType extends OptionType
  ? Simplify<
      OptionType & {
        /**
         * Whether to enable the option.
         *
         * @default true
         */
        readonly enabled?: boolean
      }
    >
  : never

export type CheckForDuplicateSymbolsOptions = Simplify<
  {
    /**
     * The file extensions to check for duplicate symbols.
     *
     * @default ['.d.cts', '.d.mts', '.d.ts']
     */
    readonly tsExtensions?: readonly LiteralUnion<
      `.d.${'c' | '' | 'm'}ts` | 'uncheckedindexed.ts',
      `${string}.${'c' | '' | 'm'}ts`
    >[]

    /**
     * The js extensions to check for duplicate symbols.
     */
    readonly jsExtensions?: readonly LiteralUnion<
      | `.${'c' | '' | 'm'}js`
      | `${'index' | '.legacy-esm'}.js`
      | `.${'browser' | 'modern'}.mjs`
      | `.${'development' | 'production.min'}.cjs`,
      `${string}.${'c' | '' | 'm'}js`
    >[]

    /**
     * The content of the new file to check for duplicate symbols.
     */
    readonly newFileContent: string
  } & DistributedOmit<ContentsInfo, 'relativePath' | 'relativePosixPath'>
>

export const checkForDuplicateSymbols = (
  checkForDuplicateSymbolsOptions: CheckForDuplicateSymbolsOptions,
): void => {
  const { newFileContent, oldOutput, newOutput } =
    checkForDuplicateSymbolsOptions

  const jsExtensions = checkForDuplicateSymbolsOptions.jsExtensions?.length
    ? checkForDuplicateSymbolsOptions.jsExtensions
    : ([
        '.cjs',
        '.js',
        '.mjs',
      ] as const satisfies CheckForDuplicateSymbolsOptions['jsExtensions'])

  const tsExtensions = checkForDuplicateSymbolsOptions.tsExtensions?.length
    ? checkForDuplicateSymbolsOptions.tsExtensions
    : ([
        '.d.cts',
        '.d.mts',
        '.d.ts',
      ] as const satisfies CheckForDuplicateSymbolsOptions['tsExtensions'])

  const hasDuplicateSymbols = newFileContent.match(/\w+\$1\b/g)

  if (hasDuplicateSymbols) {
    if (
      tsExtensions.some((includedExtension) =>
        oldOutput.absolutePath.endsWith(includedExtension),
      )
    ) {
      console.error(
        `\nFound duplicated symbols:\n${styleText(
          ['bold', 'blue', 'doubleunderline'],
          hasDuplicateSymbols
            .map(
              (duplicateSymbolName, index) =>
                `${(index + 1).toString()}. ${duplicateSymbolName}`,
            )
            .join('\n'),
        )}\nin entry:\n${styleText(['underline', 'redBright', 'italic', 'bold'], newOutput.absolutePosixPath)}`,
      )
    } else if (
      jsExtensions.some((extension) =>
        oldOutput.absolutePath.endsWith(extension),
      )
    ) {
      console.info(
        `\nFound ${styleText(['bold', 'cyanBright', 'underline'], hasDuplicateSymbols.length.toString())} duplicated symbols in entry:\n${styleText(['underline', 'yellowBright', 'italic', 'bold'], newOutput.absolutePosixPath)}`,
      )
    }
  }
}
