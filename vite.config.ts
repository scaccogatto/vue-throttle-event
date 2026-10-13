import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'VueThrottleEvent',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'vue-throttle-event.js' : 'vue-throttle-event.cjs',
    },
    rolldownOptions: {
      external: ['vue'],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      // Roll the declarations up into one self-contained file with no
      // relative imports. It is written to package.json `types`
      // (dist/index.d.cts, for the CJS entry), then copied to dist/index.d.ts
      // for the ESM entry, so Node16/NodeNext resolution sees the right
      // module format for each condition.
      bundleTypes: true,
      afterBuild: () =>
        copyFile(
          resolve(import.meta.dirname, 'dist/index.d.cts'),
          resolve(import.meta.dirname, 'dist/index.d.ts'),
        ),
      // Library sources are pure TS. Without this, unplugin-dts finds
      // demo/App.vue while scanning the root and switches to the Vue
      // processor, which needs @vue/language-core.
      processor: 'ts',
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      include: ['src'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
