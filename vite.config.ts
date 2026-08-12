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
      // Library sources are pure TS. Without this, unplugin-dts finds
      // demo/App.vue while scanning the root and switches to the Vue
      // processor, which needs @vue/language-core.
      processor: 'ts',
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
