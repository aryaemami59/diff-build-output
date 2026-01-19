import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

const tsdownConfig = defineConfig({
  attw: { enabled: true },
  clean: false,
  dts: { enabled: true, resolver: 'tsc' },
  entry: ['src/index.ts'],
  failOnWarn: true,
  fixedExtension: false,
  format: ['cjs', 'esm'],
  name: packageJson.name,
  publint: { enabled: true, pack: false, strict: true },
  sourcemap: true,
  target: ['esnext'],
  treeshake: { moduleSideEffects: false },
  tsconfig: 'tsconfig.build.json',
})

export default tsdownConfig
