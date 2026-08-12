# vue-throttle-event

> rAF-throttled DOM event handling for Vue 3

[![npm version](https://img.shields.io/npm/v/vue-throttle-event)](https://www.npmjs.com/package/vue-throttle-event)
[![npm downloads](https://img.shields.io/npm/dm/vue-throttle-event)](https://www.npmjs.com/package/vue-throttle-event)
[![CI](https://github.com/scaccogatto/vue-throttle-event/actions/workflows/ci.yml/badge.svg)](https://github.com/scaccogatto/vue-throttle-event/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live demo](https://scaccogatto.github.io/vue-throttle-event/) — move the mouse and compare a plain listener against the throttled one.

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
| `options` | `ThrottledEventOptions` | Optional. `AddEventListenerOptions` plus `leading` (see below), forwarded to `addEventListener`. |

**Returns** `() => void` — a `stop` function that removes the listener and
cancels any pending rAF. Called automatically on scope dispose when used
inside a Vue component or effect scope.

### Caveat: `preventDefault()`

Your handler runs rAF-throttled — up to one frame after the original event —
so it fires outside that event's synchronous dispatch. Calling
`event.preventDefault()` inside it will **not** reliably cancel the event
(e.g. a throttled `touchmove`/`wheel` handler cannot block scrolling). For
cancelation, attach a separate, non-throttled listener — or use `leading`
below, which gives you a synchronous first call for free.

### `leading` option

```ts
useThrottledEvent(el.value, 'touchmove', (event) => {
  event.preventDefault() // works: this call runs synchronously
}, { leading: true })
```

With `leading: true`, the **first** event of an idle period invokes the
handler synchronously, inside that event's own dispatch — so
`preventDefault()` inside it behaves normally. Further events that arrive
before the next animation frame still coalesce into a single trailing call,
same as the default behaviour. Once the trailing frame fires, the next event
is treated as leading again. Defaults to `false` (unchanged behaviour).

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
