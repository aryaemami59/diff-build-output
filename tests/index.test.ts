import { generateDiffReports } from 'diff-build-output'
import nodeAssert from 'node:assert'
import nodeAssertStrict from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('generateDiffReports', () => {
  it('should be a function', async () => {
    nodeAssert.strictEqual(
      typeof generateDiffReports,
      'function',
      'generateDiffReports should be a function',
    )

    await nodeAssertStrict.doesNotReject(async () => {
      await generateDiffReports({
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
