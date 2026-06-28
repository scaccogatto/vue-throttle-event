# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] – 2026-06-28

### Breaking changes

- **Removed `VueThrottleEventPlugin` export.** The `$throttle` globalProperties
  plugin was ceremony over the composable. Options API users: import
  `useThrottledEvent` directly from `vue-throttle-event`.

### Changed

- CI: single Node 20 LTS (was [20, 22] matrix).

---

## [2.0.0] – 2026-06-28

### Breaking changes

- **Vue 3 only.** Vue 2 is no longer supported (EOL Dec 2023).
- **New public API.** The Vue 2 `$throttle` plugin method is replaced by the
  `useThrottledEvent` composable (Composition API) and an optional
  `VueThrottleEventPlugin` for Options API users (see README for migration).
- **Handler called directly.** The composable calls your handler with the
  latest event object instead of re-dispatching a `CustomEvent` on the
  target element.

### Added

- `useThrottledEvent(target, type, handler, options?)` — rAF-throttled event
  composable with automatic cleanup via `onScopeDispose`.
- `VueThrottleEventPlugin` — optional Vue 3 plugin that exposes
  `this.$throttle` on `globalProperties` for Options API components.
- TypeScript types (`.d.ts`) generated with `vite-plugin-dts`.
- ESM + CJS dual output via Vite library mode.
- Vitest test suite with fake timers exercising rAF throttling behaviour
  (fixes #2 — stale PhantomJS test infrastructure).
- GitHub Actions CI on Node 20 and 22.

### Removed

- Webpack 2 build, Babel 6, Mocha 3, jsdom 9, mocha-jsdom (all abandoned).
- Travis CI configuration.
- UMD bundle (use the ESM or CJS build instead).

## [1.5.0] – 2018-03-09

- Final Vue 2 release (unpublished to npm; last published version was 1.4.0).

## [1.4.0] – 2022-06-28

- Last published npm release.
