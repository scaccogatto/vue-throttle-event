import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useThrottledEvent } from '../src/composable'

describe('useThrottledEvent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ─── rAF throttling behaviour ─────────────────────────────────────────

  it('does not call the handler synchronously when events fire', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    useThrottledEvent(target, 'scroll', handler)

    target.dispatchEvent(new Event('scroll'))
    target.dispatchEvent(new Event('scroll'))
    target.dispatchEvent(new Event('scroll'))

    expect(handler).not.toHaveBeenCalled()
  })

  it('calls the handler exactly once per animation frame regardless of burst size', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    useThrottledEvent(target, 'scroll', handler)

    target.dispatchEvent(new Event('scroll'))
    target.dispatchEvent(new Event('scroll'))
    target.dispatchEvent(new Event('scroll'))

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('passes the most-recent event to the handler', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    useThrottledEvent(target, 'custom', handler)

    const e1 = new CustomEvent('custom', { detail: 1 })
    const e2 = new CustomEvent('custom', { detail: 2 })
    target.dispatchEvent(e1)
    target.dispatchEvent(e2)

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(e2)
  })

  it('allows a fresh rAF batch after the first frame resolves', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    useThrottledEvent(target, 'scroll', handler)

    target.dispatchEvent(new Event('scroll'))
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)

    target.dispatchEvent(new Event('scroll'))
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('does not call the handler when no event fires before the frame', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    useThrottledEvent(target, 'scroll', handler)

    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  // ─── stop() ──────────────────────────────────────────────────────────

  it('stop() cancels a pending rAF so the handler is never called', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    const stop = useThrottledEvent(target, 'scroll', handler)

    target.dispatchEvent(new Event('scroll'))
    stop()

    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('stop() removes the listener so future events are ignored', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    const stop = useThrottledEvent(target, 'scroll', handler)

    stop()

    target.dispatchEvent(new Event('scroll'))
    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('stop() is safe to call multiple times', () => {
    const handler = vi.fn()
    const target = new EventTarget()
    const stop = useThrottledEvent(target, 'scroll', handler)

    expect(() => {
      stop()
      stop()
    }).not.toThrow()
  })

  // ─── null / undefined target ──────────────────────────────────────────

  it('returns a no-op stop function when target is null', () => {
    const handler = vi.fn()
    const stop = useThrottledEvent(null, 'scroll', handler)

    expect(typeof stop).toBe('function')
    expect(() => stop()).not.toThrow()
  })

  it('returns a no-op stop function when target is undefined', () => {
    const handler = vi.fn()
    const stop = useThrottledEvent(undefined, 'scroll', handler)

    expect(typeof stop).toBe('function')
    expect(() => stop()).not.toThrow()
  })

  // ─── Vue scope auto-dispose ───────────────────────────────────────────

  it('auto-disposes when the enclosing Vue effect scope stops', () => {
    const handler = vi.fn()
    const target = new EventTarget()

    const scope = effectScope()
    scope.run(() => {
      useThrottledEvent(target, 'scroll', handler)
    })

    // Dispose the scope — should tear down the listener
    scope.stop()

    target.dispatchEvent(new Event('scroll'))
    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('works outside a Vue scope (no auto-dispose, no error)', () => {
    const handler = vi.fn()
    const target = new EventTarget()

    // Called outside any effectScope — getCurrentScope() returns undefined
    let stop: (() => void) | undefined
    expect(() => {
      stop = useThrottledEvent(target, 'scroll', handler)
    }).not.toThrow()

    target.dispatchEvent(new Event('scroll'))
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)

    stop!()
  })

  // ─── Generic type parameter ───────────────────────────────────────────

  it('preserves the generic event type for the handler', () => {
    const handler = vi.fn<(event: MouseEvent) => void>()
    const target = new EventTarget()
    useThrottledEvent<MouseEvent>(target, 'click', handler)

    const clickEvent = new MouseEvent('click', { bubbles: true })
    target.dispatchEvent(clickEvent)
    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalledWith(clickEvent)
  })
})
