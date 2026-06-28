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
      insertTypesEntry: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
