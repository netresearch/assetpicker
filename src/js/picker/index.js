var Modal = require('./components/modal');
var UI = require('./components/ui');
var uid = require('../shared/util/uid');
var extend = require('extend');

var distUrl = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src.split('/').slice(0, -2).join('/');
})();

module.exports = require('../shared/util/createClass')({
    construct: function(config, options) {
        this.setConfig(config);
        options = extend(
            true,
            {
                distUrl: distUrl,
                selector: '[rel="assetpicker"]',
                modal: {
                    src: null
                },
                ui: {
                    enabled: true
                }
            },
            options || {}
        );
        if (!options.modal.src) {
            options.modal.src = options.distUrl + '/index.html';
        }
        if (options.modal.src.match(/^https?:\/\/localhost/) || document.location.hostname === 'localhost') {
            options.modal.src += '?' + uid();
        }

        this.pickConfig = {};
        this.options = options;
        this.modal = null;
        this.element = null;
        this.uis = [];

        this._memoryEvents = {
            'ready': null
        };
        this._callbacks = {};

        this.on('ready', function () {
            this.modal.modal.className += ' assetpicker-ready'
        });
        this.on('resize', function (maximize) {
            this.modal[maximize ? 'maximize' : 'minimize']();
        });

        document.addEventListener('DOMContentLoaded', function () {
            var inputs = document.querySelectorAll(this.options.selector);
            for (var i = 0, l = inputs.length; i < l; i++) {
                this.register(inputs[i]);
            }
        }.bind(this));
    },
    getOrigin: function () {
        return document.location.origin;
    },
    getDistUrl: function () {
        return this.options.distUrl;
    },
    on: function (event, callback) {
        if (!this._callbacks.hasOwnProperty(event)) {
            this._callbacks[event] = [];
        }
        this._callbacks[event].push(callback);
        if (this._memoryEvents[event]) {
            callback.apply(this, this._memoryEvents[event]);
        }
        return this;
    },
    _trigger: function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (this._callbacks[event]) {
            this._callbacks[event].forEach(function (callback) {
                return callback.apply(this, args);
            }.bind(this));
        }
        if (this._memoryEvents.hasOwnProperty(event)) {
            this._memoryEvents[event] = args;
        }
    },
    register: function (element) {
        if (element.hasAttribute('data-assetpicker')) {
            return;
        }
        element.setAttribute('data-assetpicker', 1);
        if (element.hasAttribute('data-ui') || this.options.ui && this.options.ui.enabled) {
            this.uis.push(new UI(element, this));
        }
        element.addEventListener('click', function (event) {
            event.preventDefault();
            this.open(element);
        }.bind(this));
    },
    _getPickConfig: function (element) {
        var getSplitAttr = function (attr) {
            var value = element.getAttribute(attr);
            return value.length ? value.split(',') : []
        };
        return extend({}, this.config.pick, {
            limit: element.hasAttribute('data-limit') ? parseInt(element.getAttribute('data-limit')) : undefined,
            types: element.hasAttribute('data-types') ? getSplitAttr('data-types') : undefined,
            extensions: element.hasAttribute('data-ext') ? getSplitAttr('data-ext') : undefined
        });
    },
    getUi: function (element) {
        for (var i = 0, l = this.uis.length; i < l; i++) {
            if (this.uis[i].element === element) {
                return this.uis[i];
            }
        }
    },
    open: function (options) {
        if (// http://stackoverflow.com/a/384380, options is a HTMLElement
            typeof HTMLElement === "object" && options instanceof HTMLElement //DOM2
            || options && typeof options === "object" && options !== null && options.nodeType === 1 && typeof options.nodeName==="string") {

            this.element = options;
            this.pickConfig = this._getPickConfig(options);
        } else {
            this.element = undefined;
            this.pickConfig = extend({}, this.config.pick, options);
        }
        if (!this.modal) {
            this.modal = new Modal(this.options.modal);
            this.modal.messaging.registerServer('picker', this);
            this.on(
                'ready',
                function () {
                    this.modal.messaging.call('app.setConfig', {pick: this.pickConfig})
                }
            );
        } else {
            try {
                // When this fails, it likely means the app is not ready yet and above ready listener will handle this
                this.modal.messaging.call('app.setConfig', {pick: this.pickConfig});
            } catch (e) {}
        }
        this.modal.open();
    },
    getConfig: function() {
        return this.config;
    },
    setConfig: function (config) {
        this.config = extend(
            true,
            {
                pick: {
                    limit: 1,
                    types: ['file'],
                    extensions: []
                }
            },
            config
        );
        if (this.modal) {
            picker.modal.messaging.call('app.setConfig', this.config);
        }
    },
    pick: function(picked) {
        if (this.element) {
            var tagName = this.element.tagName.toLowerCase();
            if (tagName === 'input' && this.element.getAttribute('type') === 'button' || tagName === 'button') {
                this.element.setAttribute('value', picked ? JSON.stringify(picked) : '');
            }
        }
        this._trigger('pick', picked);
        if (this.modal) {
            this.modal.close();
        }
    }
});
