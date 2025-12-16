import * as path from 'node:path'

export const ROOT_DIRECTORY = path.join(import.meta.dirname, '..')

export const DIFFS_DIRECTORY = path.join(ROOT_DIRECTORY, 'diffs')

export const OUTPUTS_DIRECTORY = path.join(ROOT_DIRECTORY, 'outputs')

export const OLD_OUTPUT_PATH = path.join(OUTPUTS_DIRECTORY, 'old-output')

export const NEW_OUTPUT_PATH = path.join(OUTPUTS_DIRECTORY, 'new-output')
