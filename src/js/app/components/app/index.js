var Vue = require('vue');
var config = require('../../config');

Vue.config.debug = config.debug;

Vue.use(require('vue-resource'));

var i18nMixin = require('vue-i18n-mixin');
i18nMixin.methods.t = i18nMixin.methods.translate;
Vue.mixin(i18nMixin);

require('../../util');
require('../tree');
require('../loader');

module.exports = Vue.extend({
    template: require('./template.html'),
    data: function () {
        var Messaging = require('../../../shared/util/messaging');
        return {
            locale: (function () {
                var lang, available = ['en', 'de'];
                if (config.language === 'auto') {
                    lang = (navigator.language || navigator.userLanguage).replace(/^([a-z][a-z]).+$/, '$1');
                } else {
                    lang = config.language;
                }
                if (available.indexOf(lang) < 0) {
                    lang = available[0];
                    if (config.language !== 'auto') {
                        console.warn('Configured language %s is not available', config.language);
                    }
                }
                return lang;
            })(),
            config: config,
            picked: require('../../model/pick'),
            selection: require('../../model/selection'),
            numStorages: Object.keys(config.storages).length,
            maximized: false,
            loading: 0 // In/decreased by components/loader.js
        }
    },
    translations: require('../../locales'),
    computed: {
        summary: function () {
            var summary = {numItems: 0, numStorages: 0},
                getLength = function (items) {
                    if (items.total) {
                        var length = items.total;
                        for (var i = 0, l = items.length; i < l; i++) {
                            if (items[i].query !== items.query && this.visible(items[i])) {
                                length++;
                            }
                        }
                        return length;
                    } else {
                        return items.filter(this.visible).length;
                    }
                }.bind(this);
            if (this.selection.search) {
                for (var key in this.selection.results) {
                    if (this.selection.results.hasOwnProperty(key)) {
                        var l = getLength(this.selection.results[key]);
                        summary.numItems += l;
                        if (l > 0) {
                            summary.numStorages++;
                        }
                    }
                }
            } else {
                summary.numItems = getLength(this.selection.items);
            }
            return summary;
        }
    },
    components: {
        storage: require('../storage'),
        'items': require('../items'),
        handle: require('../handle')
    },
    created: function () {
        if (this.$options.messaging) {
            this.$options.messaging.registerServer('app', this);
            this.callPicker('_trigger', 'ready');
        }
    },
    ready: function () {
        this.$el.className += (this.$el.className ? ' ' : '') + 'loaded';
    },
    events: {
        'finish-pick': function () {
            this.pick();
        }
    },
    watch: {
        maximized: function (maximized) {
            this.callPicker('_trigger', 'resize', maximized);
        }
    },
    methods: {
        visible: function (item) {
            return item.type !== 'file' || this.picked.isAllowed(item);
        },
        setPickConfig: function (config) {
            this.config.pick = config;
        },
        callPicker: function(method) {
            if (this.$options.messaging) {
                var args = Array.prototype.slice.call(arguments, 0);
                args[0] = 'picker.' + args[0];
                return this.$options.messaging.call.apply(this.$options.messaging, args);
            }
        },
        cancel: function() {
            this.picked.clear();
            this.callPicker('modal.close');
        },
        pick: function() {
            this.callPicker('pick', this.picked.export());
            this.picked.clear();
        }
    }
});