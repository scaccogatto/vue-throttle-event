# vue-throttle-event

> rAF-throttled DOM event handling for Vue 3

[![npm version](https://img.shields.io/npm/v/vue-throttle-event)](https://www.npmjs.com/package/vue-throttle-event)
[![CI](https://github.com/scaccogatto/vue-throttle-event/actions/workflows/ci.yml/badge.svg)](https://github.com/scaccogatto/vue-throttle-event/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Collapses high-frequency DOM events (`scroll`, `mousemove`, `resize`, …) into
at most one handler call per animation frame using `requestAnimationFrame`.

## Features

- Zero-dependency composable (Vue peer dep only)
- Auto-cleanup via `onScopeDispose` — no manual teardown in components
- Full TypeScript support with generic event types
- ESM + CJS dual output, tree-shakeable

## Install

```bash
npm install vue-throttle-event
```

## Usage

### Composable (recommended)

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useThrottledEvent } from 'vue-throttle-event'

const scrollY = ref(0)

onMounted(() => {
  // Listener is auto-removed when the component unmounts
  useThrottledEvent(window, 'scroll', () => {
    scrollY.value = window.scrollY
  })
})
</script>
```

### Custom event type

```ts
useThrottledEvent<MouseEvent>(el.value, 'mousemove', (event) => {
  // event is typed as MouseEvent
  console.log(event.clientX, event.clientY)
})
```

### Manual stop

```ts
const stop = useThrottledEvent(window, 'resize', onResize)

// Call later to remove the listener and cancel any pending rAF
stop()
```

## API

### `useThrottledEvent(target, type, handler, options?)`

| Parameter | Type | Description |
|---|---|---|
| `target` | `EventTarget \| null \| undefined` | The DOM target to listen on. `null`/`undefined` returns a no-op. |
| `type` | `string` | Event type (e.g. `'scroll'`). |
| `handler` | `(event: E) => void` | Called once per rAF frame with the **most-recent** event. |
| `options` | `AddEventListenerOptions` | Optional, forwarded to `addEventListener`. |

**Returns** `() => void` — a `stop` function that removes the listener and
cancels any pending rAF. Called automatically on scope dispose when used
inside a Vue component or effect scope.

---

## Migrating from v1 (Vue 2)

v2 is a full rewrite for Vue 3. The public API changed completely.

### Before (v1, Vue 2 Options API)

```js
// main.js
import VueThrottleEvent from 'vue-throttle-event'
Vue.use(VueThrottleEvent)

// Component
created() {
  this.$throttle('scroll', 'scroll-throttled')     // dispatches CustomEvent
  this.$on('scroll-throttled', this.onScroll)
}
```

### After (v2, Vue 3 Composition API)

```ts
import { useThrottledEvent } from 'vue-throttle-event'

onMounted(() => {
  useThrottledEvent(window, 'scroll', onScroll)    // calls handler directly
})
```

Key differences:

| v1 (Vue 2) | v2 (Vue 3) |
|---|---|
| `Vue.use(plugin)` global install required | Import composable directly |
| Re-dispatches a `CustomEvent`; listen with `this.$on` | Calls your handler with the latest `Event` object |
| Targets `vm.$el` by default | You provide the target explicitly |
| Returns the raw listener (for manual `removeEventListener`) | Returns a `stop()` function; auto-removed on scope dispose |

---

## License

MIT © Marco Boffo
