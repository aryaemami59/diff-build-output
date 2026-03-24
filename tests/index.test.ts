import { generateDiffReports } from 'diff-build-output'
import nodeAssert from 'node:assert'
import nodeAssertStrict from 'node:assert/strict'
import { setSourceMapsEnabled } from 'node:process'
import { before, describe, it } from 'node:test'

describe('generateDiffReports', () => {
  before(() => {
    setSourceMapsEnabled(true)
  })

  it('should be a function', async () => {
    nodeAssert.strictEqual(
      typeof generateDiffReports,
      'function',
      'generateDiffReports should be a function',
    )

    await nodeAssertStrict.doesNotReject(async () => {
      await generateDiffReports({
        checkForDuplicateSymbolsOptions: {
          enabled: true,
          jsExtensions: [
            // ".browser.mjs",
            // '.development.cjs',
            // '.legacy-esm.js',
            '.modern.mjs',
          ],
          tsExtensions: [
            // '.d.cts',
            '.d.mts',
            '.d.ts',
          ],
          verbose: true,
        },
        checkForPureAnnotationsOptions: {
          enabled: true,
          jsExtensions: [
            // ".browser.mjs",
            // '.development.cjs',
            // '.legacy-esm.js',
            '.modern.mjs',
          ],
          verbose: true,
        },
        viewVSCodeDiffOptions: {
          enabled: true,
          // TODO: Figure out how to pass these options through CLI.
          includedExtensions: [
            // '.browser.mjs',
            // '.cjs',
            // '.d.cts',
            // '.d.mts',
            '.d.ts',
            // '.development.cjs',
            // '.js',
            // '.legacy-esm.js',
            // '.mjs',
            '.modern.mjs',
            // '.production.min.cjs',
            // 'index.js',
            // 'uncheckedindexed.ts',
          ],
        },
      })
    })
  })
})
