var extend = require('extend'),
    insertCss = require('insert-css'),
    addClass = function(element, className) {
        if (element.className.split(' ').indexOf(className) === -1) {
            element.className += ' ' + className;
        }
    },
    removeClass = function(element, className) {
        var classNames = element.className.split(' '), newClassNames = [];
        for (var i = 0, l = classNames.length; i < l; i++) {
            if (classNames[i] !== className) {
                newClassNames.push(classNames[i]);
            }
        }
        element.className = newClassNames.join(' ');
    },
    transitionEvent = (function() {
        var el = document.createElement('div');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'otransitionend',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };
        for (var i in transitions) {
            if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                return transitions[i];
            }
        }
    })(),
    hasTransitions = function(element) {
        var css = window.getComputedStyle(element, null);
        var transitionDuration = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];
        var hasTransition = transitionDuration.filter(function (i) {
            if (typeof css[i] === 'string' && css[i].match(/[1-9]/)) {
                return true;
            }
        });
        return hasTransition.length ? true : false;
    },
    Messaging = require('../../../shared/util/messaging');

module.exports = require('../../../shared/util/createClass')({
    construct: function (options) {
        this.options = extend(
            {
                template: require('./index.html'),
                css: require('./index.css'),
                openClassName: 'assetpicker-modal-open',
                src: null,
                messagingServer: null
            },
            options
        );
        this.modal = null;
        this.frame = null;

        var matches = this.options.src.match(/^https?:\/\/[^\/]+/);
        this.messaging = new Messaging(matches ? matches[0] : document.location.origin)
    },
    render: function() {
        if (this.options.css) {
            insertCss(this.options.css);
        }
        var div = document.createElement('div');
        div.innerHTML = this.options.template;
        this.modal = div.children[0];
        this.modal.addEventListener('click', function(event) {
            if (event.target === this.modal) {
                this.close();
            }
        }.bind(this));
        this.frame = this.modal.querySelector('iframe');
        document.body.appendChild(this.modal);
        this._modalClass = this.modal.className;
    },
    open: function() {
        if (!this.modal) {
            this.render();
            var that = this;
            this.frame.src = this.options.src;
            window.setTimeout(function() { that.open(); }, 1);
            return;
        }
        this.messaging.window = this.frame.contentWindow;
        addClass(this.modal, this.options.openClassName);
    },
    _closed: function() {
    },
    close: function() {
        if (transitionEvent && hasTransitions(this.modal)) {
            var closeTransitionHandler = function () {
                this.modal.removeEventListener(transitionEvent, closeTransitionHandler);
                this._closed();
            }.bind(this);
            this.modal.addEventListener(transitionEvent, closeTransitionHandler);
        } else {
            this._closed();
        }
        removeClass(this.modal, this.options.openClassName);
    }
});
