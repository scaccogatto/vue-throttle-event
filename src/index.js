const VueThrottleEvent = {
  install (Vue) {
    // define the main instance function
    Vue.prototype.$throttle = VueThrottleEvent._throttle
  },
  _throttle (type, name, obj) {
    obj = obj || this.$el
    let running = false

    // define the async function
    let func = () => {
      if (running) return

      // now is running
      running = true
      window.requestAnimationFrame(() => {
        obj.dispatchEvent(new window.CustomEvent(name))
        running = false
      })
    }

    // define the classic event
    obj.addEventListener(type, func)
  }
}

export default VueThrottleEvent

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueThrottleEvent)
}
