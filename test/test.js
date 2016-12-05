const assert = require('assert')
const jsdom = require('mocha-jsdom')

const VueThrottleEvent = require('../dist/vue-throttle-event.js').default

describe('VueThrottleEvent', () => {
  // DOM teardown
  jsdom()

  let Vue

  beforeEach (() => {
    Vue = { prototype: {} }
  })

  describe('install', () => {
    it('should set the $throttle method correctly', () => {
      VueThrottleEvent.install(Vue)
      assert.equal(typeof Vue.prototype.$throttle, 'function')
    })
  })

  describe('_throttle', () => {
    it('should call a \'test-throttled-event\' on next animation frame', function(done) {
      // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

      // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

      // MIT license

      (function() {
          var lastTime = 0;
          var vendors = ['ms', 'moz', 'webkit', 'o'];
          for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
              window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
              window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                         || window[vendors[x]+'CancelRequestAnimationFrame'];
          }

          if (!window.requestAnimationFrame)
              window.requestAnimationFrame = function(callback, element) {
                  var currTime = new Date().getTime();
                  var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                  var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                  lastTime = currTime + timeToCall;
                  return id;
              };

          if (!window.cancelAnimationFrame)
              window.cancelAnimationFrame = function(id) {
                  clearTimeout(id);
              };
      }()); // TODO: move this in an external file, but actually i need it only here

      // set event listener
      window.addEventListener('test-throttled-event', () => { done() })

      // set the throttled event
      VueThrottleEvent._throttle('test-event', 'test-throttled-event', window)

      // dispatch the normal event
      window.dispatchEvent(new window.CustomEvent('test-event'))
      window.requestAnimationFrame(() => {})

      // it should be fired in 500ms or less
      this.timeout(500)
    })

    it('should return a function', () => {
      // set the throttled event
      let func = VueThrottleEvent._throttle('test-event', 'test-throttled-event', window)
      assert.ok(typeof func === 'function')
    })
  })
})
