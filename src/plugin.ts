import type { App } from 'vue'
import { useThrottledEvent } from './composable'

// Augment Vue's ComponentCustomProperties so `this.$throttle` is typed
// in all Options API components when the plugin is installed.
declare module 'vue' {
  interface ComponentCustomProperties {
    $throttle: typeof useThrottledEvent
  }
}

/**
 * Optional Vue 3 plugin — installs `$throttle` on globalProperties for
 * Options API components that cannot use composables directly.
 *
 * Usage:
 * ```ts
 * import { createApp } from 'vue'
 * import { VueThrottleEventPlugin } from 'vue-throttle-event'
 *
 * createApp(App).use(VueThrottleEventPlugin).mount('#app')
 * ```
 *
 * Then in any component:
 * ```ts
 * mounted() {
 *   this._stopScroll = this.$throttle(window, 'scroll', this.onScroll)
 * },
 * beforeUnmount() {
 *   this._stopScroll?.()
 * }
 * ```
 */
const VueThrottleEventPlugin = {
  install(app: App): void {
    app.config.globalProperties.$throttle = useThrottledEvent
  },
}

export { VueThrottleEventPlugin }
