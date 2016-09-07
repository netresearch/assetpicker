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
            config: require('./config')
        }
    },
    translations: require('./locales'),
    methods: {
    },
    components: {
        storage: require('./components/storage'),
        'items-grid': require('./components/items/grid')
    }
});