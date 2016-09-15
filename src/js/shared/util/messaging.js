var uid = require('./uid');

module.exports = require('./createClass')({
    construct: function(origin, windowObject) {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function(e) {
            var origin = e.origin || e.originalEvent.origin;
            if (e.source === this.window && origin === this.origin || this.origin === '*') {
                this.handle(e.data);
            }
        }.bind(this), false);

        this.origin = origin;
        this.window = windowObject;
        this.servers = {};
        this._handlers = {};
    },
    registerServer: function (name, object) {
        this.servers[name] = object;
    },
    _createHandler: function() {
        var handler = { callbacks: [] };
        handler.then = function (callback) {
            if (handler.hasOwnProperty('_result')) {
                callback(handler._result);
            } else {
                handler.callbacks.push(callback);
            }
            return handler;
        };
        return handler;
    },
    call: function(method) {
        var arguments = Array.prototype.slice.call(arguments, 1);
        var id = uid(), handler = this._createHandler();
        this._handlers[id] = handler;
        this.window.postMessage({id: id, method: method, arguments: arguments}, this.origin);
        return handler;
    },
    handle: function(message) {
        if (message.method === 'resolve') {
            if (this._handlers[message.id]) {
                var handler = this._handlers[message.id];
                for (var i = 0, l = handler.callbacks.length; i < l; i++) {
                    handler.callbacks[i](message.result);
                }
                handler._result = message.result;
                delete this._handlers[message.id];
            }
        } else {
            var methodPath = message.method.split('.');
            var method = methodPath.pop();
            var target = this.servers;
            while (target && methodPath.length) {
                target = target[methodPath.shift()];
            }
            if (!target || !target[method]) {
                throw 'Unknown method "' + message.method + '"';
            }
            var result = target[method].apply(target, message.arguments);
            var resolve = function(res) {
                // It might occure, that the id is reset, when the target frame is removed
                if (message.id) {
                    this.window.postMessage({method: 'resolve', id: message.id, result: res}, this.origin);
                }
            }.bind(this);
            if (typeof result === 'function') {
                result(resolve);
            } else {
                resolve(result);
            }
        }
    }
});
