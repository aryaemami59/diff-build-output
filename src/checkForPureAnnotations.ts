import * as console from 'node:console'
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
  index: number,
  verbose = false,
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
    const allMatches = [
      ...newFileContent.matchAll(/\/\*\s?([@#]__PURE__)\s?\*\//gim),
    ]

    const pureAnnotationMatches =
      allMatches.length > 0
        ? allMatches.map((symbolMatch) => symbolMatch[1])
        : null

    if (pureAnnotationMatches) {
      const pureAnnotations = Array.from(pureAnnotationMatches).map(
        (pureAnnotationMatch) => pureAnnotationMatch[0],
      )

      console.info(
        `\n- ${(index + 1).toString()}. Found ${styleText(
          ['bold', 'magentaBright', 'underline'] as const,
          pureAnnotations.length.toString(),
        )} ${styleText(
          ['bold', 'bgWhite', 'whiteBright'] as const,
          pureAnnotationMatches[0],
        )} annotations in entry:\n${styleText(
          ['underline', 'yellowBright', 'italic', 'bold'] as const,
          newOutput.absolutePosixPath,
        )}\n`,
      )

      if (verbose) {
        const matchLocations = allMatches.map((matchedSymbol) => {
          const before = newFileContent.slice(0, matchedSymbol.index)

          const line = before.split('\n').length

          const column = matchedSymbol.index - before.lastIndexOf('\n')

          return { line, column, symbol: matchedSymbol[0] }
        })

        matchLocations.map((matchLocation) => {
          const location = styleText(
            ['underline', 'bold', 'blue'] as const,
            `${newOutput.absolutePosixPath}:${matchLocation.line.toString()}:${matchLocation.column.toString()}`,
          )

          const matchedSymbol = styleText(
            ['bold', 'bgMagenta'] as const,
            pureAnnotationMatches[0],
            // '@__PURE__',
          )

          console.info(`  ${matchedSymbol} at ${location}`)

          return {
            location,
            matchedSymbol,
          }
        })
      }
    }
  }
}
