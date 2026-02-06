import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

const tsdownConfig = defineConfig({
  attw: { enabled: false, level: 'error' },
  clean: false,
  // cwd: import.meta.dirname,
  devtools: { clean: false },
  dts: {
    enabled: true,
    // oxc: false,
    resolver: 'tsc',
  },
  entry: ['src/index.ts'],
  failOnWarn: true,
  fixedExtension: false,
  nodeProtocol: true,
  platform: 'node',
  shims: true,
  format: ['cjs', 'es'],
  name: packageJson.name,
  publint: { enabled: false, strict: true },
  sourcemap: true,
  target: ['esnext'],
  treeshake: { moduleSideEffects: false },
  tsconfig: 'tsconfig.build.json',
})

export default tsdownConfig
