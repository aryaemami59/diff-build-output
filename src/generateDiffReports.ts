import { createTwoFilesPatch } from 'diff'
import { createWriteStream } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { Options } from 'prettier'
import { format, getFileInfo } from 'prettier'
import type {
  CheckForDuplicateSymbolsOptions,
  ContentsInfo,
  WithEnabled,
} from './checkForDuplicateSymbols.ts'
import { checkForDuplicateSymbols } from './checkForDuplicateSymbols.ts'
import type { CheckForPureAnnotationsOptions } from './checkForPureAnnotations.ts'
import { checkForPureAnnotations } from './checkForPureAnnotations.ts'
import {
  DIFFS_DIRECTORY,
  NEW_OUTPUT_PATH,
  OLD_OUTPUT_PATH,
} from './constants.ts'
import type { DistributedOmit } from './typeHelpers.ts'
import type { ViewVSCodeDiffOptions } from './viewVSCodeDiff.ts'
import { viewVSCodeDiff } from './viewVSCodeDiff.ts'

export type GenerateDiffReportsOptions = {
  checkForDuplicateSymbolsOptions?: WithEnabled<
    DistributedOmit<
      CheckForDuplicateSymbolsOptions,
      'newFileContent' | 'newOutput' | 'oldOutput'
    >
  >
  checkForPureAnnotationsOptions?: WithEnabled<
    DistributedOmit<
      CheckForPureAnnotationsOptions,
      'newFileContent' | 'newOutput' | 'oldOutput'
    >
  >
  viewVSCodeDiffOptions?: WithEnabled<
    DistributedOmit<ViewVSCodeDiffOptions, 'newOutput' | 'oldOutput'>
  >
}

