var Modal = require('./components/modal');
var uid = require('../shared/util/uid');
var extend = require('extend');

var scriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
})();

window.AssetPicker = require('../shared/util/createClass')({
    construct: function(options) {
        options = extend(
            true,
            {
                picker: {
                    selector: '[rel="assetpicker"]',
                    modal: {
                        src: null
                    }
                }
            },
            options || {}
        );
        if (!options.picker.modal.src) {
            options.picker.modal.src = scriptURL.split('/').slice(0, -3).join('/') + '/';
        }
        if (options.picker.modal.src.match(/^https?:\/\/localhost/) || document.location.hostname === 'localhost') {
            options.picker.modal.src += '?' + uid();
        }

        this.options = options;
        this.modal = null;
        this.element = null;
        this._onPickedCallback = null;

        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    },
    init: function() {
        this.modal = new Modal(this.options.picker.modal);
        this.modal.messaging.registerServer('picker', this);
        document.querySelectorAll(this.options.picker.selector).forEach(this.initInput.bind(this));
    },
    initInput: function (element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            this.element = element;
            this.modal.open();
        }.bind(this));
    },
    getConfig: function() {
        return this.options;
    },
    onPicked: function(callback) {
        this._onPickedCallback = callback;
    },
    picked: function(picked) {
        var targetSelector = this.element.getAttribute('data-target');
        var inputName = this.element.getAttribute('data-name');
        if (targetSelector || inputName) {
            var stringified = JSON.stringify(picked);
            if (targetSelector) {
                var area = document.createElement('textarea');
                area.innerText = stringified;
                var escaped = area.innerHTML;
                document.querySelectorAll(targetSelector).forEach(function(target) {
                    if (target.tagName === 'input') {
                        target.setAttribute('value', stringified);
                    } else {
                        target.innerHTML = escaped;
                    }
                });
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
