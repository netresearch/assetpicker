var Modal = require('./components/modal');
var uid = require('../shared/util/uid');
var extend = require('extend');

var scriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
})();

window.AssetPicker = require('../shared/util/createClass')({
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
        this._onPickedCallback = null;
        this._appReady = false;
        this._onAppReadyCallback = null;

        document.addEventListener('DOMContentLoaded', this._init.bind(this));
    },
    _init: function() {
        this.modal = new Modal(this.options.modal);
        this.modal.messaging.registerServer('picker', this);
        this.modal.messaging.registerServer('app', {isReady: this._onAppReady.bind(this)});
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
            this._onAppReady(function () {
                this.modal.messaging.call('app.setPickConfig', {
                    limit: element.hasAttribute('data-limit') ? parseInt(element.getAttribute('data-limit')) : 1,
                    types: element.hasAttribute('data-types') ? element.getAttribute('data-types').split(',') : ['file'],
                    extensions: element.hasAttribute('data-ext') ? element.getAttribute('data-ext').split(',') : []
                });
            }.bind(this));
        }.bind(this));
    },
    _onAppReady: function (callback) {
        if (typeof callback === 'function') {
            if (this._appReady) {
                callback();
            } else {
                this._onAppReadyCallback = callback;
            }
        } else {
            this.modal.modal.className += ' assetpicker-ready';
            this._appReady = true;
            if (this._onAppReadyCallback) {
                this._onAppReadyCallback();
                delete this._onAppReadyCallback;
            }
        }
    },
    getConfig: function() {
        return this.config;
    },
    onPick: function(callback) {
        this._onPickedCallback = callback;
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
        if (this._onPickedCallback) {
            this._onPickedCallback(picked, this);
        }
        this.modal.close();
    }
});