export async function generateDiffReports(
  generateDiffReportsOptions: GenerateDiffReportsOptions = {},
): Promise<void> {
  await fs.mkdir(OLD_OUTPUT_PATH, {
    recursive: true,
  })

  await fs.mkdir(NEW_OUTPUT_PATH, {
    recursive: true,
  })

  const oldOutputFilePaths = (
    await fs.readdir(OLD_OUTPUT_PATH, {
      encoding: 'utf-8',
      recursive: true,
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isFile())
    .filter((dirent) => !dirent.name.endsWith('.map'))
    .map((dirent) => path.join(dirent.parentPath, dirent.name))

  const contentsMap = Object.fromEntries(
    oldOutputFilePaths.map((oldOutputAbsolutePath) => {
      const oldOutputRelativePath = path.relative(
        OLD_OUTPUT_PATH,
        oldOutputAbsolutePath,
      )

      const oldOutputPathParts = oldOutputRelativePath.split(path.sep)

      const newOutputAbsolutePath = path.join(
        NEW_OUTPUT_PATH,
        ...oldOutputPathParts,
      )

      return [
        oldOutputRelativePath,
        {
          relativePath: oldOutputRelativePath,
          relativePosixPath: path.posix.join(...oldOutputPathParts),
          oldOutput: {
            absolutePath: oldOutputAbsolutePath,
            absolutePosixPath: path.posix.join(
              ...oldOutputAbsolutePath.split(path.sep),
            ),
            relativePath: oldOutputRelativePath,
          },
          newOutput: {
            absolutePath: newOutputAbsolutePath,
            absolutePosixPath: path.posix.join(
              ...newOutputAbsolutePath.split(path.sep),
            ),
            relativePath: path.relative(NEW_OUTPUT_PATH, newOutputAbsolutePath),
          },
        },
      ] as const satisfies readonly [
        oldOutputRelativePath: string,
        contentsInfo: ContentsInfo,
      ]
    }),
  )

  const {
    checkForDuplicateSymbolsOptions = {
      enabled: true,
      jsExtensions: ['.modern.mjs'],
      tsExtensions: ['.d.mts', '.d.ts'],
    },
    checkForPureAnnotationsOptions = {
      enabled: true,
      jsExtensions: ['.modern.mjs'],
    },
    viewVSCodeDiffOptions = {
      enabled: true,
      includedExtensions: process.argv.slice(2),
    },
  } = generateDiffReportsOptions

  await Promise.all(
    Object.entries(contentsMap).map(
      async ([entryFilePath, { newOutput, oldOutput, relativePosixPath }]) => {
        const markdownFileBanner = `<details><summary>\n\n# **\`${relativePosixPath}\` Diff**\n\n</summary>\n\n\`\`\`diff\n`
        const markdownFileFooter = '```\n\n</details>\n'

        const filePath = path.join(DIFFS_DIRECTORY, entryFilePath)
        const parentDir = path.dirname(
          path.join(DIFFS_DIRECTORY, entryFilePath),
        )
        await fs.mkdir(parentDir, { recursive: true })

        const markdownFile = `${filePath}.md`
        const writeStream = createWriteStream(markdownFile, {
          encoding: 'utf-8',
        })

        writeStream.write(markdownFileBanner)

        const fileInfoResult = await getFileInfo(oldOutput.absolutePath)

        const prettierOptions = {
          endOfLine: 'lf',
          filepath: oldOutput.absolutePath,
          objectWrap: 'collapse',
          parser: fileInfoResult.inferredParser ?? 'babel',
          printWidth: Number.POSITIVE_INFINITY,
          semi: true,
          singleQuote: true,
        } as const satisfies Options

        const oldFileContent = await format(
          await fs.readFile(oldOutput.absolutePath, {
            encoding: 'utf-8',
          }),
          prettierOptions,
        )

        const newFileContent = await format(
          await fs.readFile(newOutput.absolutePath, {
            encoding: 'utf-8',
          }),
          { ...prettierOptions, filepath: newOutput.absolutePath },
        )

        const twoFilesPatch = createTwoFilesPatch(
          `\`tsup\` ${entryFilePath}`,
          `\`tsdown\` ${entryFilePath}`,
          oldFileContent,
          newFileContent,
          undefined,
          undefined,
          {
            ignoreWhitespace: true,
            stripTrailingCr: true,
            context: 1_000_000,
          },
        )

        // Works well but is super slow.
        // if (oldOutput.absolutePath.endsWith('.d.mts')) {
        //   diffChars(oldFileContent, newFileContent, {
        //     callback(changeObjects) {
        //       const element = changeObjects
        //         .map((e) => {
        //           return e.removed
        //             ? styleText(['bgRed'], e.value, { stream: process.stdout })
        //             : e.added
        //               ? styleText(['bgGreen'], e.value, {
        //                   stream: process.stdout,
        //                 })
        //               : e.value
        //         })
        //         .join('')

        //       console.log(element)
        //     },
        //   })
        // }

        writeStream.write(twoFilesPatch)

        // await fs.writeFile(
        //   markdownFile,
        //   `${markdownFileBanner}${twoFilesPatch}${markdownFileFooter}`,
        //   { encoding: 'utf-8' },
        // )

        // console.dir(parsePatch(twoFilesPatch), { depth: null })

        /**
         * ## **Diff options used:**
         *
         * - [X] **`-u`**, **`-U NUM`**, **`--unified[=NUM]`**   output `NUM` (default `3`) lines of unified context
         * - [X] **`-d`**, **`--minimal`**            try hard to find a smaller set of changes
         * - [X] **`-w`**, **`--ignore-all-space`**          ignore all white space
         * - [X] **`-B`**, **`--ignore-blank-lines`**        ignore changes where lines are all blank
         * - [X] **`-b`**, **`--ignore-space-change`**       ignore changes in the amount of white space
         * - [X] **`-Z`**, **`--ignore-trailing-space`**     ignore white space at line end
         * - [X] **`-a`**, **`--text`**                      treat all files as text
         * - [X] **`-E`**, **`--ignore-tab-expansion`**      ignore changes due to tab expansion
         * - [X] **`--suppress-blank-empty`**    suppress space or tab before empty output lines
         * - [X] **`--suppress-common-lines`**   do not output common lines
         * - [X] **`--strip-trailing-cr`**         strip trailing carriage return on input
         */
        // const diff = spawn(
        //   'diff',
        //   [
        //     '--unified=1000000',
        //     '-dwBbZaE',
        //     '--suppress-blank-empty',
        //     '--suppress-common-lines',
        //     '--strip-trailing-cr',
        //     '--minimal',
        //     path.posix.join(
        //       ...path.join(oldOutputPath, entryFilePath).split(path.sep),
        //     ),
        //     '--label',
        //     `\`tsup\` ${entryFilePath}`,
        //     path.posix.join(
        //       ...path.join(newOutputPath, entryFilePath).split(path.sep),
        //     ),
        //     '--label',
        //     `\`tsdown\` ${entryFilePath}`,
        //   ],
        //   { stdio: 'pipe' },
        // )

        // // Pipe diff output into the file, but don't auto-end the file
        // diff.stdout.pipe(writeStream, { end: false })

        // // Wait for diff to finish producing output
        // await new Promise<void>((resolve, reject) => {
        //   diff.on('error', reject)
        //   writeStream.on('error', reject)

        //   // When the diff process is done and its stdout is closed,
        //   // it's safe to write the footer.
        //   diff.on('close', () => {
        //     resolve()
        //   })
        // })

        // // Now write the footer and close the file
        writeStream.end(markdownFileFooter)

        // // Optionally ensure everything is flushed before continuing
        // await new Promise<void>((resolve, reject) => {
        //   writeStream.on('finish', resolve)
        //   writeStream.on('error', reject)
        // })

        if (viewVSCodeDiffOptions.enabled) {
          viewVSCodeDiff({
            includedExtensions: viewVSCodeDiffOptions.includedExtensions,
            excludedExtensions: viewVSCodeDiffOptions.excludedExtensions,
            newOutput,
            oldOutput,
          })
        }

        if (checkForPureAnnotationsOptions.enabled) {
          checkForPureAnnotations({
            jsExtensions: checkForPureAnnotationsOptions.jsExtensions,
            newFileContent,
            newOutput,
            oldOutput,
          })
        }

        if (checkForDuplicateSymbolsOptions.enabled) {
          checkForDuplicateSymbols({
            jsExtensions: checkForDuplicateSymbolsOptions.jsExtensions,
            tsExtensions: checkForDuplicateSymbolsOptions.tsExtensions,
            newFileContent,
            newOutput,
            oldOutput,
          })
        }
      },
    ),
  )
}
