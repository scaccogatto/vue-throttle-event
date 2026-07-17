import { getCurrentScope, onScopeDispose } from 'vue'

/** {@link useThrottledEvent} options: standard listener options plus `leading`. */
export interface ThrottledEventOptions extends AddEventListenerOptions {
  /**
   * Invoke the handler synchronously (inside the original event dispatch)
   * for the first event of an idle period, so `event.preventDefault()`
   * works reliably. Subsequent events before the next animation frame still
   * coalesce into one trailing call. Defaults to `false`.
   */
  leading?: boolean
}

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
 * @param options - Optional {@link ThrottledEventOptions}, forwarded to
 *                  `addEventListener` (minus `leading`).
 * @returns A `stop` function that removes the listener and cancels any
 *          pending rAF callback.
 */
export function useThrottledEvent<E extends Event = Event>(
  target: EventTarget | null | undefined,
  type: string,
  handler: (event: E) => void,
  options?: ThrottledEventOptions,
): () => void {
  if (!target) {
    return () => {}
  }

  const { leading = false, ...listenerOptions } = options ?? {}

  let rafId: number | null = null
  let latestEvent: E | null = null

  const throttledHandler = (event: Event): void => {
    // Idle (no rAF pending) + leading: dispatch synchronously now instead of
    // queuing, so preventDefault() called inside handler is still effective.
    if (leading && rafId === null) {
      handler(event as E)
    } else {
      latestEvent = event as E
    }
    if (rafId !== null) return

    rafId = requestAnimationFrame(() => {
      rafId = null
      const e = latestEvent
      latestEvent = null
      // e is null when leading already handled the sole event of this
      // window and no further event coalesced before the frame fired.
      if (e !== null) handler(e)
    })
  }

  target.addEventListener(type, throttledHandler, listenerOptions)

  const stop = (): void => {
    target.removeEventListener(type, throttledHandler, listenerOptions)
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
