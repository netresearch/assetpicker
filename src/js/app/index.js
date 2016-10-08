var Vue = require('vue');

Vue.use(require('vue-resource'));

var i18nMixin = require('vue-i18n-mixin');
i18nMixin.methods.t = i18nMixin.methods.translate;
delete i18nMixin.methods.translate;
Vue.mixin(i18nMixin);

Vue.http.interceptors.push(function(options, next) {
    this.$root.loading++;
    next(function(response) {
        this.$root.loading--;
    });
});

var scriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
})();

var Util = require('./util');
require('./components/tree');

var extend = require('extend');

var storageComponent = require('./components/storage');

module.exports = Vue.extend({
    template: require('./index.html'),
    data: function () {
        return {
            picked: require('./model/pick'),
            selection: require('./model/selection'),
            maximized: false,
            loading: 0, // In/decreased by http interceptor above
            config: undefined,
            loaded: false,
            isLogin: false
        }
    },
    translations: require('./locales'),
    computed: {
        numStorages: function () {
            return this.config && this.config.storages ? Object.keys(this.config.storages).length : 0;
        },
        locale: function () {
            var lang, available = ['en', 'de'];
            if (!this.config || this.config.language === 'auto') {
                lang = (navigator.language || navigator.userLanguage).replace(/^([a-z][a-z]).+$/, '$1');
            } else {
                lang = this.config.language;
            }
            if (available.indexOf(lang) < 0) {
                lang = available[0];
                if (this.config && this.config.language !== 'auto') {
                    console.warn('Configured language %s is not available', this.config.language);
                }
            }
            return lang;
        },
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
        storage: storageComponent,
        items: require('./components/items'),
        handle: require('./components/handle')
    },
    created: function () {
        if (!this.$options.messaging && window.parent && window.parent !== window) {
            var Messaging = require('../shared/util/messaging');
            this.$options.messaging = new Messaging('*', window.parent);
        }
        var config = require('./config');
        if (this.$options.config) {
            extend(true, config, this.$options.config);
        }
        if (this.$options.messaging) {
            this.$options.messaging.registerServer('app', this);
            this.callPicker('getConfig').then(function(overrideConfig) {
                extend(true, config, overrideConfig);
                this.$dispatch('config-loaded', config);
            }.bind(this));
        } else {
            this.$dispatch('config-loaded', config);
        }
    },
    ready: function() {
        var resizeHandler = function() {
            this.$broadcast('resize');
        }.bind(this);
        window.addEventListener('resize', resizeHandler);
        this.$refs.handle.$on('move', resizeHandler);
    },
    events: {
        'config-loaded': function (config) {
            Vue.config.debug = config.debug;
            this.$set('config', config);
            this.$nextTick(function () {
                this.loadAdapters().then(function () {
                    this.loaded = true;
                    this.callPicker('_trigger', 'ready');
                });
            });
            return true;
        },
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
        loadAdapters: function () {
            return this.$promise(function (resolve, reject) {
                var baseAdapter = require('./adapter/base'),
                    loadAdapters = [],
                    loading = 0,
                    loaded = function () {
                        if (loading === 0) {
                            resolve();
                        }
                    };
                for (var storage in this.config.storages) {
                    if (this.config.storages.hasOwnProperty(storage)) {
                        var adapter = this.config.storages[storage].adapter;
                        if (!adapter) {
                            throw 'Missing adapter on storage ' + storage;
                        }
                        if (storageComponent.components[adapter]) {
                            continue;
                        }
                        if (!this.config.adapters.hasOwnProperty(adapter)) {
                            throw 'Adapter ' + adapter + ' is not configured';
                        }
                        this.config.storages[storage].description = this.config.storages[storage].description || null;
                        if (loadAdapters.indexOf(adapter) < 0) {
                            loadAdapters.push(adapter);
                            loading++;
                            (function (adapter, src) {
                                var name = 'AssetPickerAdapter' + adapter[0].toUpperCase() + adapter.substr(1);
                                if (!src.match(/^(https?:\/\/|\/)/)) {
                                    src = scriptURL.split('/').slice(0, -1).join('/') + '/' + src;
                                }
                                Util.loadScript(src, function () {
                                    if (!window[name]) {
                                        reject(name + ' could not be found');
                                    }
                                    var component = window[name];
                                    this.$options.translations[adapter] = component.translations;
                                    delete component.translations;
                                    component.extends = baseAdapter;
                                    storageComponent.component(adapter, component);
                                    this.$options.components.storage.component(adapter, window[name]);
                                    loading--;
                                    loaded();
                                }.bind(this));
                            }.bind(this))(adapter, this.config.adapters[adapter]);
                        }
                    }
                }
                loaded();
            });
        },
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
