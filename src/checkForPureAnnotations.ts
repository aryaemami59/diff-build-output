import { styleText } from 'node:util'
import type { ContentsInfo } from './checkForDuplicateSymbols.ts'
import type { DistributedOmit, LiteralUnion, Simplify } from './typeHelpers.ts'

// type JsExtensions = LiteralUnion<
//   | '.browser.mjs'
//   | '.cjs'
//   | '.development.cjs'
//   | '.js'
//   | '.legacy-esm.js'
//   | '.mjs'
//   | '.modern.mjs'
//   | '.production.min.cjs',
//   `${string}.${'c' | '' | 'm'}js`
// >

export type CheckForPureAnnotationsOptions = Simplify<
  {
    /**
     * js extensions to check for pure annotations.
     *
     * @default ['.cjs', '.js', '.mjs']
     */
    readonly jsExtensions?: readonly LiteralUnion<
      | `.${'c' | '' | 'm'}js`
      | `${'index' | '.legacy-esm'}.js`
      | `.${'browser' | 'modern'}.mjs`
      | `.${'development' | 'production.min'}.cjs`,
      `${string}.${'c' | '' | 'm'}js`
    >[]
    /**
     * The content of the new file.
     */
    readonly newFileContent: string
  } & DistributedOmit<ContentsInfo, 'relativePath' | 'relativePosixPath'>
>

export const checkForPureAnnotations = (
  checkForPureAnnotationsOptions: CheckForPureAnnotationsOptions,
): void => {
  const { newFileContent, newOutput, oldOutput } =
    checkForPureAnnotationsOptions

  const jsExtensions = checkForPureAnnotationsOptions.jsExtensions?.length
    ? checkForPureAnnotationsOptions.jsExtensions
    : ([
        '.cjs',
        '.js',
        '.mjs',
      ] as const satisfies CheckForPureAnnotationsOptions['jsExtensions'])

  if (
    jsExtensions.some((extension) => oldOutput.absolutePath.endsWith(extension))
  ) {
    const pureAnnotationMatches = newFileContent.match(
      /\/\*\s?[@#]__PURE__\s?\*\//g,
    )

    if (pureAnnotationMatches) {
      const pureAnnotations = Array.from(pureAnnotationMatches).map(
        (pureAnnotationMatch) => pureAnnotationMatch[0],
      )

      console.info(
        `\nFound ${styleText(['bold', 'magentaBright', 'underline'], pureAnnotations.length.toString())} ${styleText(['bold', 'bgWhite', 'whiteBright'], '@__PURE__')} annotations in entry:\n${styleText(['underline', 'yellowBright', 'italic', 'bold'], newOutput.absolutePosixPath)}`,
      )
    }
  }
}
