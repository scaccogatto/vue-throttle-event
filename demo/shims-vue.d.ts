// Lets plain TypeScript (typescript-eslint's type-aware program) resolve
// `.vue` imports. vue-tsc resolves the real SFC types and ignores this.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
