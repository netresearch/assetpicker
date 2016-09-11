var Vue = require('vue');
Vue.config.debug = true;
Vue.use(require('vue-resource'));

var i18nMixin = require('vue-i18n-mixin');
i18nMixin.methods.t = i18nMixin.methods.translate;

Vue.mixin(i18nMixin);

require('./util');
require('./components/tree');

var messaging;
var config = require('./config');

if (window.parent) {
    var Messaging = require('../shared/util/messaging');
    messaging = new Messaging(window.parent.location.origin, window.parent);
    messaging.call('picker.getConfig').then(function(configOverride) {
        require('extend')(true, config, configOverride);
        create();
    });
} else {
    config.storages = {
        entermediaDB: {
            adapter: 'entermediadb',
            url: 'http://em9.entermediadb.org/openinstitute',
            proxy: true
        },
        github: {
            adapter: 'github',
            username: 'netresearch',
            repository: 'assetpicker'
        }
    };
    create();
}

function create() {
    new Vue({
        el: '#app',
        data: function () {
            return {
                locale: 'de',
                config: config,
                sword: null,
                search: null,
                selection: require('./model/selection')
            }
        },
        translations: require('./locales'),
        components: {
            storage: require('./components/storage'),
            'items': require('./components/items')
        },
        methods: {
            callPicker: function(method) {
                if (messaging) {
                    messaging.call.apply(messaging, arguments);
                }
            },
            cancel: function() {
                this.callPicker('picker.modal.close');
            },
            pick: function() {
                this.callPicker('picker.picked', this.config.picker.multiple ? this.selection.picked : this.selection.picked[0])
            }
        }
    });
}
