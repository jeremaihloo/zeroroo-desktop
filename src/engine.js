
class Engine {
  constructor () {
    this.subscribes = {}
    this.beforeOpen = []
    this.Version = '0.0.1'

    this.ws = new WebSocket('ws://localhost:8000/apps')

    let _this = this
    this.ws.onopen = (ev) => {
      console.log('[ENGINE:ONOPEN]')
      this.beforeOpen.forEach(function (msg) {
        console.log('[ENGINE:SEND_AFTER_ONOPEN]', msg)
        this.ws.send(JSON.stringify(msg))
      }, this)
    }

    this.ws.onmessage = (ev) => {
      let dataObj = JSON.parse(ev.data)
      console.log('[ENGINE:ONMESSAGE]', dataObj.Service, ev.data)
      let key = this.createSubscribeKey(dataObj)
      var callbacks = _this.subscribes[key]
      if (callbacks !== undefined && callbacks !== null) {
        callbacks.forEach(function (callback) {
          callback(dataObj)
        }, this)
      }
    }

    this.ws.onerror = (ev) => {
      console.log('[ENGINE:ONERROR]', ev)
      alert('系统出现异常，请退出！')
    }
  }

  install (Vue, options) {
    // 1. 添加全局方法或属性
    Vue.prototype.$engine = this
  }

  subscribe (service, callback) {
    let key = this.createSubscribeKey({
      Service: service
    })
    if (this.subscribes[key] === undefined || this.subscribes[key] === null) {
      this.subscribes[key] = []
    }
    this.subscribes[key].push(callback)
    console.log('[ENGINE:SUBSCRIBE]', service)
  }

  call (msg, callback) {
    if (typeof (callback) === 'function') {
      this.subscribe(msg.Service, callback)
    }
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('[ENGINE:CALL]', msg)
      this.ws.send(JSON.stringify(msg))
    } else {
      console.log('[ENGINE:SAVE_BEFORE_OPENED]', msg)
      this.beforeOpen.push(msg)
    }
  }

  createSubscribeKey (msg) {
    let path = msg.Service
    path = path.replace(/\./g, '_')
    return path
  }

  // ----------------------------------------quick services--------------------------------------------//
  msgAlert (msgContent, callback) {
    this.call({
      Service: 'ZeroRoo.Docker.Cores.Services.MessageAlert',
      Data: msgContent
    }, res => {
      if (callback != null) {
        callback(res)
      }
    })
  }

}

export default new Engine()
