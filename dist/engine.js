'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine = function () {
  function Engine() {
    var _this2 = this;

    _classCallCheck(this, Engine);

    this.subscribes = {};
    this.beforeOpen = [];
    this.Version = '0.0.1';

    this.ws = new WebSocket('ws://localhost:8000/apps');

    var _this = this;
    this.ws.onopen = function (ev) {
      console.log('[ENGINE:ONOPEN]');
      _this2.beforeOpen.forEach(function (msg) {
        console.log('[ENGINE:SEND_AFTER_ONOPEN]', msg);
        this.ws.send(JSON.stringify(msg));
      }, _this2);
    };

    this.ws.onmessage = function (ev) {
      var dataObj = JSON.parse(ev.data);
      console.log('[ENGINE:ONMESSAGE]', dataObj.Service, ev.data);
      var key = _this2.createSubscribeKey(dataObj);
      var callbacks = _this.subscribes[key];
      if (callbacks !== undefined && callbacks !== null) {
        callbacks.forEach(function (callback) {
          callback(dataObj);
        }, _this2);
      }
    };

    this.ws.onerror = function (ev) {
      console.log('[ENGINE:ONERROR]', ev);
      alert('系统出现异常，请退出！');
    };
  }

  _createClass(Engine, [{
    key: 'install',
    value: function install(Vue, options) {
      // 1. 添加全局方法或属性
      Vue.prototype.$engine = this;
    }
  }, {
    key: 'subscribe',
    value: function subscribe(service, callback) {
      var key = this.createSubscribeKey({
        Service: service
      });
      if (this.subscribes[key] === undefined || this.subscribes[key] === null) {
        this.subscribes[key] = [];
      }
      this.subscribes[key].push(callback);
      console.log('[ENGINE:SUBSCRIBE]', service);
    }
  }, {
    key: 'call',
    value: function call(msg, callback) {
      if (typeof callback === 'function') {
        this.subscribe(msg.Service, callback);
      }
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log('[ENGINE:CALL]', msg);
        this.ws.send(JSON.stringify(msg));
      } else {
        console.log('[ENGINE:SAVE_BEFORE_OPENED]', msg);
        this.beforeOpen.push(msg);
      }
    }
  }, {
    key: 'createSubscribeKey',
    value: function createSubscribeKey(msg) {
      var path = msg.Service;
      path = path.replace(/\./g, '_');
      return path;
    }

    // ----------------------------------------quick services--------------------------------------------//

  }, {
    key: 'msgAlert',
    value: function msgAlert(msgContent, callback) {
      this.call({
        Service: 'ZeroRoo.Docker.Cores.Services.MessageAlert',
        Data: msgContent
      }, function (res) {
        if (callback != null) {
          callback(res);
        }
      });
    }
  }]);

  return Engine;
}();

exports.default = new Engine();