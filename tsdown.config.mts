import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

const tsdownConfig = defineConfig({
  clean: false,
  dts: true,
  entry: ['src/index.ts'],
  fixedExtension: false,
  format: ['cjs', 'esm'],
  name: packageJson.name,
  sourcemap: true,
  target: ['esnext'],
  treeshake: { moduleSideEffects: false },
  tsconfig: 'tsconfig.build.json',
})

export default tsdownConfig
