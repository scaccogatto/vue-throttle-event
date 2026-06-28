import { getCurrentScope, onScopeDispose } from 'vue'

/**
 * Attach an rAF-throttled event listener to a DOM target.
 *
 * Multiple events fired before the next animation frame collapse into a
 * single handler call with the most-recent event. The listener is
 * auto-removed when the enclosing Vue effect scope is disposed, or when
 * you call the returned `stop` function.
 *
 * @param target  - The DOM EventTarget (Window, Element, …). Pass null/
 *                  undefined to get a no-op stop function (useful when
 *                  the target may not exist yet).
 * @param type    - The event type string (e.g. 'scroll', 'mousemove').
 * @param handler - Called once per animation frame with the latest event.
 * @param options - Optional AddEventListenerOptions forwarded verbatim.
 * @returns A `stop` function that removes the listener and cancels any
 *          pending rAF callback.
 */
export function useThrottledEvent<E extends Event = Event>(
  target: EventTarget | null | undefined,
  type: string,
  handler: (event: E) => void,
  options?: AddEventListenerOptions,
): () => void {
  if (!target) {
    return () => {}
  }

  let rafId: number | null = null
  let latestEvent: E | null = null

  const throttledHandler = (event: Event): void => {
    latestEvent = event as E
    if (rafId !== null) return

    rafId = requestAnimationFrame(() => {
      rafId = null
      const e = latestEvent
      latestEvent = null
      // e is always set here: throttledHandler assigns before scheduling rAF
      if (e !== null) handler(e)
    })
  }

  target.addEventListener(type, throttledHandler, options)

  const stop = (): void => {
    target.removeEventListener(type, throttledHandler, options)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    latestEvent = null
  }

  // Auto-cleanup when used inside a Vue component / effect scope
  if (getCurrentScope()) {
    onScopeDispose(stop)
  }

  return stop
}
