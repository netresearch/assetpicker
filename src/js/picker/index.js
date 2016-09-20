var Modal = require('./components/modal');
var uid = require('../shared/util/uid');
var extend = require('extend');

var scriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
})();

module.exports = require('../shared/util/createClass')({
    construct: function(config, options) {
        options = extend(
            true,
            {
                selector: '[rel="assetpicker"]',
                modal: {
                    src: null
                }
            },
            options || {}
        );
        if (!options.modal.src) {
            options.modal.src = scriptURL.split('/').slice(0, -3).join('/') + '/';
        }
        if (options.modal.src.match(/^https?:\/\/localhost/) || document.location.hostname === 'localhost') {
            options.modal.src += '?' + uid();
        }

        this.config = config || {};
        this.options = options;
        this.modal = null;
        this.element = null;

        this._memoryEvents = {
            'ready': null
        };
        this._callbacks = {};

        this.on('ready', function () {
            this.modal.modal.className += ' assetpicker-ready'
        });
        this.on('resize', function (maximize) {
            this.modal[maximize ? 'addClass' : 'removeClass']('assetpicker-maximized');
        });

        document.addEventListener('DOMContentLoaded', this._init.bind(this));
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
    _init: function() {
        this.modal = new Modal(this.options.modal);
        this.modal.messaging.registerServer('picker', this);
        var inputs = document.querySelectorAll(this.options.selector);
        for (var i = 0, l = inputs.length; i < l; i++) {
            this._initInput(inputs[i]);
        }
    },
    _initInput: function (element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            this.element = element;
            this.modal.open();
            this.on(
                'ready',
                function () {
                    this.modal.messaging.call('app.setPickConfig', {
                        limit: element.hasAttribute('data-limit') ? parseInt(element.getAttribute('data-limit')) : 1,
                        types: element.hasAttribute('data-types') ? element.getAttribute('data-types').split(',') : ['file'],
                        extensions: element.hasAttribute('data-ext') ? element.getAttribute('data-ext').split(',') : []
                    })
                }
            );
        }.bind(this));
    },
    getConfig: function() {
        return this.config;
    },
    pick: function(picked) {
        var targetSelector = this.element.getAttribute('data-target');
        var inputName = this.element.getAttribute('data-name');
        if (targetSelector || inputName) {
            var stringified = JSON.stringify(picked);
            if (targetSelector) {
                var area = document.createElement('textarea');
                area.innerText = stringified;
                var escaped = area.innerHTML;
                var targets = document.querySelectorAll(targetSelector);
                for (var i = 0, l = targets.length; i < l; i++) {
                    if (targets[i].tagName === 'input') {
                        targets[i].setAttribute('value', stringified);
                    } else {
                        targets[i].innerHTML = escaped;
                    }
                }
            }
            if (inputName) {
                var inputElement = document.createElement('input');
                inputElement.setAttribute('type', 'hidden');
                inputElement.setAttribute('name', inputName);
                inputElement.setAttribute('value', stringified);
                this.element.parentNode.insertBefore(inputElement, this.element);
            }
        }
        this._trigger('pick', picked);
        this.modal.close();
    }
});
