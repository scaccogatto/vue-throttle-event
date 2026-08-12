<script setup lang="ts">
import { computed, ref } from 'vue'
import { useThrottledEvent } from 'vue-throttle-event'

const raw = ref(0)
const throttled = ref(0)
const position = ref({ x: 0, y: 0 })

// Plain listener, for comparison: fires on every single event.
window.addEventListener('mousemove', () => {
  raw.value += 1
})

// Same event, coalesced into one call per animation frame.
useThrottledEvent<MouseEvent>(window, 'mousemove', (event) => {
  throttled.value += 1
  position.value = { x: event.clientX, y: event.clientY }
})

const saved = computed(() =>
  raw.value === 0 ? 0 : Math.round((1 - throttled.value / raw.value) * 100),
)

const reset = () => {
  raw.value = 0
  throttled.value = 0
}
</script>

<template>
  <main>
    <h1>vue-throttle-event</h1>
    <p class="lede">
      Move the mouse. Both counters listen to the same <code>mousemove</code> on
      <code>window</code>: the first with a plain
      <code>addEventListener</code>, the second through
      <code>useThrottledEvent</code>, which collapses every event fired before
      the next animation frame into a single call.
    </p>

    <div class="counters">
      <div class="counter">
        <span class="label">addEventListener</span>
        <strong>{{ raw }}</strong>
      </div>
      <div class="counter accent">
        <span class="label">useThrottledEvent</span>
        <strong>{{ throttled }}</strong>
      </div>
      <div class="counter">
        <span class="label">handler calls saved</span>
        <strong>{{ saved }}%</strong>
      </div>
    </div>

    <p class="pointer">
      last coalesced event: <code>{{ position.x }}, {{ position.y }}</code>
    </p>

    <button type="button" @click="reset">Reset counters</button>

    <h2>The listener cleans up after itself</h2>
    <p>
      Called inside <code>setup()</code>, the listener is removed on scope
      dispose, so unmounting this component needs no
      <code>removeEventListener</code>. The returned <code>stop</code> function
      does the same on demand.
    </p>
  </main>
</template>

<style scoped>
.counters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.counter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}

.counter strong {
  font-family: var(--mono);
  font-size: 1.75rem;
  font-variant-numeric: tabular-nums;
}

.counter.accent strong {
  color: var(--accent);
}

.pointer {
  margin: 0 0 1.5rem;
  color: var(--muted);
}
</style>
