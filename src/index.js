const VueThrottleEvent = {
  install (Vue) {
    // define the main instance function
    Vue.prototype.$throttle = VueThrottleEvent._throttle
  },
  _throttle (type, name, obj) {
    obj = obj || this.$el
    let running = false
    let func = () => {
      if (running) return

      running = true
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name))
        running = false
      })
    }

    obj.addEventListener(type, func)
  }
}

export default VueThrottleEvent

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueThrottleEvent)
}
