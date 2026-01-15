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
      await generateDiffReports()
    })
  })
})
