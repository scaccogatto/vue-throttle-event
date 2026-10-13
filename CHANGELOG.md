# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `useThrottledEvent` infers the event type from the event name on `Window`,
  `Document` and `HTMLElement` targets (`'mousemove'` gives `MouseEvent`).
  An explicit type argument and the `Event` fallback for custom event names
  keep working.
- `vue-throttle-event/package.json` is exported.

### Changed

- `peerDependencies.vue` is now `^3.2.0` (was `^3.0.0`). Vue 3.0 and 3.1 never
  worked: they lack `getCurrentScope`/`onScopeDispose`, so the first call
  threw. CI now also runs the tests against Vue 3.2.0.
- `engines.node` is set to `>=24`, the version CI tests.
- `homepage` points at the live demo instead of the npm page.

### Fixed

- Type declarations resolve under `moduleResolution: node16`/`nodenext`. The
  types are now a single bundled file with no relative imports, shipped as
  `index.d.ts` for `import` and `index.d.cts` for `require`, with `types`
  first in each `exports` condition. CJS consumers no longer get ESM-typed
  declarations.

## [3.1.0] – 2026-07-17

### Added

- `leading` option for `useThrottledEvent`: when `true`, the first event of an
  idle period invokes the handler synchronously (inside the original
  dispatch), so `event.preventDefault()` works. Subsequent events before the
  next frame still coalesce into one trailing call. Defaults to `false`
  (no behaviour change).

## [3.0.0] – 2026-06-28

### Breaking changes

- **Removed `VueThrottleEventPlugin` export.** The `$throttle` globalProperties
  plugin was ceremony over the composable. Options API users: import
  `useThrottledEvent` directly from `vue-throttle-event`.

### Changed

- CI: single Node 20 LTS (was [20, 22] matrix).

### Note

- npm `2.0.1` had already shipped the composable-only build; `3.0.0` formalizes the break with a correct major version.

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
