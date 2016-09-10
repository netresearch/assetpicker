var Vue = require('vue');
Vue.config.debug = true;
Vue.use(require('vue-resource'));

var i18nMixin = require('vue-i18n-mixin');
i18nMixin.methods.t = i18nMixin.methods.translate;

Vue.mixin(i18nMixin);

require('./util');
require('./components/tree');

new Vue({
    el: '#app',
    data: function () {
        return {
            locale: 'de',
            config: require('./config'),
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
    ready: function() {
        if (!window.parent) {
            console.log('This script is intended to be included in an iframe');
        } else {
            this.postMessage('ready');
        }
    },
    methods: {
        postMessage: function(message) {
            window.parent.postMessage(message, '*');
        },
        cancel: function() {
            this.postMessage('cancel');
        }
    }
});
