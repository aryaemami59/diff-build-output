import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const ROOT_DIRECTORY = path.join(import.meta.dirname, '..')

async function main() {
  const diffsFolder = path.join(ROOT_DIRECTORY, 'diffs')

  const oldOutputPath = path.join(ROOT_DIRECTORY, 'outputs', 'old-output')

  const newOutputPath = path.join(ROOT_DIRECTORY, 'outputs', 'new-output')

  await fs.mkdir(oldOutputPath, {
    recursive: true,
  })

  await fs.mkdir(newOutputPath, {
    recursive: true,
  })

  const oldOutputFilePaths = (
    await fs.readdir(oldOutputPath, {
      encoding: 'utf-8',
      recursive: true,
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isFile())
    .filter((dirent) => !dirent.name.endsWith('.map'))
    .map((dirent) => path.join(dirent.parentPath, dirent.name))

  const newOutputFilePaths = oldOutputFilePaths.map((oldOutputFile) =>
    path.join(
      ROOT_DIRECTORY,
      'outputs',
      'new-output',
      ...path
        .relative(path.join(ROOT_DIRECTORY, 'outputs'), oldOutputFile)
        .split(path.sep)
        .slice(1),
    ),
  )

  const contentsMap = Object.fromEntries(
    oldOutputFilePaths.map(
      (oldOutputFilePath) =>
        [
          path.relative(oldOutputPath, oldOutputFilePath),
          {
            oldContent: oldOutputFilePath,
            newContent: path.join(
              newOutputPath,
              path.relative(oldOutputPath, oldOutputFilePath),
            ),
          },
        ] as const,
    ),
  )

  const diffsMap = Object.fromEntries(
    await Promise.all(
      Object.entries(contentsMap).map(async ([entryFilePath, value]) => {
        const markdownFileBanner = `<details><summary>\n\n# \`${path.posix.join(...entryFilePath.split(path.sep))}\` Summary\n\n</summary>\n\n\`\`\`diff\n`
        const markdownFileFooter = '```\n\n</details>\n'

        const filePath = path.join(diffsFolder, entryFilePath)
        const parentDir = path.dirname(path.join(diffsFolder, entryFilePath))
        await fs.mkdir(parentDir, { recursive: true })

        const markdownFile = `${filePath}.md`
        const writeStream = createWriteStream(markdownFile, {
          encoding: 'utf-8',
        })

        writeStream.write(markdownFileBanner)

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
        const diff = spawn(
          'diff',
          [
            '-udwBbZaE',
            '--suppress-blank-empty',
            '--suppress-common-lines',
            '--strip-trailing-cr',
            path.posix.join(
              ...path.join(oldOutputPath, entryFilePath).split(path.sep),
            ),
            path.posix.join(
              ...path.join(newOutputPath, entryFilePath).split(path.sep),
            ),
          ],
          { stdio: 'pipe' },
        )

        // Pipe diff output into the file, but don't auto-end the file
        diff.stdout.pipe(writeStream, { end: false })

        // Wait for diff to finish producing output
        await new Promise<void>((resolve, reject) => {
          diff.on('error', reject)
          writeStream.on('error', reject)

          // When the diff process is done and its stdout is closed,
          // it's safe to write the footer.
          diff.on('close', () => {
            resolve()
          })
        })

        // Now write the footer and close the file
        writeStream.write(markdownFileFooter)
        writeStream.end()

        // Optionally ensure everything is flushed before continuing
        await new Promise<void>((resolve, reject) => {
          writeStream.on('finish', resolve)
          writeStream.on('error', reject)
        })

        return [entryFilePath, value] as const
      }),
    ),
  )
}

void main()
