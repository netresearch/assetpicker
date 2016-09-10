var Modal = require('./components/modal');

var scriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
})();

var AssetPicker = require('./util/createClass')({
    construct: function(options) {
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
        // TODO: extend(this.options, options);
        if (!this.options.modal.src) {
            this.options.modal.src = scriptURL.split('/').slice(0, -3).join('/');
        }
    },
    modal: null,
    options: {
        app: {
        },
        input: {
            selector: '[rel="assetpicker"]'
        },
        modal: {
            src: null
        }
    },
    trustedOrigin: null,
    init: function() {
        var matches = this.options.modal.src.match(/^http:\/\/[^\/]+/);
        this.trustedOrigin = matches ? matches[0] : document.location.origin;
        this.modal = new Modal(this.options.modal);
        document.querySelectorAll(this.options.input.selector).forEach(this.initInput.bind(this));

        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function(e) {
            var origin = e.origin || e.originalEvent.origin;
            if (origin === this.trustedOrigin) {
                this.handleMessageFromApp(e.data);
            }
        }.bind(this), false);
    },
    initInput: function (element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            this.modal.open();
        }.bind(this));
    },
    handleMessageFromApp: function(message) {
        if (message === 'cancel') {
            this.modal.close();
        }
    }
});

window.AssetPicker = new AssetPicker();
