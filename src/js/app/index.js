var extend = require('extend');
var App = require('./components/app');
var Messaging = require('../shared/util/messaging');

var AssetPickerApp = {
    config: require('./config'),
    create: function (options, readyCallback) {
        var create = function () {
            var app = new App(options);
            if (readyCallback) {
                readyCallback(app);
            }
        }.bind(this);

        if (window.parent && window.parent !== window) {
            if (!options.messaging) {
                options.messaging = new Messaging('*', window.parent);
            }
            options.messaging.call('picker.getConfig').then(function(config) {
                extend(true, AssetPickerApp.config, config);
                create();
            });
        } else {
            create();
        }
    }
};

module.exports = AssetPickerApp;